package egovframework.travel.util;

import javax.crypto.Cipher;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Base64;

/**
 * 비밀번호 단방향 해시(SHA-256) 및 개인정보(전화번호) 양방향 암호화(AES) 유틸리티
 */
public class CryptoUtil {

    // AES 대칭키 (16바이트 고정 키)
    private static final String AES_KEY = "TravelMates2026!";
    private static final String AES_ALGO = "AES";

    /**
     * 비밀번호 SHA-256 해시 (단방향 암호화)
     * @param rawPassword 평문 비밀번호
     * @return 64자리 16진수 해시 문자열
     */
    public static String hashPassword(String rawPassword) {
        if (rawPassword == null || rawPassword.trim().isEmpty()) {
            return "";
        }
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] hashBytes = md.digest(rawPassword.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : hashBytes) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (Exception e) {
            throw new RuntimeException("비밀번호 암호화(SHA-256) 처리 중 오류 발생", e);
        }
    }

    /**
     * 전화번호 AES-128 암호화 (양방향 암호화)
     * @param plainText 평문 전화번호 (예: 010-1234-5678)
     * @return Base64 인코딩된 암호문
     */
    public static String encryptPhone(String plainText) {
        if (plainText == null || plainText.trim().isEmpty()) {
            return "";
        }
        try {
            SecretKeySpec secretKey = new SecretKeySpec(AES_KEY.getBytes(StandardCharsets.UTF_8), AES_ALGO);
            Cipher cipher = Cipher.getInstance("AES/ECB/PKCS5Padding");
            cipher.init(Cipher.ENCRYPT_MODE, secretKey);
            byte[] encrypted = cipher.doFinal(plainText.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(encrypted);
        } catch (Exception e) {
            throw new RuntimeException("전화번호 암호화(AES) 처리 중 오류 발생", e);
        }
    }

    /**
     * 전화번호 AES-128 복호화
     * @param cipherText Base64 인코딩된 암호문
     * @return 평문 전화번호
     */
    public static String decryptPhone(String cipherText) {
        if (cipherText == null || cipherText.trim().isEmpty()) {
            return "";
        }
        try {
            SecretKeySpec secretKey = new SecretKeySpec(AES_KEY.getBytes(StandardCharsets.UTF_8), AES_ALGO);
            Cipher cipher = Cipher.getInstance("AES/ECB/PKCS5Padding");
            cipher.init(Cipher.DECRYPT_MODE, secretKey);
            byte[] original = cipher.doFinal(Base64.getDecoder().decode(cipherText));
            return new String(original, StandardCharsets.UTF_8);
        } catch (Exception e) {
            // 이미 복호화된 문자열이거나 복호화 불가능한 경우 원본 반환 방어
            return cipherText;
        }
    }

    /**
     * 전화번호 마스킹 (010-****-1234 형태)
     */
    public static String maskPhone(String phone) {
        if (phone == null) return "";
        String clean = phone.replaceAll("[^0-9]", "");
        if (clean.length() == 11) {
            return clean.substring(0, 3) + "-****-" + clean.substring(7);
        } else if (clean.length() == 10) {
            return clean.substring(0, 3) + "-***-" + clean.substring(6);
        }
        return phone;
    }
}

