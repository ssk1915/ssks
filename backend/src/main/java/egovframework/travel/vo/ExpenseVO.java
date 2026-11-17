package egovframework.travel.vo;

import java.io.Serializable;
import java.sql.Timestamp;
import java.util.List;

/**
 * 지출 정산 영수증 Value Object
 */
public class ExpenseVO implements Serializable {
    private static final long serialVersionUID = 1L;

    private int settlementId;
    private int groupId;
    private int payerId;
    private String payerName;
    private String title;
    private long expenseAmount;
    private String paymentMethod;
    private Timestamp createdAt;    // 등록일시
    private Timestamp updatedAt;    // 수정일시
    private String participantNames;
    private int participantCount;
    private List<Integer> participantIds;
    private List<Integer> participantMemberIds;

    public int getSettlementId() { return settlementId; }
    public void setSettlementId(int settlementId) { this.settlementId = settlementId; }

    public int getGroupId() { return groupId; }
    public void setGroupId(int groupId) { this.groupId = groupId; }

    public int getPayerId() { return payerId; }
    public void setPayerId(int payerId) { this.payerId = payerId; }

    public String getPayerName() { return payerName; }
    public void setPayerName(String payerName) { this.payerName = payerName; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public long getExpenseAmount() { return expenseAmount; }
    public void setExpenseAmount(long expenseAmount) { this.expenseAmount = expenseAmount; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

    public Timestamp getCreatedAt() { return createdAt; }
    public void setCreatedAt(Timestamp createdAt) { this.createdAt = createdAt; }

    public Timestamp getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Timestamp updatedAt) { this.updatedAt = updatedAt; }

    public String getParticipantNames() { return participantNames; }
    public void setParticipantNames(String participantNames) { this.participantNames = participantNames; }

    public int getParticipantCount() { return participantCount; }
    public void setParticipantCount(int participantCount) { this.participantCount = participantCount; }

    public List<Integer> getParticipantIds() {
        return participantIds != null ? participantIds : participantMemberIds;
    }
    public void setParticipantIds(List<Integer> participantIds) {
        this.participantIds = participantIds;
        if (this.participantMemberIds == null) {
            this.participantMemberIds = participantIds;
        }
    }

    public List<Integer> getParticipantMemberIds() {
        return participantMemberIds != null ? participantMemberIds : participantIds;
    }
    public void setParticipantMemberIds(List<Integer> participantMemberIds) {
        this.participantMemberIds = participantMemberIds;
        if (this.participantIds == null) {
            this.participantIds = participantMemberIds;
        }
    }
}

