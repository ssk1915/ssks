package egovframework.travel.service;

import egovframework.travel.vo.ExpenseVO;
import java.util.List;

/**
 * [메뉴 3] 회비 정산 비즈니스 서비스 인터페이스
 */
public interface ExpenseService {
    /**
     * 특정 모임의 회비 지출 영수증 목록 조회
     */
    List<ExpenseVO> getExpenseList(int groupId) throws Exception;

    /**
     * 회비 지출 영수증 신규 등록 (선결제자, 금액, 회비 분할 계산)
     */
    int addExpense(ExpenseVO vo) throws Exception;

    /**
     * 회비 지출 영수증 삭제
     */
    int removeExpense(int settlementId) throws Exception;
}

