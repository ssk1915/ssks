package egovframework.travel.web;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

/**
 * [화면 4] 추억 갤러리 피드 & 라이트박스 뷰어 화면 전용 컨트롤러 (1:1 매칭: gallery.html)
 * - URL: /gallery.do
 */
@Controller
public class GalleryViewController {

    private static final Logger log = LoggerFactory.getLogger(GalleryViewController.class);

    /**
     * 추억 갤러리 화면 매핑
     */
    @GetMapping("/gallery.do")
    public String galleryView(
            @RequestParam(value = "groupId", required = false) String groupId,
            Model model) {
        log.info("🖥️ [화면 호출 - 1:1 컨트롤러] 추억 갤러리 화면(gallery.html) - groupId: {}", groupId);
        model.addAttribute("activeMenu", "gallery");
        model.addAttribute("pageTitle", "TravelMates - 함께 만든 추억 갤러리");
        if (groupId != null) model.addAttribute("selectedGroupId", groupId);
        return "forward:/gallery.html";
    }
}

