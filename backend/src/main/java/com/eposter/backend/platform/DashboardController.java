package com.eposter.backend.platform;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "http://localhost:5173")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/stats")
    @PreAuthorize("permitAll()")
    public ResponseEntity<DashboardDTO> getDashboardStats(org.springframework.security.core.Authentication authentication) {
        if (authentication != null && authentication.isAuthenticated() && !"anonymousUser".equals(authentication.getName())) {
            String username = authentication.getName();
            boolean isManager = authentication.getAuthorities().stream()
                    .anyMatch(a -> "ROLE_EVENT_MANAGER".equals(a.getAuthority()));
            return ResponseEntity.ok(dashboardService.getDashboardStatsForUser(username, isManager));
        }
        return ResponseEntity.ok(dashboardService.getDashboardStats());
    }
}
