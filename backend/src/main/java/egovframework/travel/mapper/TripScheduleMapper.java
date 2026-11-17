package egovframework.travel.mapper;

import egovframework.travel.vo.TripScheduleVO;
import org.egovframe.rte.psl.dataaccess.mapper.Mapper;

import java.util.List;
import java.util.Map;

/**
 * 여행 일정 MyBatis Mapper Interface
 */
@Mapper("tripScheduleMapper")
public interface TripScheduleMapper {
    List<TripScheduleVO> selectScheduleList(Map<String, Object> param);
    TripScheduleVO selectScheduleDetail(int scheduleId);
    int insertSchedule(TripScheduleVO vo);
    int updateSchedule(TripScheduleVO vo);
    int deleteSchedule(int scheduleId);
}

