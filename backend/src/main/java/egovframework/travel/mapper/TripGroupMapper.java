package egovframework.travel.mapper;

import egovframework.travel.vo.TripGroupVO;
import org.egovframe.rte.psl.dataaccess.mapper.Mapper;

import java.util.List;
import java.util.Map;

/**
 * 여행 모임 MyBatis Mapper Interface
 */
@Mapper("tripGroupMapper")
public interface TripGroupMapper {
    List<TripGroupVO> selectTripGroupList(TripGroupVO vo);
    TripGroupVO selectTripGroupDetail(int groupId);
    int insertTripGroup(TripGroupVO vo);
    int insertTripMember(Map<String, Object> param);
    int deleteTripMember(Map<String, Object> param);
    int deleteTripGroup(int groupId);
}

