package egovframework.travel.web.view;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

/**
 * [화면 1] 여행 모임 메인/탐색 화면 전용 컨트롤러 (1:1 매칭: index.html & groups.html)
 * - URL: /, /index.do, /groups.do
 */
@Controller
public class TripGroupViewController {

    private static final Logger log = LoggerFactory.getLogger(TripGroupViewController.class);

    /**
     * 메인 및 여행 모임 탐색 화면 매핑
     */
    @GetMapping({"/", "/index.do", "/groups.do"})
    public String indexView(
            @RequestParam(value = "tripType", required = false) String tripType,
            @RequestParam(value = "searchKeyword", required = false) String searchKeyword,
            Model model) {
        log.info("🖥️ [화면 호출 - 1:1 컨트롤러] 여행 모임 화면(groups.html/index.html) - tripType: {}, searchKeyword: {}", tripType, searchKeyword);
        model.addAttribute("activeMenu", "groups");
        model.addAttribute("pageTitle", "TravelMates - 함께 떠나는 설레는 여행 모임");
        if (tripType != null) model.addAttribute("selectedTripType", tripType);
        if (searchKeyword != null) model.addAttribute("searchKeyword", searchKeyword);
        return "forward:/index.html";
    }
}

