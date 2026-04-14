package com.nearnest.controller;

import com.nearnest.model.Availability;
import com.nearnest.model.User;
import com.nearnest.repository.AvailabilityRepository;
import com.nearnest.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/provider/availability")
public class AvailabilityController {

    @Autowired
    AvailabilityRepository availabilityRepository;

    @Autowired
    AuthService authService;

    @GetMapping
    public List<Availability> getMyAvailability() {
        User currentUser = authService.getCurrentUser();
        if (currentUser == null) throw new RuntimeException("Unauthorized");
        return availabilityRepository.findByUserId(currentUser.getId());
    }

    @PostMapping
    @Transactional
    public List<Availability> updateAvailability(@RequestBody List<Availability> newShifts) {
        User currentUser = authService.getCurrentUser();
        if (currentUser == null) throw new RuntimeException("Unauthorized");

        // Clear existing shifts for this provider
        List<Availability> existing = availabilityRepository.findByUserId(currentUser.getId());
        availabilityRepository.deleteAll(java.util.Objects.requireNonNull(existing));

        // Save new shifts
        for (Availability shift : newShifts) {
            shift.setUser(currentUser);
            shift.setId(null); // Ensure fresh save
            availabilityRepository.save(shift);
        }

        return availabilityRepository.findByUserId(currentUser.getId());
    }
}
