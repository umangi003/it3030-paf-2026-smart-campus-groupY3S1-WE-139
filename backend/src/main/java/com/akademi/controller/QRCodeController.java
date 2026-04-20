package com.akademi.controller;

import com.akademi.dto.response.ApiResponse;
import com.akademi.dto.response.QRVerifyResponse;
import com.akademi.model.Booking;
import com.akademi.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/qr")
@RequiredArgsConstructor
public class QRCodeController {

    private final BookingService bookingService;

    // Fix 5: now calls verifyAndCheckIn() which saves checkedInAt to the DB
    // Fix 6: this endpoint is already public in SecurityConfig (/qr/verify/**)
    //        The frontend route fix (App.jsx) makes the PAGE public too
    @GetMapping("/verify/{token}")
    public ResponseEntity<ApiResponse<QRVerifyResponse>> verifyQRToken(@PathVariable String token) {
        try {
            // This saves the check-in if valid — the returned booking has checkedInAt set
            Booking booking = bookingService.verifyAndCheckIn(token);

            boolean isExpired = booking.getQrTokenExpiry() != null &&
                    booking.getQrTokenExpiry().isBefore(LocalDateTime.now());
            boolean checkedIn = booking.getCheckedInAt() != null;

            // isValid: the check-in was just recorded (not expired, and now has a checkedInAt)
            boolean isValid = !isExpired && checkedIn;

            String message;
            if (isExpired) {
                message = "QR token has expired";
            } else if (isValid) {
                message = "Check-in recorded successfully";
            } else {
                message = "Invalid booking status";
            }

            QRVerifyResponse response = QRVerifyResponse.builder()
                    .valid(isValid)
                    .message(message)
                    .bookingId(booking.getId())
                    .userName(booking.getUser().getName())
                    .resourceName(booking.getResource().getName())
                    .startTime(booking.getStartTime())
                    .endTime(booking.getEndTime())
                    .checkedInAt(booking.getCheckedInAt())
                    .build();

            return ResponseEntity.ok(ApiResponse.success(response));

        } catch (Exception e) {
            QRVerifyResponse response = QRVerifyResponse.builder()
                    .valid(false)
                    .message("Invalid or expired QR token")
                    .build();
            return ResponseEntity.ok(ApiResponse.success(response));
        }
    }
}