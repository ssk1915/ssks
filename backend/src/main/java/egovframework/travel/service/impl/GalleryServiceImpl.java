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

