package com.akademi.repository;

import com.akademi.enums.TicketStatus;
import com.akademi.model.Incident;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IncidentRepository extends JpaRepository<Incident, Long> {

    // IncidentRepository.java
    List<Incident> findByReportedBy_Id(Long id);

    // Technician: find tickets assigned to them
    List<Incident> findByAssignedTo_Id(Long technicianId);

    // Analytics: count by status
    long countByStatus(TicketStatus status);

}