package egovframework.travel.web.view;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

/**
 * [화면 3] 회비 정산기 화면 전용 컨트롤러 (1:1 매칭: settlement.html)
 * - URL: /settlement.do
 */
@Controller
public class ExpenseSettlementViewController {

    private static final Logger log = LoggerFactory.getLogger(ExpenseSettlementViewController.class);

    /**
     * 회비 정산 화면 매핑
     */
    @GetMapping("/settlement.do")
    public String settlementView(
            @RequestParam(value = "groupId", required = false) String groupId,
            Model model) {
        log.info("🖥️ [화면 호출 - 1:1 컨트롤러] 회비 정산 화면(settlement.html) - groupId: {}", groupId);
        model.addAttribute("activeMenu", "settlement");
        model.addAttribute("pageTitle", "TravelMates - 스마트 회비 정산기");
        if (groupId != null) model.addAttribute("selectedGroupId", groupId);
        return "forward:/settlement.html";
    }
}

