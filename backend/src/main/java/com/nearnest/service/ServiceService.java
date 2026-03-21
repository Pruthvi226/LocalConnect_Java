package com.nearnest.service;

import com.nearnest.dto.ServiceDto;
import com.nearnest.model.Service;
import com.nearnest.model.User;
import com.nearnest.repository.ServiceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@org.springframework.stereotype.Service
public class ServiceService {
    @Autowired
    ServiceRepository serviceRepository;

    @Autowired
    AuthService authService;

    public Page<ServiceDto> getAllServices(Pageable pageable) {
        return serviceRepository.findAll(pageable).map(this::convertToDto);
    }

    public Page<ServiceDto> searchServices(String category, String location, Double minPrice,
                                        Double maxPrice, Double minRating, Boolean isAvailableNow, Pageable pageable) {
        return serviceRepository.searchServices(category, location, minPrice, maxPrice, minRating, isAvailableNow, pageable)
                .map(this::convertToDto);
    }

    public Page<ServiceDto> searchServicesWithLocation(String category,
                                                     String location,
                                                     Double minPrice,
                                                     Double maxPrice,
                                                     Double minRating,
                                                     Boolean isAvailableNow,
                                                     Double userLat,
                                                     Double userLng,
                                                     Double maxDistanceKm,
                                                     Pageable pageable) {
        // Fallback to regular search when location is not provided
        if (userLat == null || userLng == null) {
            return searchServices(category, location, minPrice, maxPrice, minRating, isAvailableNow, pageable);
        }

        // Fetch a larger set for in-memory distance calculation (Production normally uses Spatial DB)
        // For this demo, we'll fetch up to 100 nearby items and handle pagination manually or return the sorted list
        List<Service> base = serviceRepository.searchServices(category, location, minPrice, maxPrice, minRating, isAvailableNow, PageRequest.of(0, 500)).getContent();

        // Compute distance using Haversine formula and filter/sort in-memory.
        List<ServiceDto> results = base.stream()
                .filter(s -> s.getLatitude() != null && s.getLongitude() != null)
                .peek(s -> s.setDistanceKm(haversineDistanceKm(userLat, userLng, s.getLatitude(), s.getLongitude())))
                .filter(s -> maxDistanceKm == null || s.getDistanceKm() <= maxDistanceKm)
                .sorted(Comparator.comparing(Service::getDistanceKm))
                .map(this::convertToDto)
                .collect(Collectors.toList());

        // Manual pagination for distance-based results
        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), results.size());
        
        List<ServiceDto> pagedList = results.subList(Math.max(0, Math.min(start, results.size())), end);
        return new PageImpl<>(pagedList, pageable, results.size());
    }

    private double haversineDistanceKm(double lat1, double lon1, double lat2, double lon2) {
        final double R = 6371.0; // Earth radius in km
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                        Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    // Phase 2: Smart Matching Recommendations
    public Page<ServiceDto> getRecommendations(Double userLat, Double userLng, Pageable pageable) {
        List<Service> base = serviceRepository.findAll();
        
        List<ServiceDto> results = base.stream()
                .peek(s -> {
                    if (userLat != null && userLng != null && s.getLatitude() != null && s.getLongitude() != null) {
                        s.setDistanceKm(haversineDistanceKm(userLat, userLng, s.getLatitude(), s.getLongitude()));
                    } else {
                        s.setDistanceKm(10.0); // default simulated distance
                    }
                })
                .map(this::convertToDto)
                .sorted((d1, d2) -> Double.compare(calculateMatchScore(d2), calculateMatchScore(d1))) // Descending
                .collect(Collectors.toList());

        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), results.size());
        List<ServiceDto> pagedList = results.subList(Math.max(0, Math.min(start, results.size())), end);
        return new PageImpl<>(pagedList, pageable, results.size());
    }

    private double calculateMatchScore(ServiceDto dto) {
        double trustNorm = (dto.getProvider() != null && dto.getProvider().getTrustScore() != null) ? (dto.getProvider().getTrustScore() / 100.0) : 0.8;
        double ratingNorm = (dto.getAverageRating() != null) ? (dto.getAverageRating() / 5.0) : 0.8;
        double distPenalty = (dto.getDistanceKm() != null) ? (dto.getDistanceKm() * 0.05) : 0.5;
        double instantBonus = Boolean.TRUE.equals(dto.getIsAvailableNow()) ? 0.3 : 0.0;

        return (trustNorm * 0.4) + (ratingNorm * 0.4) + instantBonus - distPenalty;
    }

    public Page<ServiceDto> searchByQuery(String query, Pageable pageable) {
        return serviceRepository.searchByQuery(query, pageable).map(this::convertToDto);
    }

    public List<String> getAllCategories() {
        return serviceRepository.findAllDistinctCategories();
    }

    public Optional<ServiceDto> getServiceById(Long id) {
        return serviceRepository.findById(id).map(this::convertToDto);
    }

    @Transactional
    public ServiceDto createService(Service service) {
        User currentUser = authService.getCurrentUser();
        if (currentUser == null) {
            throw new RuntimeException("User not authenticated");
        }
        if (currentUser.getRole() != User.Role.PROVIDER && currentUser.getRole() != User.Role.ADMIN) {
            throw new RuntimeException("Only providers and admins can create services");
        }
        service.setProvider(currentUser);
        Service saved = serviceRepository.save(service);
        return convertToDto(saved);
    }

    @Transactional
    public ServiceDto updateService(Long id, Service serviceDetails) {
        Service service = serviceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Service not found"));
        
        User currentUser = authService.getCurrentUser();
        if (currentUser == null) {
            throw new RuntimeException("Not authenticated");
        }

        if (currentUser.getRole() != User.Role.ADMIN && 
            !service.getProvider().getId().equals(currentUser.getId())) {
            throw new RuntimeException("You don't have permission to update this service");
        }

        if (serviceDetails.getTitle() != null) service.setTitle(serviceDetails.getTitle());
        if (serviceDetails.getDescription() != null) service.setDescription(serviceDetails.getDescription());
        if (serviceDetails.getCategory() != null) service.setCategory(serviceDetails.getCategory());
        if (serviceDetails.getPrice() != null) service.setPrice(serviceDetails.getPrice());
        if (serviceDetails.getLocation() != null) service.setLocation(serviceDetails.getLocation());
        if (serviceDetails.getLatitude() != null) service.setLatitude(serviceDetails.getLatitude());
        if (serviceDetails.getLongitude() != null) service.setLongitude(serviceDetails.getLongitude());
        if (serviceDetails.getImageUrl() != null) service.setImageUrl(serviceDetails.getImageUrl());
        if (serviceDetails.getIsAvailable() != null) service.setIsAvailable(serviceDetails.getIsAvailable());
        if (serviceDetails.getIsAvailableNow() != null) service.setIsAvailableNow(serviceDetails.getIsAvailableNow());
        if (serviceDetails.getPlatformFee() != null) service.setPlatformFee(serviceDetails.getPlatformFee());

        Service updated = serviceRepository.save(service);
        return convertToDto(updated);
    }

    @Transactional
    public void deleteService(Long id) {
        Service service = serviceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Service not found"));

        User currentUser = authService.getCurrentUser();
        if (currentUser == null) {
            throw new RuntimeException("Not authenticated");
        }

        boolean canDelete = currentUser.getRole() == User.Role.ADMIN
                || service.getProvider().getId().equals(currentUser.getId());
        if (!canDelete) {
            throw new RuntimeException("You don't have permission to delete this service");
        }

        serviceRepository.delete(service);
    }

    public List<ServiceDto> getServicesByProvider(Long providerId) {
        return serviceRepository.findByProviderId(providerId).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<ServiceDto> getMyServices() {
        User currentUser = authService.getCurrentUser();
        if (currentUser == null) {
            throw new RuntimeException("Not authenticated");
        }
        if (currentUser.getRole() != User.Role.PROVIDER && currentUser.getRole() != User.Role.ADMIN) {
            throw new RuntimeException("Only providers can list their services");
        }
        return serviceRepository.findByProviderId(currentUser.getId()).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public ServiceDto convertToDto(Service s) {
        return ServiceDto.fromEntity(s);
    }
}
