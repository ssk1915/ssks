package egovframework.travel.vo;

import java.io.Serializable;
import java.sql.Date;
import java.sql.Timestamp;

/**
 * 여행 모임 Value Object
 */
public class TripGroupVO implements Serializable {
    private static final long serialVersionUID = 1L;

    private int groupId;
    private String groupName;
    private String tripType;        // 국내, 해외
    private String location;
    private Date startDate;
    private Date endDate;
    private int maxMembers;
    private String estimatedBudget;
    private String description;
    private String imageUrl;
    private String status;
    private int createdBy;
    private String creatorName;
    private int currentMembers;
    private Timestamp createdAt;    // 등록일시
    private Timestamp updatedAt;    // 수정일시

    // 검색 조건용
    private String searchKeyword;

    public int getGroupId() { return groupId; }
    public void setGroupId(int groupId) { this.groupId = groupId; }

    public String getGroupName() { return groupName; }
    public void setGroupName(String groupName) { this.groupName = groupName; }

    public String getTripType() { return tripType; }
    public void setTripType(String tripType) { this.tripType = tripType; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public Date getStartDate() { return startDate; }
    public void setStartDate(Date startDate) { this.startDate = startDate; }

    public Date getEndDate() { return endDate; }
    public void setEndDate(Date endDate) { this.endDate = endDate; }

    public int getMaxMembers() { return maxMembers; }
    public void setMaxMembers(int maxMembers) { this.maxMembers = maxMembers; }

    public String getEstimatedBudget() { return estimatedBudget; }
    public void setEstimatedBudget(String estimatedBudget) { this.estimatedBudget = estimatedBudget; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public int getCreatedBy() { return createdBy; }
    public void setCreatedBy(int createdBy) { this.createdBy = createdBy; }

    public String getCreatorName() { return creatorName; }
    public void setCreatorName(String creatorName) { this.creatorName = creatorName; }

    public int getCurrentMembers() { return currentMembers; }
    public void setCurrentMembers(int currentMembers) { this.currentMembers = currentMembers; }

    public Timestamp getCreatedAt() { return createdAt; }
    public void setCreatedAt(Timestamp createdAt) { this.createdAt = createdAt; }

    public Timestamp getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Timestamp updatedAt) { this.updatedAt = updatedAt; }

    public String getSearchKeyword() { return searchKeyword; }
    public void setSearchKeyword(String searchKeyword) { this.searchKeyword = searchKeyword; }
}

