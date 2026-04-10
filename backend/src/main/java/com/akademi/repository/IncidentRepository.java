package com.akademi.repository;

import com.akademi.model.Incident;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IncidentRepository extends JpaRepository<Incident, Long> {

    List<Incident> findByReportedById(Long userId);

    // Technician: find tickets assigned to them
    List<Incident> findByAssignedToId(Long technicianId);
}
