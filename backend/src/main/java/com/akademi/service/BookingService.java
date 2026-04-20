package com.akademi.service;

import com.akademi.dto.request.BookingRequest;
import com.akademi.dto.response.BookingResponse;
import com.akademi.enums.BookingStatus;
import com.akademi.enums.NotificationCategory;
import com.akademi.enums.ResourceStatus;
import com.akademi.exception.ConflictException;
import com.akademi.exception.ResourceNotFoundException;
import com.akademi.model.Booking;
import com.akademi.model.QRCheckIn;
import com.akademi.model.Resource;
import com.akademi.model.User;
import com.akademi.repository.BookingRepository;
import com.akademi.repository.QRCheckInRepository;
import com.akademi.repository.ResourceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final ResourceRepository resourceRepository;
    private final QRCheckInRepository qrCheckInRepository;
    private final NotificationService notificationService;

    @Value("${akademi.qr.token-expiry-minutes:15}")
    private int qrTokenExpiryMinutes;


    public BookingResponse toResponse(Booking b) {
        return BookingResponse.builder()
                .id(b.getId())
                .userId(b.getUser().getId())
                .userName(b.getUser().getName())
                .resourceId(b.getResource().getId())
                .resourceName(b.getResource().getName())
                .resourceLocation(b.getResource().getLocation())
                .startTime(b.getStartTime())
                .endTime(b.getEndTime())
                .status(b.getStatus())
                .purpose(b.getPurpose())
                .attendees(b.getAttendees())
                .rejectionReason(b.getRejectionReason())
                .qrToken(b.getQrToken())
                .qrTokenExpiry(b.getQrTokenExpiry())
                .checkedInAt(b.getCheckedInAt())
                .createdAt(b.getCreatedAt())
                .build();
    }

    public List<BookingResponse> toResponseList(List<Booking> bookings) {
        return bookings.stream().map(this::toResponse).collect(Collectors.toList());
    }

    public BookingResponse createBooking(BookingRequest request, User user) {
        Resource resource = resourceRepository.findById(request.getResourceId())
                .orElseThrow(() -> new ResourceNotFoundException("Resource", request.getResourceId()));

        List<Booking> overlapping = bookingRepository.findOverlappingBookings(
                request.getResourceId(), request.getStartTime(), request.getEndTime());
        if (!overlapping.isEmpty()) {
            throw new ConflictException("Resource is already booked for the selected time slot");
        }

        Booking booking = Booking.builder()
                .user(user)
                .resource(resource)
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .status(BookingStatus.PENDING)        // Fix 1: was CONFIRMED
                .purpose(request.getPurpose())
                .attendees(request.getAttendees())    // Fix 4
                .build();

        Booking saved = bookingRepository.save(booking);

        notificationService.sendNotification(
                user,
                "Booking Submitted",
                "Your booking for " + resource.getName() + " is awaiting admin approval.",
                NotificationCategory.GENERAL,
                saved.getId(),
                "BOOKING"
        );

        return toResponse(saved);
    }

    public BookingResponse approveBooking(Long bookingId) {
        Booking booking = getBookingEntityById(bookingId);
        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new IllegalStateException(
                "Only PENDING bookings can be approved. Current status: " + booking.getStatus());
        }
        booking.setStatus(BookingStatus.APPROVED);

        // Mark resource as UNAVAILABLE so it no longer appears in the available list
        Resource resource = booking.getResource();
        resource.setStatus(ResourceStatus.UNAVAILABLE);
        resourceRepository.save(resource);

        Booking saved = bookingRepository.save(booking);

        notificationService.sendNotification(
                booking.getUser(),
                "Booking Approved",
                "Your booking for " + booking.getResource().getName() +
                " has been approved. You can now generate your QR code.",
                NotificationCategory.BOOKING_APPROVED,
                saved.getId(),
                "BOOKING"
        );

        return toResponse(saved);
    }

    public BookingResponse rejectBooking(Long bookingId, String reason) {
        Booking booking = getBookingEntityById(bookingId);
        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new IllegalStateException(
                "Only PENDING bookings can be rejected. Current status: " + booking.getStatus());
        }
        booking.setStatus(BookingStatus.REJECTED);
        booking.setRejectionReason(reason);
        Booking saved = bookingRepository.save(booking);

        notificationService.sendNotification(
                booking.getUser(),
                "Booking Rejected",
                "Your booking for " + booking.getResource().getName() + " was rejected." +
                (reason != null && !reason.isBlank() ? " Reason: " + reason : ""),
                NotificationCategory.BOOKING_REJECTED,
                saved.getId(),
                "BOOKING"
        );

        return toResponse(saved);
    }

    public BookingResponse cancelBooking(Long id, User user) {
        Booking booking = getBookingEntityById(id);
        if (!booking.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("You can only cancel your own bookings");
        }
        // Fix 7: only APPROVED bookings can be cancelled
        if (booking.getStatus() != BookingStatus.APPROVED) {
            throw new IllegalStateException("Only approved bookings can be cancelled");
        }
        booking.setStatus(BookingStatus.CANCELLED);

        // Restore resource to AVAILABLE so it reappears in the booking form
        Resource resource = booking.getResource();
        resource.setStatus(ResourceStatus.AVAILABLE);
        resourceRepository.save(resource);

        Booking saved = bookingRepository.save(booking);

        notificationService.sendNotification(
                user,
                "Booking Cancelled",
                "Your booking for " + booking.getResource().getName() + " has been cancelled.",
                NotificationCategory.BOOKING_CANCELLED,
                saved.getId(),
                "BOOKING"
        );

        return toResponse(saved);
    }

    public List<BookingResponse> getAllBookings(BookingStatus statusFilter) {
        List<Booking> bookings = (statusFilter != null)
                ? bookingRepository.findByStatus(statusFilter)
                : bookingRepository.findAll();
        return toResponseList(bookings);
    }

    public List<BookingResponse> getUserBookings(Long userId) {
        return toResponseList(bookingRepository.findByUserId(userId));
    }

    public BookingResponse getBookingById(Long id) {
        return toResponse(getBookingEntityById(id));
    }

    public Booking getBookingEntityById(Long id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", id));
    }

    public Booking saveBooking(Booking booking) {
        return bookingRepository.save(booking);
    }

    public String generateQRToken(Long bookingId, User user) {
        Booking booking = getBookingEntityById(bookingId);
        if (!booking.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("You can only generate QR for your own bookings");
        }
        if (booking.getStatus() != BookingStatus.APPROVED) {
            throw new IllegalStateException("QR code can only be generated for approved bookings");
        }
        String token = UUID.randomUUID().toString();
        booking.setQrToken(token);
        booking.setQrTokenExpiry(LocalDateTime.now().plusMinutes(qrTokenExpiryMinutes));
        bookingRepository.save(booking);
        return token;
    }

    public Booking verifyAndCheckIn(String token) {
        Booking booking = bookingRepository.findByQrToken(token)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found for QR token"));

        boolean isExpired = booking.getQrTokenExpiry() != null &&
                booking.getQrTokenExpiry().isBefore(LocalDateTime.now());
        boolean alreadyCheckedIn = booking.getCheckedInAt() != null;
        boolean isValid = !isExpired
                && booking.getStatus() == BookingStatus.APPROVED
                && !alreadyCheckedIn;

        if (isValid) {
            booking.setCheckedInAt(LocalDateTime.now());
            bookingRepository.save(booking);

            QRCheckIn checkIn = QRCheckIn.builder()
                    .booking(booking)
                    .scannedAt(LocalDateTime.now())
                    .valid(true)
                    .build();
            qrCheckInRepository.save(checkIn);
        }

        return booking;
    }
}