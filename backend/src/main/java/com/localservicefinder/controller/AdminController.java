package com.localservicefinder.controller;

import com.localservicefinder.model.Booking;
import com.localservicefinder.model.User;
import com.localservicefinder.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/admin")
public class AdminController {
    @Autowired
    AdminService adminService;

    @GetMapping("/analytics")
    public ResponseEntity<?> getAnalytics() {
        try {
            return ResponseEntity.ok(adminService.getAnalytics());
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        try {
            return ResponseEntity.ok(adminService.getAllUsers());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    @GetMapping("/bookings")
    public ResponseEntity<List<Booking>> getAllBookings() {
        try {
            return ResponseEntity.ok(adminService.getAllBookings());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
        }
    }
}
