package egovframework.travel.service;

import java.util.List;
import java.util.Map;

/**
 * [메뉴 4] 추억 사진 갤러리 피드 비즈니스 서비스 인터페이스
 */
public interface GalleryService {
    /**
     * 전체 모임의 사진 목록 조회
     */
    List<Map<String, Object>> getAllPhotos() throws Exception;

    /**
     * 특정 모임의 사진 목록 조회
     */
    List<Map<String, Object>> getPhotos(int groupId) throws Exception;

    /**
     * 신규 사진 피드 업로드
     */
    Map<String, Object> addPhoto(int groupId, Map<String, Object> body) throws Exception;

    /**
     * 사진 좋아요 토글/증가
     */
    int toggleLike(long photoId) throws Exception;

    /**
     * 사진 삭제
     */
    boolean deletePhoto(long photoId) throws Exception;
}

