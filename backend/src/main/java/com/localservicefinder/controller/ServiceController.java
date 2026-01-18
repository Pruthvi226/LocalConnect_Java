package com.localservicefinder.controller;

import com.localservicefinder.model.Service;
import com.localservicefinder.service.ServiceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/services")
public class ServiceController {
    @Autowired
    ServiceService serviceService;

    @GetMapping
    public ResponseEntity<List<Service>> getAllServices(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(required = false) Double minRating) {
        
        if (category != null || location != null || minPrice != null || 
            maxPrice != null || minRating != null) {
            List<Service> services = serviceService.searchServices(
                    category, location, minPrice, maxPrice, minRating);
            return ResponseEntity.ok(services);
        }
        
        return ResponseEntity.ok(serviceService.getAllServices());
    }

    @GetMapping("/search")
    public ResponseEntity<List<Service>> searchServices(@RequestParam String q) {
        return ResponseEntity.ok(serviceService.searchByQuery(q));
    }

    @GetMapping("/categories")
    public ResponseEntity<List<String>> getCategories() {
        return ResponseEntity.ok(serviceService.getAllCategories());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getServiceById(@PathVariable Long id) {
        return serviceService.getServiceById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createService(@RequestBody Service service) {
        try {
            Service createdService = serviceService.createService(service);
            return ResponseEntity.ok(createdService);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateService(@PathVariable Long id, @RequestBody Service serviceDetails) {
        try {
            Service updatedService = serviceService.updateService(id, serviceDetails);
            return ResponseEntity.ok(updatedService);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteService(@PathVariable Long id) {
        try {
            serviceService.deleteService(id);
            return ResponseEntity.ok(Map.of("message", "Service deleted successfully"));
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}
