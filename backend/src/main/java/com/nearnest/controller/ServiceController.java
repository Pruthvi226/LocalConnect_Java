package com.nearnest.controller;

import com.nearnest.dto.ServiceDto;
import com.nearnest.model.Service;
import com.nearnest.service.ServiceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/services")
public class ServiceController {
    @Autowired
    ServiceService serviceService;

    @GetMapping
    public ResponseEntity<Page<ServiceDto>> getAllServices(
            @RequestParam(name = "category", required = false) String category,
            @RequestParam(name = "location", required = false) String location,
            @RequestParam(name = "minPrice", required = false) Double minPrice,
            @RequestParam(name = "maxPrice", required = false) Double maxPrice,
            @RequestParam(name = "minRating", required = false) Double minRating,
            @RequestParam(name = "isAvailableNow", required = false) Boolean isAvailableNow,
            @RequestParam(name = "userLat", required = false) Double userLat,
            @RequestParam(name = "userLng", required = false) Double userLng,
            @RequestParam(name = "maxDistanceKm", required = false) Double maxDistanceKm,
            Pageable pageable) {
        
        Page<ServiceDto> services;
        boolean hasFilter = category != null || location != null || minPrice != null ||
                maxPrice != null || minRating != null || isAvailableNow != null;

        if (hasFilter || userLat != null || userLng != null || maxDistanceKm != null) {
            services = serviceService.searchServicesWithLocation(
                    category, location, minPrice, maxPrice, minRating, isAvailableNow, userLat, userLng, maxDistanceKm, pageable);
        } else {
            services = serviceService.getAllServices(pageable);
        }
        
        return ResponseEntity.ok(services);
    }

    @GetMapping("/search")
    public ResponseEntity<Page<ServiceDto>> searchServices(@RequestParam(name = "q") String q, Pageable pageable) {
        return ResponseEntity.ok(serviceService.searchByQuery(q, pageable));
    }

    @GetMapping("/recommend")
    public ResponseEntity<Page<ServiceDto>> getRecommendations(
            @RequestParam(name = "userLat", required = false) Double userLat,
            @RequestParam(name = "userLng", required = false) Double userLng,
            Pageable pageable) {
        return ResponseEntity.ok(serviceService.getRecommendations(userLat, userLng, pageable));
    }

    @GetMapping("/categories")
    public ResponseEntity<List<String>> getCategories() {
        return ResponseEntity.ok(serviceService.getAllCategories());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ServiceDto> getServiceById(@PathVariable(name = "id") Long id) {
        return serviceService.getServiceById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<ServiceDto> createService(@Valid @RequestBody Service service) {
        return ResponseEntity.ok(serviceService.createService(service));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ServiceDto> updateService(@PathVariable(name = "id") Long id, @Valid @RequestBody Service serviceDetails) {
        return ResponseEntity.ok(serviceService.updateService(id, serviceDetails));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteService(@PathVariable(name = "id") Long id) {
        serviceService.deleteService(id);
        return ResponseEntity.ok(Map.of("message", "Service deleted successfully"));
    }
}
