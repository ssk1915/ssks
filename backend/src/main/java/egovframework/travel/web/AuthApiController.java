package egovframework.travel.web;

import egovframework.travel.service.MemberService;
import egovframework.travel.vo.LoginVO;
import egovframework.travel.vo.MemberVO;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;
import java.net.NetworkInterface;
import java.util.*;

/**
 * [메뉴 5] 회원 인증 및 세션 관리 RESTful API 컨트롤러
 * - 회원 가입 (비밀번호 SHA-256 해시, 전화번호 AES 암호화)
 * - 로그인/로그아웃 및 세션 상태 확인
 * - 아이디 중복 확인
 * - 현재 컴퓨터 MAC 주소 기반 클라이언트 인포 및 테스트 계정 노출 제한
 */
@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthApiController {

    private static final Logger log = LoggerFactory.getLogger(AuthApiController.class);

    // 현재 컴퓨터의 허용된 MAC 주소 화이트리스트
    private static final Set<String> ALLOWED_MACS = new HashSet<>(Arrays.asList(
            "6c:7e:67:c3:21:e7",
            "02:00:00:00:00:00"
    ));

    @Autowired
    private MemberService memberService;

    /**
     * GET /api/auth/client-info
     * 현재 컴퓨터의 MAC 주소 및 로컬 여부를 확인하여 테스트 계정 표시 권한 판별
     */
    @GetMapping("/client-info")
    public ResponseEntity<Map<String, Object>> getClientInfo(HttpServletRequest request) {
        Map<String, Object> res = new HashMap<>();
        String clientIp = request.getRemoteAddr();
        boolean isLocal = "127.0.0.1".equals(clientIp) || "0:0:0:0:0:0:0:1".equals(clientIp) || "localhost".equalsIgnoreCase(clientIp);

        Set<String> hostMacs = new HashSet<>();
        try {
            Enumeration<NetworkInterface> interfaces = NetworkInterface.getNetworkInterfaces();
            while (interfaces != null && interfaces.hasMoreElements()) {
                NetworkInterface ni = interfaces.nextElement();
                byte[] macBytes = ni.getHardwareAddress();
                if (macBytes != null) {
                    StringBuilder sb = new StringBuilder();
                    for (int i = 0; i < macBytes.length; i++) {
                        sb.append(String.format("%02x%s", macBytes[i], (i < macBytes.length - 1) ? ":" : ""));
                    }
                    hostMacs.add(sb.toString().toLowerCase());
                }
            }
        } catch (Exception ignored) {}

        boolean macMatched = false;
        String matchedMac = "unknown";
        for (String m : hostMacs) {
            if (ALLOWED_MACS.contains(m)) {
                macMatched = true;
                matchedMac = m;
                break;
            }
        }

        boolean showTestAccounts = macMatched && isLocal;
        res.put("success", true);
        res.put("clientIp", clientIp);
        res.put("isLocal", isLocal);
        res.put("macAddress", matchedMac);
        res.put("showTestAccounts", showTestAccounts);
        res.put("message", showTestAccounts ? "인증된 로컬 개발 머신입니다." : "외부 접속 또는 미인가 장치입니다.");

        return ResponseEntity.ok(res);
    }

    /**
     * POST /api/auth/register
     * Request Body: { "username": "...", "password": "...", "name": "...", "email": "...", "phone": "..." }
     */
    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(
            @RequestBody Map<String, String> body,
            HttpSession session) {

        Map<String, Object> res = new HashMap<>();

        try {
            String username = body.get("username");
            String password = body.get("password");
            String name = body.get("name");
            String email = body.get("email");
            String phone = body.get("phone");

            log.info("📢 [POST /api/auth/register] 회원가입 요청 - username: {}, name: {}, email: {}", username, name, email);

            if (username == null || username.trim().isEmpty() ||
                password == null || password.trim().isEmpty() ||
                name == null || name.trim().isEmpty() ||
                email == null || email.trim().isEmpty()) {
                res.put("success", false);
                res.put("message", "아이디, 비밀번호, 이름, 이메일은 필수 입력 사항입니다.");
                return ResponseEntity.badRequest().body(res);
            }

            MemberVO memberVO = new MemberVO();
            memberVO.setUsername(username.trim());
            memberVO.setPassword(password.trim());
            memberVO.setName(name.trim());
            memberVO.setEmail(email.trim());
            memberVO.setPhone(phone != null ? phone.trim() : "");

            int memberId = memberService.registerMember(memberVO);

            // 회원가입 성공 시 자동 로그인 세션 생성
            LoginVO loginVO = new LoginVO();
            loginVO.setMemberId(memberId);
            loginVO.setUsername(memberVO.getUsername());
            loginVO.setName(memberVO.getName());
            loginVO.setEmail(memberVO.getEmail());
            loginVO.setAdmin(false);
            session.setAttribute("LOGIN_USER", loginVO);

            res.put("success", true);
            res.put("message", "회원가입이 성공적으로 완료되었습니다.");
            res.put("memberId", memberId);
            res.put("username", memberVO.getUsername());
            res.put("name", memberVO.getName());
            res.put("email", memberVO.getEmail());
            return ResponseEntity.status(201).body(res);

        } catch (IllegalArgumentException | IllegalStateException e) {
            res.put("success", false);
            res.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(res);
        } catch (Exception e) {
            res.put("success", false);
            res.put("message", "회원가입 처리 중 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.status(500).body(res);
        }
    }

    /**
     * GET /api/auth/check-username?username=...
     */
    @GetMapping("/check-username")
    public ResponseEntity<Map<String, Object>> checkUsername(@RequestParam("username") String username) {
        Map<String, Object> res = new HashMap<>();
        try {
            boolean available = memberService.isUsernameAvailable(username);
            res.put("success", true);
            res.put("available", available);
            res.put("message", available ? "사용 가능한 아이디입니다." : "이미 사용 중인 아이디입니다.");
            return ResponseEntity.ok(res);
        } catch (Exception e) {
            res.put("success", false);
            res.put("message", e.getMessage());
            return ResponseEntity.status(500).body(res);
        }
    }

    /**
     * POST /api/auth/login
     */
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(
            @RequestBody Map<String, String> body,
            HttpSession session) throws Exception {

        String username = body.get("username");
        String password = body.get("password");

        log.info("📢 [POST /api/auth/login] 로그인 시도 - username: {}", username);

        Map<String, Object> res = new HashMap<>();

        if (username == null || password == null) {
            log.warn("   로그인 실패: 아이디 또는 비밀번호 누락");
            res.put("success", false);
            res.put("message", "아이디와 비밀번호를 입력하세요.");
            return ResponseEntity.badRequest().body(res);
        }

        LoginVO loginVO = memberService.login(username, password);

        if (loginVO == null) {
            log.warn("   로그인 실패: 계정 불일치 (username: {})", username);
            res.put("success", false);
            res.put("message", "아이디 또는 비밀번호가 올바르지 않습니다.");
            return ResponseEntity.ok(res);
        }

        // 세션에 로그인 정보 저장
        session.setAttribute("LOGIN_USER", loginVO);
        log.info("   로그인 성공 - username: {}, name: {}, isAdmin: {}", loginVO.getUsername(), loginVO.getName(), loginVO.isAdmin());

        res.put("success", true);
        res.put("memberId", loginVO.getMemberId());
        res.put("username", loginVO.getUsername());
        res.put("name", loginVO.getName());
        res.put("email", loginVO.getEmail());
        res.put("isAdmin", loginVO.isAdmin());
        return ResponseEntity.ok(res);
    }

    /**
     * POST /api/auth/logout
     */
    @PostMapping("/logout")
    public ResponseEntity<Map<String, Object>> logout(HttpSession session) {
        log.info("📢 [POST /api/auth/logout] 로그아웃 요청");
        session.invalidate();
        Map<String, Object> res = new HashMap<>();
        res.put("success", true);
        return ResponseEntity.ok(res);
    }

    /**
     * GET /api/auth/me - 현재 로그인 세션 확인
     */
    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> me(HttpSession session) {
        LoginVO loginVO = (LoginVO) session.getAttribute("LOGIN_USER");
        Map<String, Object> res = new HashMap<>();
        if (loginVO == null) {
            res.put("loggedIn", false);
        } else {
            res.put("loggedIn", true);
            res.put("memberId", loginVO.getMemberId());
            res.put("username", loginVO.getUsername());
            res.put("name", loginVO.getName());
            res.put("isAdmin", loginVO.isAdmin());
        }
        return ResponseEntity.ok(res);
    }
}
