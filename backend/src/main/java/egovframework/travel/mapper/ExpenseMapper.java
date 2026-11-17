package egovframework.travel.mapper;

import egovframework.travel.vo.ExpenseVO;
import org.egovframe.rte.psl.dataaccess.mapper.Mapper;

import java.util.List;
import java.util.Map;

/**
 * 회비 정산 MyBatis Mapper Interface
 */
@Mapper("expenseMapper")
public interface ExpenseMapper {
    List<ExpenseVO> selectExpenseList(int groupId);
    long selectTotalExpenseAmount(int groupId);
    int insertExpense(ExpenseVO vo);
    int insertExpenseParticipants(List<Map<String, Object>> participants);
    int deleteExpense(int settlementId);
}

