package egovframework.travel.service.impl;

import egovframework.travel.mapper.MemberMapper;
import egovframework.travel.service.MemberService;
import egovframework.travel.util.CryptoUtil;
import egovframework.travel.vo.LoginVO;
import egovframework.travel.vo.MemberVO;
import org.egovframe.rte.fdl.cmmn.EgovAbstractServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

/**
 * 회원 가입 및 암호화 비즈니스 서비스 구현체
 */
@Service("memberService")
public class MemberServiceImpl extends EgovAbstractServiceImpl implements MemberService {

    @Autowired
    private MemberMapper memberMapper;

    @Override
    @Transactional
    public int registerMember(MemberVO memberVO) throws Exception {
        if (memberVO.getUsername() == null || memberVO.getUsername().trim().isEmpty()) {
            throw new IllegalArgumentException("아이디는 필수 입력값입니다.");
        }
        if (memberVO.getPassword() == null || memberVO.getPassword().trim().isEmpty()) {
            throw new IllegalArgumentException("비밀번호는 필수 입력값입니다.");
        }
        if (memberVO.getName() == null || memberVO.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("이름은 필수 입력값입니다.");
        }

        // 1. 아이디 중복 검사
        if (!isUsernameAvailable(memberVO.getUsername())) {
            throw new IllegalStateException("이미 사용 중인 아이디입니다.");
        }

        // 2. 이메일 중복 검사
        if (memberVO.getEmail() != null && !memberVO.getEmail().trim().isEmpty()) {
            if (!isEmailAvailable(memberVO.getEmail())) {
                throw new IllegalStateException("이미 등록된 이메일 주소입니다.");
            }
        }

        // 3. 비밀번호 SHA-256 해시 암호화 적용
        String rawPassword = memberVO.getPassword();
        String hashedPassword = CryptoUtil.hashPassword(rawPassword);
        memberVO.setPassword(hashedPassword);

        // 4. 전화번호 하이픈 유/무 판단 및 자동 생성 후 AES 양방향 암호화 적용
        if (memberVO.getPhone() != null && !memberVO.getPhone().trim().isEmpty()) {
            String normalizedPhone = normalizePhoneNumber(memberVO.getPhone());
            String encryptedPhone = CryptoUtil.encryptPhone(normalizedPhone);
            memberVO.setPhone(encryptedPhone);
        }

        // 기본 프로필 이미지 세팅
        if (memberVO.getProfileImage() == null || memberVO.getProfileImage().trim().isEmpty()) {
            memberVO.setProfileImage("https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80");
        }

        // 5. DB 등록 실행 (테이블명 MEMBER, 컬럼명 모두 대문자)
        memberMapper.insertMember(memberVO);
        return memberVO.getMemberId();
    }

    @Override
    public boolean isUsernameAvailable(String username) throws Exception {
        return memberMapper.countByUsername(username) == 0;
    }

    @Override
    public boolean isEmailAvailable(String email) throws Exception {
        return memberMapper.countByEmail(email) == 0;
    }

    @Override
    public LoginVO login(String username, String password) throws Exception {
        Map<String, Object> param = new HashMap<>();
        param.put("username", username);
        param.put("password", password);
        param.put("hashedPassword", CryptoUtil.hashPassword(password));
        return memberMapper.selectMemberByLogin(param);
    }

    /**
     * 전화번호 하이픈 유/무 판단 및 자동 생성 (표준화)
     */
    private String normalizePhoneNumber(String phone) {
        if (phone == null) return "";
        String raw = phone.replaceAll("[^0-9]", "");
        if (raw.isEmpty()) return phone;

        if (raw.startsWith("02")) {
            if (raw.length() <= 2) return raw;
            if (raw.length() <= 5) return raw.substring(0, 2) + "-" + raw.substring(2);
            if (raw.length() <= 9) return raw.substring(0, 2) + "-" + raw.substring(2, raw.length() - 4) + "-" + raw.substring(raw.length() - 4);
            String clean = raw.substring(0, Math.min(10, raw.length()));
            return clean.substring(0, 2) + "-" + clean.substring(2, 6) + "-" + clean.substring(6);
        }

        if (raw.length() <= 3) return raw;
        if (raw.length() <= 7) return raw.substring(0, 3) + "-" + raw.substring(3);
        if (raw.length() <= 10) return raw.substring(0, 3) + "-" + raw.substring(3, 6) + "-" + raw.substring(6);
        String clean = raw.substring(0, Math.min(11, raw.length()));
        return clean.substring(0, 3) + "-" + clean.substring(3, 7) + "-" + clean.substring(7);
    }
}

