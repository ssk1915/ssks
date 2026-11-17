package egovframework.travel.common.code;

/**
 * [공통 코드] 여행 구분 코드 (국내 / 해외)
 */
public enum TripType {
    DOMESTIC("DOMESTIC", "국내"),
    OVERSEAS("OVERSEAS", "해외");

    private final String code;
    private final String name;

    TripType(String code, String name) {
        this.code = code;
        this.name = name;
    }

    public String getCode() { return code; }
    public String getName() { return name; }

    public static TripType fromCode(String code) {
        for (TripType type : values()) {
            if (type.code.equalsIgnoreCase(code) || type.name.equals(code)) {
                return type;
            }
        }
        return DOMESTIC;
    }
}

