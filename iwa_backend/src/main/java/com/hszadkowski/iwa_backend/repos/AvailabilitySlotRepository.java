package com.hszadkowski.iwa_backend.repos;

import com.hszadkowski.iwa_backend.models.AvailabilitySlot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AvailabilitySlotRepository extends JpaRepository<AvailabilitySlot, Integer> {

}
