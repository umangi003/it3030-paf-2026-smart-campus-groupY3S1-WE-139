package com.akademi.repository;

import com.akademi.enums.TicketStatus;
import com.akademi.model.Incident;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IncidentRepository extends JpaRepository<Incident, Long> {

    List<Incident> findByReportedById(Long userId);

    List<Incident> findByAssignedToId(Long userId);

    List<Incident> findByStatus(TicketStatus status);

    List<Incident> findByStatusNot(TicketStatus status);

    long countByStatus(TicketStatus status);
}
