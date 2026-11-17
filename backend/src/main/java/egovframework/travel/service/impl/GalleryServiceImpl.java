package egovframework.travel.service.impl;

import egovframework.travel.service.GalleryService;
import org.egovframe.rte.fdl.cmmn.EgovAbstractServiceImpl;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * [메뉴 4] 추억 사진 갤러리 피드 비즈니스 서비스 구현체
 */
@Service("galleryService")
public class GalleryServiceImpl extends EgovAbstractServiceImpl implements GalleryService {

    // 스레드 안전한 인메모리 갤러리 피드 저장소
    private static final Map<Integer, List<Map<String, Object>>> GALLERY_STORE = new ConcurrentHashMap<>();

    static {
        // 제주도 모임 기본 샘플 피드
        List<Map<String, Object>> jejuPhotos = new ArrayList<>();
        Map<String, Object> p1 = new HashMap<>();
        p1.put("photoId", 1L);
        p1.put("groupId", 2);
        p1.put("imageUrl", "https://images.unsplash.com/photo-1548115184-bc6544d06a58?auto=format&fit=crop&w=800&q=80");
        p1.put("caption", "성산일출봉 정상에서 맞이한 아침 햇살 🌅");
        p1.put("uploaderName", "김민수");
        p1.put("likes", 12);
        jejuPhotos.add(p1);

        Map<String, Object> p2 = new HashMap<>();
        p2.put("photoId", 2L);
        p2.put("groupId", 2);
        p2.put("imageUrl", "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80");
        p2.put("caption", "함덕 에메랄드빛 바다 산책로 🏖️");
        p2.put("uploaderName", "이지연");
        p2.put("likes", 8);
        jejuPhotos.add(p2);

        GALLERY_STORE.put(2, jejuPhotos);

        // 방콕 모임 기본 샘플 피드
        List<Map<String, Object>> bkkPhotos = new ArrayList<>();
        Map<String, Object> bp1 = new HashMap<>();
        bp1.put("photoId", 101L);
        bp1.put("groupId", 1);
        bp1.put("imageUrl", "https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=800&q=80");
        bp1.put("caption", "방콕 왓아룬 사원의 환상적인 야경 🛕✨");
        bp1.put("uploaderName", "민수");
        bp1.put("likes", 15);
        bkkPhotos.add(bp1);
        GALLERY_STORE.put(1, bkkPhotos);
    }

    @Override
    public List<Map<String, Object>> getAllPhotos() throws Exception {
        List<Map<String, Object>> all = new ArrayList<>();
        for (List<Map<String, Object>> list : GALLERY_STORE.values()) {
            all.addAll(list);
        }
        return all;
    }

    @Override
    public List<Map<String, Object>> getPhotos(int groupId) throws Exception {
        if (groupId <= 0) {
            return getAllPhotos();
        }
        return GALLERY_STORE.getOrDefault(groupId, new ArrayList<>());
    }

    @Override
    public Map<String, Object> addPhoto(int groupId, Map<String, Object> body) throws Exception {
        List<Map<String, Object>> photos = GALLERY_STORE.computeIfAbsent(groupId, k -> new ArrayList<>());

        Map<String, Object> newPhoto = new HashMap<>();
        newPhoto.put("photoId", System.currentTimeMillis());
        newPhoto.put("groupId", groupId);
        newPhoto.put("imageUrl", body.get("imageUrl"));
        newPhoto.put("caption", body.get("caption"));
        newPhoto.put("uploaderName", body.getOrDefault("uploaderName", "나"));
        newPhoto.put("likes", 0);

        photos.add(0, newPhoto);
        return newPhoto;
    }

    @Override
    public int toggleLike(long photoId) throws Exception {
        for (List<Map<String, Object>> list : GALLERY_STORE.values()) {
            for (Map<String, Object> p : list) {
                if (String.valueOf(p.get("photoId")).equals(String.valueOf(photoId))) {
                    int likes = (int) p.getOrDefault("likes", 0) + 1;
                    p.put("likes", likes);
                    return likes;
                }
            }
        }
        return 1;
    }

    @Override
    public boolean deletePhoto(long photoId) throws Exception {
        boolean removed = false;
        for (List<Map<String, Object>> list : GALLERY_STORE.values()) {
            removed |= list.removeIf(p -> String.valueOf(p.get("photoId")).equals(String.valueOf(photoId)));
        }
        return removed;
    }
}

