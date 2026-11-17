package egovframework.travel.web;

import egovframework.travel.service.GalleryService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * [메뉴 4] 추억 갤러리 RESTful API 컨트롤러 (gallery.html 연동)
 */
@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class GalleryApiController {

    private static final Logger log = LoggerFactory.getLogger(GalleryApiController.class);

    @Autowired
    private GalleryService galleryService;

    /**
     * 0. 전체 사진 목록 조회
     * GET /api/photos
     */
    @GetMapping("/photos")
    public ResponseEntity<List<Map<String, Object>>> getAllPhotos() throws Exception {
        log.info("📢 [GET /api/photos] 전체 모임 사진 갤러리 조회");
        List<Map<String, Object>> photos = galleryService.getAllPhotos();
        return ResponseEntity.ok(photos);
    }

    /**
     * 1. 특정 모임의 사진 목록 조회
     * GET /api/groups/{groupId}/photos
     */
    @GetMapping("/groups/{groupId}/photos")
    public ResponseEntity<List<Map<String, Object>>> getPhotos(@PathVariable("groupId") int groupId) throws Exception {
        log.info("📢 [GET /api/groups/{}/photos] 사진 갤러리 조회", groupId);
        List<Map<String, Object>> photos = galleryService.getPhotos(groupId);
        log.debug("   사진 건수: {}건", photos != null ? photos.size() : 0);
        return ResponseEntity.ok(photos);
    }

    /**
     * 2. 사진 피드 업로드
     * POST /api/groups/{groupId}/photos
     */
    @PostMapping("/groups/{groupId}/photos")
    public ResponseEntity<Map<String, Object>> addPhoto(
            @PathVariable("groupId") int groupId,
            @RequestBody Map<String, Object> body) throws Exception {
        log.info("📢 [POST /api/groups/{}/photos] 사진 업로드 - caption: {}", groupId, body.get("caption"));
        Map<String, Object> newPhoto = galleryService.addPhoto(groupId, body);
        log.info("   사진 등록 완료 - photoId: {}", newPhoto != null ? newPhoto.get("photoId") : "null");

        Map<String, Object> res = new HashMap<>();
        res.put("success", true);
        res.put("photo", newPhoto);
        return ResponseEntity.ok(res);
    }

    /**
     * 3. 사진 좋아요 인터랙션
     * POST /api/photos/{photoId}/like
     */
    @PostMapping("/photos/{photoId}/like")
    public ResponseEntity<Map<String, Object>> toggleLike(@PathVariable("photoId") long photoId) throws Exception {
        log.info("📢 [POST /api/photos/{}/like] 사진 좋아요 클릭", photoId);
        int likes = galleryService.toggleLike(photoId);
        Map<String, Object> res = new HashMap<>();
        res.put("success", true);
        res.put("likes", likes);
        return ResponseEntity.ok(res);
    }

    /**
     * 4. 사진 삭제
     * DELETE /api/photos/{photoId}
     */
    @DeleteMapping("/photos/{photoId}")
    public ResponseEntity<Map<String, Object>> deletePhoto(@PathVariable("photoId") long photoId) throws Exception {
        log.info("📢 [DELETE /api/photos/{}] 사진 삭제 요청", photoId);
        boolean deleted = galleryService.deletePhoto(photoId);
        Map<String, Object> res = new HashMap<>();
        res.put("success", deleted);
        res.put("message", deleted ? "사진이 삭제되었습니다." : "사진을 찾을 수 없습니다.");
        return ResponseEntity.ok(res);
    }
}
