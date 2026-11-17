package egovframework.travel.common.util;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;

/**
 * [공통 모듈] 날짜 및 시간 공통 유틸리티
 */
public class DateUtil {

    public static final String DATE_FORMAT = "yyyy-MM-dd";
    public static final String DATETIME_FORMAT = "yyyy-MM-dd HH:mm:ss";

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern(DATE_FORMAT);
    private static final DateTimeFormatter DATETIME_FORMATTER = DateTimeFormatter.ofPattern(DATETIME_FORMAT);

    public static String getCurrentDate() {
        return LocalDate.now().format(DATE_FORMATTER);
    }

    public static String getCurrentDateTime() {
        return LocalDateTime.now().format(DATETIME_FORMATTER);
    }

    public static long calculateDday(String targetDateStr) {
        if (targetDateStr == null || targetDateStr.trim().isEmpty()) {
            return 0;
        }
        try {
            LocalDate target = LocalDate.parse(targetDateStr.trim(), DATE_FORMATTER);
            return ChronoUnit.DAYS.between(LocalDate.now(), target);
        } catch (Exception e) {
            return 0;
        }
    }
}

