package com.akademi.controller;

import com.akademi.dto.request.NotificationPrefRequest;
import com.akademi.dto.response.ApiResponse;
import com.akademi.dto.response.NotificationPrefResponse;
import com.akademi.model.User;
import com.akademi.service.NotificationPrefService;
import com.akademi.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/notifications/preferences")
@RequiredArgsConstructor
public class NotificationPrefController {

    private final NotificationPrefService notificationPrefService;
    private final UserService userService;

    @GetMapping
    public ResponseEntity<ApiResponse<NotificationPrefResponse>> getPreferences(
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.getUserByEmail(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(
                notificationPrefService.getPreferences(user.getId())));
    }

    @PutMapping
    public ResponseEntity<ApiResponse<NotificationPrefResponse>> updatePreferences(
            @RequestBody NotificationPrefRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.getUserByEmail(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Preferences updated",
                notificationPrefService.updatePreferences(user.getId(), request, user)));
    }
}
