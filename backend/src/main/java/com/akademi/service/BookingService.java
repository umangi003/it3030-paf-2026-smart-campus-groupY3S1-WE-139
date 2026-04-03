package com.akademi.service;

import com.akademi.dto.request.BookingRequest;
import com.akademi.enums.BookingStatus;
import com.akademi.exception.ConflictException;
import com.akademi.exception.ResourceNotFoundException;
import com.akademi.model.Booking;
import com.akademi.model.Resource;
import com.akademi.model.User;
import com.akademi.repository.BookingRepository;
import com.akademi.repository.ResourceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final ResourceRepository resourceRepository;

    @Value("${akademi.qr.token-expiry-minutes:15}")
    private int qrTokenExpiryMinutes;

    public Booking createBooking(BookingRequest request, User user) {
        Resource resource = resourceRepository.findById(request.getResourceId())
                .orElseThrow(() -> new ResourceNotFoundException("Resource", request.getResourceId()));

        // Check for overlapping bookings
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
                .status(BookingStatus.CONFIRMED)
                .purpose(request.getPurpose())
                .build();

        return bookingRepository.save(booking);
    }

    public List<Booking> getUserBookings(Long userId) {
        return bookingRepository.findByUserId(userId);
    }

    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    public Booking getBookingById(Long id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", id));
    }

    public Booking cancelBooking(Long id, User user) {
        Booking booking = getBookingById(id);
        if (!booking.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("You can only cancel your own bookings");
        }
        booking.setStatus(BookingStatus.CANCELLED);
        return bookingRepository.save(booking);
    }

    public String generateQRToken(Long bookingId, User user) {
        Booking booking = getBookingById(bookingId);
        if (!booking.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("You can only generate QR for your own bookings");
        }
        String token = UUID.randomUUID().toString();
        booking.setQrToken(token);
        booking.setQrTokenExpiry(LocalDateTime.now().plusMinutes(qrTokenExpiryMinutes));
        bookingRepository.save(booking);
        return token;
    }

    public Booking getBookingByQRToken(String token) {
        return bookingRepository.findByQrToken(token)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found for QR token"));
    }
}