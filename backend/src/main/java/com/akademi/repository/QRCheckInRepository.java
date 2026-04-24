package com.akademi.repository;

import com.akademi.model.QRCheckIn;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface QRCheckInRepository extends JpaRepository<QRCheckIn, Long> {
}