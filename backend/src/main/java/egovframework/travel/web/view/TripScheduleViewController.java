package egovframework.travel.web.view;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

/**
 * [화면 2] 여행 일정 플래너 화면 전용 컨트롤러 (1:1 매칭: planner.html)
 * - URL: /planner.do
 */
@Controller
public class TripScheduleViewController {

    private static final Logger log = LoggerFactory.getLogger(TripScheduleViewController.class);

    /**
     * 여행 일정 플래너 화면 매핑
     */
    @GetMapping("/planner.do")
    public String plannerView(
            @RequestParam(value = "groupId", required = false) String groupId,
            Model model) {
        log.info("🖥️ [화면 호출 - 1:1 컨트롤러] 일정 플래너 화면(planner.html) - groupId: {}", groupId);
        model.addAttribute("activeMenu", "planner");
        model.addAttribute("pageTitle", "TravelMates - 여행 일정 플래너");
        if (groupId != null) model.addAttribute("selectedGroupId", groupId);
        return "forward:/planner.html";
    }
}

