package egovframework.travel.web;

import egovframework.travel.service.ExpenseService;
import egovframework.travel.vo.ExpenseVO;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * [메뉴 3] 회비 N빵 정산 RESTful API 컨트롤러 (settlement.html 연동)
 */
@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class ExpenseApiController {

    private static final Logger log = LoggerFactory.getLogger(ExpenseApiController.class);

    @Autowired
    private ExpenseService expenseService;

    /**
     * 1. 특정 여행 모임의 회비 지출 영수증 목록 조회
     * GET /api/groups/{groupId}/expenses
     */
    @GetMapping("/groups/{groupId}/expenses")
    public ResponseEntity<List<ExpenseVO>> getExpenses(@PathVariable("groupId") int groupId) throws Exception {
        log.info("📢 [GET /api/groups/{}/expenses] 지출 영수증 목록 조회", groupId);
        List<ExpenseVO> list = expenseService.getExpenseList(groupId);
        log.debug("   지출 내역 건수: {}건", list != null ? list.size() : 0);
        return ResponseEntity.ok(list);
    }

    /**
     * 2. 회비 지출 영수증 신규 등록 (선결제자, 금액, N빵 참가자 등)
     * POST /api/groups/{groupId}/expenses
     */
    @PostMapping("/groups/{groupId}/expenses")
    public ResponseEntity<Map<String, Object>> addExpense(
            @PathVariable("groupId") int groupId,
            @RequestBody ExpenseVO vo) throws Exception {
        log.info("📢 [POST /api/groups/{}/expenses] 영수증 등록 - title: {}, amount: {}", groupId, vo.getTitle(), vo.getExpenseAmount());
        vo.setGroupId(groupId);
        if (vo.getPayerId() == 0) {
            vo.setPayerId(1); // 기본 결제자 (로그인 회원)
        }
        expenseService.addExpense(vo);
        log.info("   영수증 등록 완료");
        Map<String, Object> res = new HashMap<>();
        res.put("success", true);
        return ResponseEntity.ok(res);
    }

    /**
     * 3. 회비 지출 영수증 삭제
     * DELETE /api/expenses/{settlementId}
     */
    @DeleteMapping("/expenses/{settlementId}")
    public ResponseEntity<Map<String, Object>> deleteExpense(@PathVariable("settlementId") int settlementId) throws Exception {
        log.info("📢 [DELETE /api/expenses/{}] 영수증 삭제 요청", settlementId);
        expenseService.removeExpense(settlementId);
        log.info("   영수증 삭제 완료 - settlementId: {}", settlementId);
        Map<String, Object> res = new HashMap<>();
        res.put("success", true);
        return ResponseEntity.ok(res);
    }
}

