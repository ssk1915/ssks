package egovframework.travel.web;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

/**
 * [화면 5] 총괄 관리자 패널(가입 회원 관리 & 일정 플래너) 화면 전용 컨트롤러 (1:1 매칭: admin.html)
 * - URL: /admin.do
 */
@Controller
public class AdminViewController {

    private static final Logger log = LoggerFactory.getLogger(AdminViewController.class);

    /**
     * 관리자 패널 종합 화면 매핑
     */
    @GetMapping("/admin.do")
    public String adminView(
            @RequestParam(value = "tab", required = false) String tab,
            Model model) {
        log.info("🖥️ [화면 호출 - 1:1 컨트롤러] 총괄 관리자 패널 화면(admin.html) - tab: {}", tab);
        model.addAttribute("activeMenu", "admin");
        model.addAttribute("pageTitle", "TravelMates - 총괄 관리자 콘솔");
        if (tab != null) model.addAttribute("selectedTab", tab);
        return "forward:/admin.html";
    }
}

