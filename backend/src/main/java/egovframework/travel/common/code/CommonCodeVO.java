package egovframework.travel.common.code;

import java.io.Serializable;
import java.sql.Timestamp;

/**
 * [공통 코드] 공통 코드 Value Object
 */
public class CommonCodeVO implements Serializable {
    private static final long serialVersionUID = 1L;

    private String groupCode;
    private String groupName;
    private String codeId;
    private String codeName;
    private int sortOrder;
    private String isActive;
    private Timestamp createdAt;
    private Timestamp updatedAt;

    public String getGroupCode() { return groupCode; }
    public void setGroupCode(String groupCode) { this.groupCode = groupCode; }

    public String getGroupName() { return groupName; }
    public void setGroupName(String groupName) { this.groupName = groupName; }

    public String getCodeId() { return codeId; }
    public void setCodeId(String codeId) { this.codeId = codeId; }

    public String getCodeName() { return codeName; }
    public void setCodeName(String codeName) { this.codeName = codeName; }

    public int getSortOrder() { return sortOrder; }
    public void setSortOrder(int sortOrder) { this.sortOrder = sortOrder; }

    public String getIsActive() { return isActive; }
    public void setIsActive(String isActive) { this.isActive = isActive; }

    public Timestamp getCreatedAt() { return createdAt; }
    public void setCreatedAt(Timestamp createdAt) { this.createdAt = createdAt; }

    public Timestamp getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Timestamp updatedAt) { this.updatedAt = updatedAt; }
}

