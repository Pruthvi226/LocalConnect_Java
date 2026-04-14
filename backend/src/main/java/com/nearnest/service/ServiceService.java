package com.nearnest.service;

import com.nearnest.dto.ServiceDto;
import com.nearnest.dto.AiServiceDto;
import com.nearnest.dto.ServiceRequest;
import com.nearnest.model.Service;
import com.nearnest.model.User;
import com.nearnest.repository.ServiceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.lang.NonNull;

import java.util.Comparator;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;

@org.springframework.stereotype.Service
public class ServiceService {
    @Autowired
    ServiceRepository serviceRepository;

    @Autowired
    AuthService authService;

    @Autowired
    GeminiAiService geminiAiService;

    @Cacheable(value = "services", key = "#pageable.pageNumber + '-' + #pageable.pageSize")
    public Page<ServiceDto> getAllServices(@NonNull Pageable pageable) {
        return serviceRepository.findAll(pageable).map(this::convertToDto);
    }

    public Page<ServiceDto> searchServices(String category, String location, Double minPrice,
                                        Double maxPrice, Double minRating, Boolean isAvailableNow, String search, @NonNull Pageable pageable) {
        if (pageable.getSort().isUnsorted()) {
            pageable = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), 
                    org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "provider.trustScore"));
        }
        return serviceRepository.searchServices(category, location, minPrice, maxPrice, minRating, isAvailableNow, search, pageable)
                .map(this::convertToDto);
    }

    public Page<ServiceDto> searchServicesWithLocation(String category,
                                                     String location,
                                                     Double minPrice,
                                                     Double maxPrice,
                                                     Double minRating,
                                                     Boolean isAvailableNow,
                                                     String search,
                                                     Double userLat,
                                                     Double userLng,
                                                     Double maxDistanceKm,
                                                     @NonNull Pageable pageable) {
        // Fallback to regular search when location is not provided
        if (userLat == null || userLng == null) {
            return searchServices(category, location, minPrice, maxPrice, minRating, isAvailableNow, search, pageable);
        }

        // Fetch a larger set for in-memory distance calculation (Production normally uses Spatial DB)
        // For this demo, we'll fetch up to 500 nearby items and handle pagination
        List<Service> base = serviceRepository.searchServices(category, location, minPrice, maxPrice, minRating, isAvailableNow, search, PageRequest.of(0, 500)).getContent();

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
        return new PageImpl<>(Objects.requireNonNull(pagedList), pageable, results.size());
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
    public Page<ServiceDto> getRecommendations(Double userLat, Double userLng, String category, Double maxDistanceKm, Boolean isAvailableNow, @NonNull Pageable pageable) {
        List<Service> base = serviceRepository.findAll();
        
        List<ServiceDto> results = base.stream()
                .filter(s -> category == null || category.isEmpty() || category.equalsIgnoreCase(s.getCategory()))
                .filter(s -> isAvailableNow == null || !isAvailableNow || Boolean.TRUE.equals(s.getIsAvailableNow()))
                .peek(s -> {
                    if (userLat != null && userLng != null && s.getLatitude() != null && s.getLongitude() != null) {
                        s.setDistanceKm(haversineDistanceKm(userLat, userLng, s.getLatitude(), s.getLongitude()));
                    } else {
                        s.setDistanceKm(10.0); // default simulated distance
                    }
                })
                .filter(s -> maxDistanceKm == null || s.getDistanceKm() <= maxDistanceKm)
                .map(this::convertToDto)
                .sorted((d1, d2) -> Double.compare(calculateMatchScore(d2), calculateMatchScore(d1))) // Descending
                .collect(Collectors.toList());

        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), results.size());
        List<ServiceDto> pagedList = results.subList(Math.max(0, Math.min(start, results.size())), end);
        return new PageImpl<>(Objects.requireNonNull(pagedList), pageable, results.size());
    }

    private double calculateMatchScore(ServiceDto dto) {
        double trustNorm = (dto.getProvider() != null && dto.getProvider().getTrustScore() != null) ? (dto.getProvider().getTrustScore() / 100.0) : 0.8;
        double ratingNorm = (dto.getAverageRating() != null) ? (dto.getAverageRating() / 5.0) : 0.8;
        double distPenalty = (dto.getDistanceKm() != null) ? (dto.getDistanceKm() * 0.05) : 0.5;
        double instantBonus = Boolean.TRUE.equals(dto.getIsAvailableNow()) ? 0.3 : 0.0;

        return (trustNorm * 0.4) + (ratingNorm * 0.4) + instantBonus - distPenalty;
    }

    public Page<ServiceDto> searchByQuery(String query, @NonNull Pageable pageable) {
        Page<Service> standard = serviceRepository.searchByQuery(query, pageable);
        
        // Phase 6: AI Fallback Expansion
        if (standard.isEmpty() && query != null && !query.isBlank() && geminiAiService.isAvailable()) {
            GeminiAiService.AiQueryResult aiParsed = geminiAiService.parseQuery(query);
            if (aiParsed != null) {
                // Try searching by AI-extracted category or keywords
                String category = aiParsed.category;
                String extraKeywords = (aiParsed.keywords != null && !aiParsed.keywords.isEmpty()) 
                    ? String.join(" ", aiParsed.keywords) : query;
                    
                return serviceRepository.searchServices(category, null, null, null, null, null, extraKeywords, pageable)
                        .map(this::convertToDto);
            }
        }
        
        return standard.map(this::convertToDto);
    }

    // Phase 2: Flash Assist (SOS) Discovery
    public List<ServiceDto> getFlashCandidates(String category, Double userLat, Double userLng) {
        if (userLat == null || userLng == null) return java.util.Collections.emptyList();
        
        List<Service> base = serviceRepository.findAll();
        return base.stream()
                .filter(s -> Boolean.TRUE.equals(s.getIsAvailableNow()))
                .filter(s -> category == null || category.isEmpty() || category.equalsIgnoreCase(s.getCategory()))
                .peek(s -> s.setDistanceKm(haversineDistanceKm(userLat, userLng, s.getLatitude(), s.getLongitude())))
                .filter(s -> s.getDistanceKm() <= 15.0) // 15km range for emergency
                .sorted((s1, s2) -> Double.compare(calculateMatchScore(convertToDto(s2)), calculateMatchScore(convertToDto(s1))))
                .limit(3)
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<String> getAllCategories() {
        return serviceRepository.findAllDistinctCategories();
    }

    @Cacheable(value = "serviceDetails", key = "#id")
    public Optional<ServiceDto> getServiceById(@NonNull Long id) {
        return serviceRepository.findById(id).map(this::convertToDto);
    }

    @Transactional
    @CacheEvict(value = {"services", "serviceDetails"}, allEntries = true)
    public ServiceDto createService(@NonNull ServiceRequest request) {
        User currentUser = authService.getCurrentUser();
        if (currentUser == null) {
            throw new RuntimeException("User not authenticated");
        }
        if (currentUser.getRole() != User.Role.PROVIDER && currentUser.getRole() != User.Role.ADMIN) {
            throw new RuntimeException("Only providers and admins can create services");
        }
        
        Service service = new Service();
        service.setTitle(request.getTitle());
        service.setDescription(request.getDescription());
        service.setCategory(request.getCategory());
        service.setPrice(request.getPrice());
        service.setLocation(request.getLocation());
        service.setImageUrl(request.getImageUrl());
        service.setIsAvailable(request.getIsAvailable() != null ? request.getIsAvailable() : true);
        service.setIsAvailableNow(request.getIsAvailableNow() != null ? request.getIsAvailableNow() : true);
        service.setLatitude(request.getLatitude());
        service.setLongitude(request.getLongitude());
        service.setPlatformFee(50.0); // Default platform fee
        
        if (request.getPortfolioImageUrls() != null) {
            service.getPortfolioImageUrls().addAll(request.getPortfolioImageUrls());
        }
        
        service.setProvider(currentUser);
        Service saved = serviceRepository.save(service);
        return convertToDto(saved);
    }

    @Transactional
    @CacheEvict(value = {"services", "serviceDetails"}, allEntries = true)
    public ServiceDto updateService(@NonNull Long id, @NonNull ServiceRequest request) {
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

        if (request.getTitle() != null) service.setTitle(request.getTitle());
        if (request.getDescription() != null) service.setDescription(request.getDescription());
        if (request.getCategory() != null) service.setCategory(request.getCategory());
        if (request.getPrice() != null) service.setPrice(request.getPrice());
        if (request.getLocation() != null) service.setLocation(request.getLocation());
        if (request.getImageUrl() != null) service.setImageUrl(request.getImageUrl());
        if (request.getIsAvailable() != null) service.setIsAvailable(request.getIsAvailable());
        if (request.getIsAvailableNow() != null) service.setIsAvailableNow(request.getIsAvailableNow());
        if (request.getLatitude() != null) service.setLatitude(request.getLatitude());
        if (request.getLongitude() != null) service.setLongitude(request.getLongitude());
        
        if (request.getPortfolioImageUrls() != null) {
            service.getPortfolioImageUrls().clear();
            service.getPortfolioImageUrls().addAll(request.getPortfolioImageUrls());
        }

        Service updated = serviceRepository.save(java.util.Objects.requireNonNull(service));
        return convertToDto(updated);
    }

    @Transactional
    public void deleteService(@NonNull Long id) {
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

        serviceRepository.delete(Objects.requireNonNull(service));
    }

    public List<ServiceDto> getServicesByProvider(@NonNull Long providerId) {
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

    public List<AiServiceDto> getAiServiceSummary() {
        return serviceRepository.findByIsAvailableTrue().stream()
                .map(AiServiceDto::fromEntity)
                .collect(Collectors.toList());
    }

    public ServiceDto convertToDto(Service s) {
        return ServiceDto.fromEntity(s);
    }

    // Phase 6: Smart Discovery
    public List<ServiceDto> getDiscoveryServices() {
        // Return top 8 trending/highly-rated available services
        return serviceRepository.searchServices(null, null, null, null, 4.0, true, null, 
                PageRequest.of(0, 8, org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "averageRating")))
                .getContent().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
}
