package egovframework.travel.vo;

import java.io.Serializable;

/**
 * 로그인 요청/응답 Value Object
 */
public class LoginVO implements Serializable {
    private static final long serialVersionUID = 1L;

    private int memberId;
    private String username;
    private String password;
    private String name;
    private String email;
    private boolean isAdmin;

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

    public boolean isAdmin() { return isAdmin; }
    public boolean getIsAdmin() { return isAdmin; }
    public void setAdmin(boolean admin) { this.isAdmin = admin; }
    public void setIsAdmin(boolean isAdmin) { this.isAdmin = isAdmin; }
    public void setIsAdmin(int isAdmin) { this.isAdmin = (isAdmin == 1); }
}

