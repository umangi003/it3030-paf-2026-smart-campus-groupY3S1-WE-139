package com.akademi.controller;

import com.akademi.dto.response.ApiResponse;
import com.akademi.dto.response.QRVerifyResponse;
import com.akademi.enums.BookingStatus;
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

    // Public endpoint — QR scanner doesn't need to be logged in
    @GetMapping("/verify/{token}")
    public ResponseEntity<ApiResponse<QRVerifyResponse>> verifyQRToken(@PathVariable String token) {
        try {
            Booking booking = bookingService.getBookingByQRToken(token);

            boolean isExpired = booking.getQrTokenExpiry() != null &&
                    booking.getQrTokenExpiry().isBefore(LocalDateTime.now());

            boolean isValid = !isExpired &&
                    booking.getStatus() == BookingStatus.CONFIRMED &&
                    booking.getCheckedInAt() == null;

            QRVerifyResponse response = QRVerifyResponse.builder()
                    .valid(isValid)
                    .message(isExpired ? "QR token has expired" :
                            booking.getCheckedInAt() != null ? "Already checked in" :
                            isValid ? "Check-in successful" : "Invalid booking status")
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
                    .message("Invalid QR token")
                    .build();
            return ResponseEntity.ok(ApiResponse.success(response));
        }
    }
}