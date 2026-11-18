package egovframework.travel.web.api;

import egovframework.travel.service.TripGroupService;
import egovframework.travel.vo.TripGroupVO;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * [메뉴 1] 여행 모임 관리 RESTful API 컨트롤러 (groups.html 및 index.html 연동)
 */
@RestController
@RequestMapping("/api/groups")
@CrossOrigin(origins = "*")
public class TripGroupApiController {

    private static final Logger log = LoggerFactory.getLogger(TripGroupApiController.class);

    @Autowired
    private TripGroupService tripGroupService;

    /**
     * 1. 여행 모임 목록 조회 (국내/해외/내여행 필터 및 키워드 검색)
     * GET /api/groups
     */
    @GetMapping
    public ResponseEntity<List<TripGroupVO>> getGroupList(
            @RequestParam(value = "tripType", required = false) String tripType,
            @RequestParam(value = "searchKeyword", required = false) String searchKeyword) throws Exception {
        log.info("📢 [GET /api/groups] 여행 모임 목록 조회 요청 - tripType: {}, searchKeyword: {}", tripType, searchKeyword);
        TripGroupVO vo = new TripGroupVO();
        vo.setTripType(tripType);
        vo.setSearchKeyword(searchKeyword);
        List<TripGroupVO> list = tripGroupService.getTripGroupList(vo);
        log.debug("   조회 결과 건수: {}건", list != null ? list.size() : 0);
        return ResponseEntity.ok(list);
    }

    /**
     * 2. 여행 모임 상세 조회
     * GET /api/groups/{groupId}
     */
    @GetMapping("/{groupId}")
    public ResponseEntity<TripGroupVO> getGroupDetail(@PathVariable("groupId") int groupId) throws Exception {
        return ResponseEntity.ok(tripGroupService.getTripGroupDetail(groupId));
    }

    /**
     * 3. 여행 모임 신규 개설 (모집 인원, 예상 예산, 이미지 등)
     * POST /api/groups
     */
    @PostMapping
    public ResponseEntity<Map<String, Object>> createGroup(@RequestBody TripGroupVO vo) throws Exception {
        log.info("📢 [POST /api/groups] 신규 여행 모임 개설 요청 - name: {}, location: {}", vo.getGroupName(), vo.getLocation());
        if (vo.getCreatedBy() <= 0) {
            vo.setCreatedBy(1); // 기본 개설자 회원 ID
        }
        int newGroupId = tripGroupService.createTripGroup(vo);
        log.info("   신규 모임 등록 완료 - ID: {}", newGroupId);
        Map<String, Object> res = new HashMap<>();
        res.put("success", true);
        res.put("groupId", newGroupId);
        return ResponseEntity.ok(res);
    }

    /**
     * 4. 여행 모임 참여 신청 (정원 마감 여부 엄격 검증)
     * POST /api/groups/{groupId}/join
     */
    @PostMapping("/{groupId}/join")
    public ResponseEntity<Map<String, Object>> joinGroup(
            @PathVariable("groupId") int groupId,
            @RequestParam(value = "memberId", defaultValue = "1") int memberId) throws Exception {
        log.info("📢 [POST /api/groups/{}/join] 모임 참여 신청 - memberId: {}", groupId, memberId);
        boolean success = tripGroupService.joinTripGroup(groupId, memberId);
        Map<String, Object> res = new HashMap<>();
        res.put("success", success);
        if (!success) {
            log.warn("   모임 참여 실패: 모집 정원 마감 (groupId: {})", groupId);
            res.put("message", "모집 정원이 마감되어 더 이상 참여할 수 없습니다.");
            return ResponseEntity.badRequest().body(res);
        }
        log.info("   모임 참여 성공 (groupId: {})", groupId);
        return ResponseEntity.ok(res);
    }

    /**
     * 5. 여행 모임 참여 취소
     * POST /api/groups/{groupId}/leave
     */
    @PostMapping("/{groupId}/leave")
    public ResponseEntity<Map<String, Object>> leaveGroup(
            @PathVariable("groupId") int groupId,
            @RequestParam(value = "memberId", defaultValue = "1") int memberId) throws Exception {
        boolean success = tripGroupService.cancelJoinTripGroup(groupId, memberId);
        Map<String, Object> res = new HashMap<>();
        res.put("success", success);
        return ResponseEntity.ok(res);
    }

    /**
     * 6. 여행 모임 삭제 (방장 권한 전용)
     * DELETE /api/groups/{groupId}
     */
    @DeleteMapping("/{groupId}")
    public ResponseEntity<Map<String, Object>> deleteGroup(
            @PathVariable("groupId") int groupId,
            @RequestParam(value = "memberId", defaultValue = "0") int memberId) throws Exception {
        log.info("📢 [DELETE /api/groups/{}] 모임 삭제 요청 - memberId: {}", groupId, memberId);
        boolean success = tripGroupService.deleteTripGroup(groupId, memberId);
        Map<String, Object> res = new HashMap<>();
        res.put("success", success);
        res.put("message", success ? "모임이 성공적으로 삭제되었습니다." : "모임 삭제 권한이 없거나 존재하지 않는 모임입니다.");
        if (success) {
            log.info("   모임 삭제 성공 (groupId: {})", groupId);
        } else {
            log.warn("   모임 삭제 실패: 권한 없음 또는 모임 부재 (groupId: {})", groupId);
        }
        return ResponseEntity.ok(res);
    }
}

