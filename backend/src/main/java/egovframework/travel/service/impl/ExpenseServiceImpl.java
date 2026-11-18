package egovframework.travel.service.impl;

import egovframework.travel.mapper.ExpenseMapper;
import egovframework.travel.service.ExpenseService;
import egovframework.travel.vo.ExpenseVO;

import org.egovframe.rte.fdl.cmmn.EgovAbstractServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * [메뉴 3] 회비 정산 비즈니스 서비스 구현체
 */
@Service("expenseService")
public class ExpenseServiceImpl extends EgovAbstractServiceImpl implements ExpenseService {

    @Autowired
    private ExpenseMapper expenseMapper;

    @Override
    public List<ExpenseVO> getExpenseList(int groupId) throws Exception {
        return expenseMapper.selectExpenseList(groupId);
    }

    @Override
    @Transactional
    public int addExpense(ExpenseVO vo) throws Exception {
        // 1. 지출 영수증 마스터 등록
        expenseMapper.insertExpense(vo);
        int settlementId = vo.getSettlementId();

        // 2. 참여자 회비 분할 계산 및 등록
        List<Map<String, Object>> participants = new ArrayList<>();
        List<Integer> memberIds = vo.getParticipantMemberIds();

        if (memberIds == null || memberIds.isEmpty()) {
            // 별도 참여자 지정이 없는 경우 결제자 1인 기본 등록
            Map<String, Object> p = new HashMap<>();
            p.put("settlementId", settlementId);
            p.put("memberId", vo.getPayerId());
            p.put("splitAmount", vo.getExpenseAmount());
            participants.add(p);
        } else {
            long splitAmount = vo.getExpenseAmount() / memberIds.size();
            for (Integer mid : memberIds) {
                Map<String, Object> p = new HashMap<>();
                p.put("settlementId", settlementId);
                p.put("memberId", mid);
                p.put("splitAmount", splitAmount);
                participants.add(p);
            }
        }

        if (!participants.isEmpty()) {
            expenseMapper.insertExpenseParticipants(participants);
        }

        return settlementId;
    }

    @Override
    @Transactional
    public int removeExpense(int settlementId) throws Exception {
        return expenseMapper.deleteExpense(settlementId);
    }
}
