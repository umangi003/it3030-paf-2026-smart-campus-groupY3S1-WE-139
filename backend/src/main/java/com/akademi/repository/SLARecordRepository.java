package com.akademi.repository;

import com.akademi.model.SLARecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface SLARecordRepository extends JpaRepository<SLARecord, Long> {

    Optional<SLARecord> findByIncidentId(Long incidentId);

    // Find SLA records where response is overdue but not yet marked breached
    @Query("SELECT s FROM SLARecord s WHERE s.responseBreached = false " +
           "AND s.responseDueAt < :now")
    List<SLARecord> findUnmarkedResponseBreaches(LocalDateTime now);

    // Find SLA records where resolution is overdue but not yet marked breached
    @Query("SELECT s FROM SLARecord s WHERE s.resolveBreached = false " +
           "AND s.resolveDueAt < :now")
    List<SLARecord> findUnmarkedResolveBreaches(LocalDateTime now);

    long countByResponseBreachedTrue();

    long countByResolveBreachedTrue();
}
