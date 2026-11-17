package egovframework.travel.mapper;

import egovframework.travel.vo.LoginVO;
import egovframework.travel.vo.MemberVO;
import org.egovframe.rte.psl.dataaccess.mapper.Mapper;

import java.util.List;
import java.util.Map;

/**
 * 회원 MyBatis Mapper Interface
 * 규칙: 테이블명 및 컬럼명 대문자(MEMBER, MEMBER_ID, USERNAME, PASSWORD, ...)
 */
@Mapper("memberMapper")
public interface MemberMapper {
    LoginVO selectMemberByLogin(Map<String, Object> param);
    List<LoginVO> selectMemberList();
    MemberVO selectMemberByUsername(String username);
    int countByUsername(String username);
    int countByEmail(String email);
    int insertMember(MemberVO memberVO);
}
