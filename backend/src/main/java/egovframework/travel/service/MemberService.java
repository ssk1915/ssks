package egovframework.travel.service;

import egovframework.travel.vo.LoginVO;
import egovframework.travel.vo.MemberVO;

/**
 * 회원 가입 및 인증 서비스 인터페이스
 */
public interface MemberService {
    /**
     * 회원 가입 (비밀번호 SHA-256 단방향 해시, 전화번호 AES 양방향 암호화)
     */
    int registerMember(MemberVO memberVO) throws Exception;

    /**
     * 아이디 중복 체크
     */
    boolean isUsernameAvailable(String username) throws Exception;

    /**
     * 이메일 중복 체크
     */
    boolean isEmailAvailable(String email) throws Exception;

    /**
     * 로그인 인증 (평문 및 해시된 비밀번호 모두 검증)
     */
    LoginVO login(String username, String password) throws Exception;
}

