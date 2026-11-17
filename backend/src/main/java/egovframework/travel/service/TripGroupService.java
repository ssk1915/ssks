package egovframework.travel.service;

import egovframework.travel.vo.TripGroupVO;
import java.util.List;

/**
 * [메뉴 1] 여행 모임 관리 비즈니스 서비스 인터페이스
 */
public interface TripGroupService {
    /**
     * 여행 모임 목록 조회 (국내/해외/내여행 필터 및 키워드 검색)
     */
    List<TripGroupVO> getTripGroupList(TripGroupVO vo) throws Exception;

    /**
     * 여행 모임 상세 조회
     */
    TripGroupVO getTripGroupDetail(int groupId) throws Exception;

    /**
     * 신규 여행 모임 개설 (개설자는 방장 LEADER로 자동 등록)
     */
    int createTripGroup(TripGroupVO vo) throws Exception;

    /**
     * 여행 모임 참여 신청 (정원 초과 방어 검증)
     */
    boolean joinTripGroup(int groupId, int memberId) throws Exception;

    /**
     * 여행 모임 참여 취소
     */
    boolean cancelJoinTripGroup(int groupId, int memberId) throws Exception;

    /**
     * 여행 모임 삭제 (방장 권한 전용)
     */
    boolean deleteTripGroup(int groupId, int memberId) throws Exception;
}
