package com.nearnest.controller;

import com.nearnest.dto.BookingDto;
import com.nearnest.dto.ProviderSummaryDto;
import com.nearnest.dto.ServiceDto;
import com.nearnest.model.Booking.BookingStatus;
import com.nearnest.service.BookingService;
import com.nearnest.service.ProviderDashboardService;
import com.nearnest.service.ServiceService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/provider")
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"}, allowCredentials = "true")
public class ProviderController {
    private final ProviderDashboardService dashboardService;
    private final ServiceService serviceService;
    private final BookingService bookingService;

    public ProviderController(ProviderDashboardService dashboardService, ServiceService serviceService,
                             BookingService bookingService) {
        this.dashboardService = dashboardService;
        this.serviceService = serviceService;
        this.bookingService = bookingService;
    }

    @GetMapping("/summary")
    public ResponseEntity<ProviderSummaryDto> getSummary() {
        return ResponseEntity.ok(dashboardService.getSummary());
    }

    @GetMapping("/services")
    public ResponseEntity<List<ServiceDto>> getMyServices() {
        return ResponseEntity.ok(serviceService.getMyServices());
    }

    @GetMapping("/bookings")
    public ResponseEntity<List<BookingDto>> getProviderBookings() {
        return ResponseEntity.ok(dashboardService.getProviderBookings());
    }

    @PutMapping("/bookings/{id}")
    public ResponseEntity<BookingDto> updateBookingStatus(@PathVariable(name = "id") Long id,
                                                   @RequestParam(name = "status", required = false) BookingStatus status,
                                                   @RequestParam(name = "notes", required = false) String notes) {
        return ResponseEntity.ok(bookingService.updateBooking(id, status, notes));
    }
}
