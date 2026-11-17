package egovframework.travel.common.code;

/**
 * [공통 코드] 회비 정산 결제 수단 코드 (신용/체크카드, 현금, 계좌이체)
 */
public enum PaymentMethod {
    CARD("CARD", "신용/체크카드"),
    CASH("CASH", "현금"),
    TRANSFER("TRANSFER", "계좌이체");

    private final String code;
    private final String name;

    PaymentMethod(String code, String name) {
        this.code = code;
        this.name = name;
    }

    public String getCode() { return code; }
    public String getName() { return name; }

    public static PaymentMethod fromCode(String code) {
        for (PaymentMethod method : values()) {
            if (method.code.equalsIgnoreCase(code) || method.name.equals(code)) {
                return method;
            }
        }
        return CARD;
    }
}

