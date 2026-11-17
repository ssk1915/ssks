package egovframework.travel.vo;

import java.io.Serializable;
import java.util.Date;

/**
 * 회원 정보 Value Object (MEMBER 테이블 매핑)
 * DB 컬럼명: MEMBER_ID, USERNAME, PASSWORD, NAME, EMAIL, PHONE, PROFILE_IMAGE, CREATED_AT
 */
public class MemberVO implements Serializable {
    private static final long serialVersionUID = 1L;

    private int memberId;
    private String username;
    private String password;
    private String name;
    private String email;
    private String phone;
    private String profileImage;
    private Date createdAt;
    private Date updatedAt;

    public int getMemberId() { return memberId; }
    public void setMemberId(int memberId) { this.memberId = memberId; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getProfileImage() { return profileImage; }
    public void setProfileImage(String profileImage) { this.profileImage = profileImage; }

    public Date getCreatedAt() { return createdAt; }
    public void setCreatedAt(Date createdAt) { this.createdAt = createdAt; }

    public Date getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Date updatedAt) { this.updatedAt = updatedAt; }
}

