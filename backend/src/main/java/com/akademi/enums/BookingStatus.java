package com.akademi.enums;

public enum BookingStatus {
    PENDING,      // Submitted by user, waiting for admin review
    APPROVED,     // Admin approved — user can generate QR
    REJECTED,     // Admin rejected — booking denied
    CANCELLED,    // User cancelled an approved booking
    COMPLETED,    // Booking time passed successfully
    NO_SHOW       // Approved but user never checked in

}