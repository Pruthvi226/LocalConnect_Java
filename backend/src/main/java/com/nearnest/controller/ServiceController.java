package com.nearnest.controller;

import com.nearnest.dto.ServiceDto;
import com.nearnest.dto.AiServiceDto;
import com.nearnest.dto.ServiceRequest;
import com.nearnest.service.ServiceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.web.PageableDefault;
import jakarta.validation.Valid;

import java.util.List;
import java.util.Map;
import java.util.Objects;

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
            @RequestParam(name = "search", required = false) String search,
            @RequestParam(name = "userLat", required = false) Double userLat,
            @RequestParam(name = "userLng", required = false) Double userLng,
            @RequestParam(name = "maxDistanceKm", required = false) Double maxDistanceKm,
            @PageableDefault(size = 10) Pageable pageable) {
        
        Page<ServiceDto> services;
        boolean hasFilter = category != null || location != null || minPrice != null ||
                maxPrice != null || minRating != null || isAvailableNow != null || search != null;

        if (hasFilter || userLat != null || userLng != null || maxDistanceKm != null) {
            services = serviceService.searchServicesWithLocation(
                    category, location, minPrice, maxPrice, minRating, isAvailableNow, search, userLat, userLng, maxDistanceKm, Objects.requireNonNull(pageable));
        } else {
            services = serviceService.getAllServices(Objects.requireNonNull(pageable));
        }
        
        return ResponseEntity.ok(services);
    }

    @GetMapping("/ai/search")
    public ResponseEntity<List<AiServiceDto>> getAiSummary() {
        return ResponseEntity.ok(serviceService.getAiServiceSummary());
    }

    @GetMapping("/discovery")
    public ResponseEntity<List<ServiceDto>> getDiscovery() {
        return ResponseEntity.ok(serviceService.getDiscoveryServices());
    }

    @GetMapping("/search")
    public ResponseEntity<Page<ServiceDto>> searchServices(@RequestParam(name = "q") String q, @PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(serviceService.searchByQuery(Objects.requireNonNull(q), Objects.requireNonNull(pageable)));
    }

    @GetMapping("/recommend")
    public ResponseEntity<Page<ServiceDto>> getRecommendations(
            @RequestParam(name = "userLat", required = false) Double userLat,
            @RequestParam(name = "userLng", required = false) Double userLng,
            @RequestParam(name = "category", required = false) String category,
            @RequestParam(name = "maxDistanceKm", required = false) Double maxDistanceKm,
            @RequestParam(name = "isAvailableNow", required = false) Boolean isAvailableNow,
            @PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(serviceService.getRecommendations(userLat, userLng, category, maxDistanceKm, isAvailableNow, Objects.requireNonNull(pageable)));
    }

    @GetMapping("/categories")
    public ResponseEntity<List<String>> getCategories() {
        return ResponseEntity.ok(serviceService.getAllCategories());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ServiceDto> getServiceById(@PathVariable(name = "id") Long id) {
        return serviceService.getServiceById(Objects.requireNonNull(id))
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<ServiceDto> createService(@Valid @RequestBody ServiceRequest serviceRequest) {
        return ResponseEntity.ok(serviceService.createService(Objects.requireNonNull(serviceRequest)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ServiceDto> updateService(@PathVariable(name = "id") Long id, @Valid @RequestBody ServiceRequest serviceDetails) {
        return ResponseEntity.ok(serviceService.updateService(Objects.requireNonNull(id), Objects.requireNonNull(serviceDetails)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteService(@PathVariable(name = "id") Long id) {
        serviceService.deleteService(Objects.requireNonNull(id));
        return ResponseEntity.ok(Map.of("message", "Service deleted successfully"));
    }
}
