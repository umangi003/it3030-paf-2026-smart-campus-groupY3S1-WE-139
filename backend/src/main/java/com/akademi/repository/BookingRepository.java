package com.akademi.repository;

import com.akademi.enums.BookingStatus;
import com.akademi.model.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByUserId(Long userId);

    List<Booking> findByResourceId(Long resourceId);

    List<Booking> findByStatus(BookingStatus status);

    Optional<Booking> findByQrToken(String qrToken);

    // Check for overlapping bookings on the same resource
    @Query("SELECT b FROM Booking b WHERE b.resource.id = :resourceId " +
           "AND b.status NOT IN ('CANCELLED', 'NO_SHOW') " +
           "AND b.startTime < :endTime AND b.endTime > :startTime")
    List<Booking> findOverlappingBookings(
            @Param("resourceId") Long resourceId,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime);

    List<Booking> findByUserIdAndStatus(Long userId, BookingStatus status);
}