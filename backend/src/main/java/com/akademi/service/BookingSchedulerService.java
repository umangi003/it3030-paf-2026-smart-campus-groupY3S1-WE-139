package com.akademi.service;

import com.akademi.enums.BookingStatus;
import com.akademi.enums.NotificationCategory;
import com.akademi.enums.ResourceStatus;
import com.akademi.model.Booking;
import com.akademi.model.Resource;
import com.akademi.repository.BookingRepository;
import com.akademi.repository.ResourceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional; 

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class BookingSchedulerService {

    private final BookingRepository bookingRepository;
    private final ResourceRepository resourceRepository;
    private final NotificationService notificationService;

    // Runs every minute to check for expired bookings
    @Scheduled(fixedRate = 60000)
    @Transactional
    public void completeExpiredBookings() {
        log.info("Checking for expired bookings...");
        List<Booking> expired = bookingRepository.findExpiredApprovedBookings(LocalDateTime.now());

        for (Booking booking : expired) {
            // Mark booking as COMPLETED
            booking.setStatus(BookingStatus.COMPLETED);
            bookingRepository.save(booking);

            // Free up the resource so others can book it
            Resource resource = booking.getResource();
            resource.setStatus(ResourceStatus.AVAILABLE);
            resourceRepository.save(resource);

            // Notify the user
            notificationService.sendNotification(
                    booking.getUser(),
                    "Booking Completed",
                    "Your booking for " + resource.getName() + " has ended and been marked as completed.",
                    NotificationCategory.GENERAL,
                    booking.getId(),
                    "BOOKING"
            );

            log.info("Booking #{} marked as COMPLETED, resource '{}' set to AVAILABLE",
                    booking.getId(), resource.getName());
        }
    }
}