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

    List<Booking> findByUserIdAndStatus(Long userId, BookingStatus status);

    @Query("SELECT b FROM Booking b WHERE b.resource.id = :resourceId " +
           "AND b.status NOT IN (" +
           "  com.akademi.enums.BookingStatus.CANCELLED, " +
           "  com.akademi.enums.BookingStatus.REJECTED, " +
           "  com.akademi.enums.BookingStatus.NO_SHOW" +
           ") " +
           "AND b.startTime < :endTime AND b.endTime > :startTime")
    List<Booking> findOverlappingBookings(
            @Param("resourceId") Long resourceId,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime);

    // Top resources by booking count: returns [resourceName, count]
    @Query("SELECT b.resource.name, COUNT(b) as cnt FROM Booking b " +
           "GROUP BY b.resource.id, b.resource.name ORDER BY cnt DESC")
    List<Object[]> findTopResourcesByBookingCount();

    // Peak booking hours: returns [hour (0-23), count]
    @Query("SELECT HOUR(b.startTime), COUNT(b) FROM Booking b " +
           "WHERE b.status != com.akademi.enums.BookingStatus.CANCELLED " +
           "GROUP BY HOUR(b.startTime) ORDER BY HOUR(b.startTime)")
    List<Object[]> findPeakBookingHours();

    // Bookings per day for last 7 days
    @Query(value = "SELECT DATE(start_time) as day, COUNT(*) as cnt " +
                   "FROM bookings " +
                   "WHERE start_time >= DATE_SUB(NOW(), INTERVAL 7 DAY) " +
                   "GROUP BY DATE(start_time) ORDER BY day",
           nativeQuery = true)
    List<Object[]> findBookingsLast7Days();

    // Resource utilisation: bookings + total hours booked (APPROVED or COMPLETED)
    @Query("SELECT b.resource.name, COUNT(b), " +
           "SUM(TIMESTAMPDIFF(HOUR, b.startTime, b.endTime)) " +
           "FROM Booking b WHERE b.status = com.akademi.enums.BookingStatus.APPROVED " +
           "OR b.status = com.akademi.enums.BookingStatus.COMPLETED " +
           "GROUP BY b.resource.id, b.resource.name ORDER BY COUNT(b) DESC")
    List<Object[]> findResourceUtilisation();
}