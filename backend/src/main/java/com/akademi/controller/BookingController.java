package com.akademi.controller;

import com.akademi.dto.request.ApproveRejectRequest;
import com.akademi.dto.request.BookingRequest;
import com.akademi.dto.response.ApiResponse;
import com.akademi.dto.response.BookingResponse;
import com.akademi.enums.BookingStatus;
import com.akademi.model.User;
import com.akademi.service.BookingService;
import com.akademi.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;
    private final UserService userService;

    // CREATE — submit a new booking request
    @PostMapping
    public ResponseEntity<ApiResponse<BookingResponse>> createBooking(
            @Valid @RequestBody BookingRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.getUserByEmail(userDetails.getUsername());
        BookingResponse booking = bookingService.createBooking(request, user);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Booking submitted. Awaiting admin approval.", booking));
    }

    // READ — get logged-in user's own bookings
    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<BookingResponse>>> getMyBookings(
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.getUserByEmail(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(
                bookingService.getUserBookings(user.getId())));
    }

    // READ — get a single booking by ID
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BookingResponse>> getBookingById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(bookingService.getBookingById(id)));
    }

    // READ — admin gets all bookings 
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<BookingResponse>>> getAllBookings(
            @RequestParam(required = false) BookingStatus status) {
        return ResponseEntity.ok(ApiResponse.success(bookingService.getAllBookings(status)));
    }

    // UPDATE — user cancels their own APPROVED booking
    @PatchMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<BookingResponse>> cancelBooking(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.getUserByEmail(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Booking cancelled",
                bookingService.cancelBooking(id, user)));
    }

    // UPDATE — admin approves a PENDING booking
    @PatchMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<BookingResponse>> approveBooking(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Booking approved",
                bookingService.approveBooking(id)));
    }

    // UPDATE — admin rejects a PENDING booking with a reason
    @PatchMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<BookingResponse>> rejectBooking(
            @PathVariable Long id,
            @RequestBody ApproveRejectRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Booking rejected",
                bookingService.rejectBooking(id, request.getReason())));
    }

    // UPDATE — generate QR token for an approved booking
    @PostMapping("/{id}/qr")
    public ResponseEntity<ApiResponse<String>> generateQRToken(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.getUserByEmail(userDetails.getUsername());
        String token = bookingService.generateQRToken(id, user);
        return ResponseEntity.ok(ApiResponse.success("QR token generated", token));
    }

    // DELETE — removes a PENDING booking the user submitted by mistake
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteBooking(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.getUserByEmail(userDetails.getUsername());
        bookingService.deletePendingBooking(id, user);
        return ResponseEntity.ok(ApiResponse.success("Booking deleted", null));
    }
}