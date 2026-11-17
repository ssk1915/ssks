package egovframework.travel.service;

import egovframework.travel.vo.TripScheduleVO;
import java.util.List;

/**
 * [메뉴 2] 여행 일정 플래너 비즈니스 서비스 인터페이스
 */
public interface TripScheduleService {
    /**
     * 특정 모임의 일차별 또는 전체 일정 목록 조회
     */
    List<TripScheduleVO> getScheduleList(int groupId, Integer dayNumber) throws Exception;

    /**
     * 여행 일정 신규 등록 (장소명, 시간, 메모, 위경도 좌표 포함)
     */
    int addSchedule(TripScheduleVO vo) throws Exception;

    /**
     * 여행 일정 항목 수정 및 위치 사후 지정
     */
    int modifySchedule(TripScheduleVO vo) throws Exception;

    /**
     * 여행 일정 항목 삭제
     */
    int removeSchedule(int scheduleId) throws Exception;
}

