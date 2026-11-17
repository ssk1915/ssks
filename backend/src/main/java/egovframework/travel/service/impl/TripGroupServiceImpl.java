package egovframework.travel.service.impl;

import egovframework.travel.mapper.TripGroupMapper;
import egovframework.travel.service.TripGroupService;
import egovframework.travel.vo.TripGroupVO;

import org.egovframe.rte.fdl.cmmn.EgovAbstractServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * [메뉴 1] 여행 모임 관리 비즈니스 서비스 구현체
 */
@Service("tripGroupService")
public class TripGroupServiceImpl extends EgovAbstractServiceImpl implements TripGroupService {

    @Autowired
    private TripGroupMapper tripGroupMapper;

    @Override
    public List<TripGroupVO> getTripGroupList(TripGroupVO vo) throws Exception {
        return tripGroupMapper.selectTripGroupList(vo);
    }

    @Override
    public TripGroupVO getTripGroupDetail(int groupId) throws Exception {
        return tripGroupMapper.selectTripGroupDetail(groupId);
    }

    @Override
    @Transactional
    public int createTripGroup(TripGroupVO vo) throws Exception {
        // 1. 모임 기본 정보 등록
        tripGroupMapper.insertTripGroup(vo);

        // 2. 모임 개설자를 방장(LEADER)으로 등록
        Map<String, Object> memberParam = new HashMap<>();
        memberParam.put("groupId", vo.getGroupId());
        memberParam.put("memberId", vo.getCreatedBy());
        memberParam.put("role", "LEADER");
        tripGroupMapper.insertTripMember(memberParam);

        return vo.getGroupId();
    }

    @Override
    public boolean joinTripGroup(int groupId, int memberId) throws Exception {
        TripGroupVO group = tripGroupMapper.selectTripGroupDetail(groupId);
        if (group != null && group.getCurrentMembers() >= group.getMaxMembers()) {
            return false; // 모집 정원 마감 시 참여 차단
        }
        Map<String, Object> param = new HashMap<>();
        param.put("groupId", groupId);
        param.put("memberId", memberId);
        param.put("role", "MEMBER");
        return tripGroupMapper.insertTripMember(param) > 0;
    }

    @Override
    public boolean cancelJoinTripGroup(int groupId, int memberId) throws Exception {
        Map<String, Object> param = new HashMap<>();
        param.put("groupId", groupId);
        param.put("memberId", memberId);
        return tripGroupMapper.deleteTripMember(param) > 0;
    }

    @Override
    @Transactional
    public boolean deleteTripGroup(int groupId, int memberId) throws Exception {
        TripGroupVO group = tripGroupMapper.selectTripGroupDetail(groupId);
        if (group == null) {
            return false;
        }
        // memberId가 지정된 경우, 모임 개설자(방장) 또는 관리자(999) 권한 확인
        if (memberId > 0 && group.getCreatedBy() != memberId && memberId != 999) {
            return false;
        }
        return tripGroupMapper.deleteTripGroup(groupId) > 0;
    }
}
