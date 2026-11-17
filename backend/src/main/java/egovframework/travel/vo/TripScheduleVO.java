package egovframework.travel.vo;

import java.io.Serializable;
import java.sql.Timestamp;

/**
 * 여행 일정 타임라인 Value Object
 */
public class TripScheduleVO implements Serializable {
    private static final long serialVersionUID = 1L;

    private int scheduleId;
    private int groupId;
    private int dayNumber;
    private String planTime;
    private String place;
    private String memo;
    private Double latitude;
    private Double longitude;
    private Timestamp createdAt;    // 등록일시
    private Timestamp updatedAt;    // 수정일시

    public int getScheduleId() { return scheduleId; }
    public void setScheduleId(int scheduleId) { this.scheduleId = scheduleId; }

    public int getGroupId() { return groupId; }
    public void setGroupId(int groupId) { this.groupId = groupId; }

    public int getDayNumber() { return dayNumber; }
    public void setDayNumber(int dayNumber) { this.dayNumber = dayNumber; }

    public String getPlanTime() { return planTime; }
    public void setPlanTime(String planTime) { this.planTime = planTime; }

    public String getPlace() { return place; }
    public void setPlace(String place) { this.place = place; }

    public String getMemo() { return memo; }
    public void setMemo(String memo) { this.memo = memo; }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }

    public Timestamp getCreatedAt() { return createdAt; }
    public void setCreatedAt(Timestamp createdAt) { this.createdAt = createdAt; }

    public Timestamp getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Timestamp updatedAt) { this.updatedAt = updatedAt; }
}

