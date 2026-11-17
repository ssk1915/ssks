package egovframework.travel.web;

import egovframework.travel.service.TripScheduleService;
import egovframework.travel.vo.TripScheduleVO;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * [메뉴 2] 여행 일정 플래너 RESTful API 컨트롤러 (planner.html 연동)
 */
@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class TripScheduleApiController {

    private static final Logger log = LoggerFactory.getLogger(TripScheduleApiController.class);

    @Autowired
    private TripScheduleService tripScheduleService;

    /**
     * 1. 특정 모임의 일차별/전체 일정 목록 조회
     * GET /api/groups/{groupId}/schedules
     */
    @GetMapping("/groups/{groupId}/schedules")
    public ResponseEntity<List<TripScheduleVO>> getSchedules(
            @PathVariable("groupId") int groupId,
            @RequestParam(value = "day", required = false) Integer day) throws Exception {
        log.info("📢 [GET /api/groups/{}/schedules] 일정 목록 조회 - day: {}", groupId, day);
        List<TripScheduleVO> list = tripScheduleService.getScheduleList(groupId, day);
        log.debug("   일정 조회 건수: {}건", list != null ? list.size() : 0);
        return ResponseEntity.ok(list);
    }

    /**
     * 2. 여행 일정 신규 등록 (장소 및 위경도 LATITUDE, LONGITUDE 좌표 포함)
     * POST /api/groups/{groupId}/schedules
     */
    @PostMapping("/groups/{groupId}/schedules")
    public ResponseEntity<Map<String, Object>> addSchedule(
            @PathVariable("groupId") int groupId,
            @RequestBody TripScheduleVO vo) throws Exception {
        log.info("📢 [POST /api/groups/{}/schedules] 일정 등록 요청 - place: {}, dayNumber: {}, time: {}",
                groupId, vo.getPlace(), vo.getDayNumber(), vo.getPlanTime());
        vo.setGroupId(groupId);
        tripScheduleService.addSchedule(vo);
        log.info("   일정 등록 완료 - scheduleId: {}", vo.getScheduleId());
        Map<String, Object> res = new HashMap<>();
        res.put("success", true);
        res.put("scheduleId", vo.getScheduleId());
        res.put("latitude", vo.getLatitude());
        res.put("longitude", vo.getLongitude());
        return ResponseEntity.ok(res);
    }

    /**
     * 3. 여행 일정 수정 및 위치 좌표 사후 지정
     * PUT /api/schedules/{scheduleId}
     */
    @PutMapping("/schedules/{scheduleId}")
    public ResponseEntity<Map<String, Object>> updateSchedule(
            @PathVariable("scheduleId") int scheduleId,
            @RequestBody TripScheduleVO vo) throws Exception {
        log.info("📢 [PUT /api/schedules/{}] 일정 수정 요청 - place: {}, dayNumber: {}, time: {}",
                scheduleId, vo.getPlace(), vo.getDayNumber(), vo.getPlanTime());
        vo.setScheduleId(scheduleId);
        tripScheduleService.modifySchedule(vo);
        log.info("   일정 수정 완료 - scheduleId: {}", scheduleId);
        Map<String, Object> res = new HashMap<>();
        res.put("success", true);
        res.put("scheduleId", scheduleId);
        res.put("latitude", vo.getLatitude());
        res.put("longitude", vo.getLongitude());
        return ResponseEntity.ok(res);
    }

    /**
     * 4. 여행 일정 삭제
     * DELETE /api/schedules/{scheduleId}
     */
    @DeleteMapping("/schedules/{scheduleId}")
    public ResponseEntity<Map<String, Object>> deleteSchedule(@PathVariable("scheduleId") int scheduleId) throws Exception {
        log.info("📢 [DELETE /api/schedules/{}] 일정 삭제 요청", scheduleId);
        tripScheduleService.removeSchedule(scheduleId);
        log.info("   일정 삭제 완료 - scheduleId: {}", scheduleId);
        Map<String, Object> res = new HashMap<>();
        res.put("success", true);
        return ResponseEntity.ok(res);
    }
}

