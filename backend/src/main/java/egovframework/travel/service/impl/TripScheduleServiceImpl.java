package egovframework.travel.service.impl;

import egovframework.travel.mapper.TripScheduleMapper;
import egovframework.travel.service.TripScheduleService;
import egovframework.travel.vo.TripScheduleVO;

import org.egovframe.rte.fdl.cmmn.EgovAbstractServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * [메뉴 2] 여행 일정 플래너 비즈니스 서비스 구현체
 */
@Service("tripScheduleService")
public class TripScheduleServiceImpl extends EgovAbstractServiceImpl implements TripScheduleService {

    @Autowired
    private TripScheduleMapper tripScheduleMapper;

    @Override
    public List<TripScheduleVO> getScheduleList(int groupId, Integer dayNumber) throws Exception {
        Map<String, Object> param = new HashMap<>();
        param.put("groupId", groupId);
        param.put("dayNumber", dayNumber);
        return tripScheduleMapper.selectScheduleList(param);
    }

    @Override
    public int addSchedule(TripScheduleVO vo) throws Exception {
        return tripScheduleMapper.insertSchedule(vo);
    }

    @Override
    public int modifySchedule(TripScheduleVO vo) throws Exception {
        return tripScheduleMapper.updateSchedule(vo);
    }

    @Override
    public int removeSchedule(int scheduleId) throws Exception {
        return tripScheduleMapper.deleteSchedule(scheduleId);
    }
}

