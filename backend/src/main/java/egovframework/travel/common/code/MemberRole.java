package egovframework.travel.common.code;

/**
 * [공통 코드] 여행 모임 회원 역할 코드 (방장 / 일반회원)
 */
public enum MemberRole {
    LEADER("LEADER", "방장"),
    MEMBER("MEMBER", "일반회원");

    private final String code;
    private final String name;

    MemberRole(String code, String name) {
        this.code = code;
        this.name = name;
    }

    public String getCode() { return code; }
    public String getName() { return name; }

    public static MemberRole fromCode(String code) {
        for (MemberRole role : values()) {
            if (role.code.equalsIgnoreCase(code) || role.name.equals(code)) {
                return role;
            }
        }
        return MEMBER;
    }
}

