package com.nearnest.dto;

import com.nearnest.model.Service;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public class ServiceDto {
    private Long id;
    private String title;
    private String description;
    private String category;
    private BigDecimal price;
    private String location;
    private Boolean isAvailable;
    private Boolean isAvailableNow;
    private Double platformFee;
    private Long providerId;
    private String providerName;
    private Double averageRating;
    private Integer reviewCount;
    private String imageUrl;
    private LocalDateTime createdAt;
    private Double latitude;
    private Double longitude;
    private Double distanceKm;
    private java.util.Set<String> portfolioImages;
    private java.util.List<ProjectReelDto> projectReels;

    // Nested provider object for frontend compatibility (service.provider.id, service.provider.fullName)
    private ProviderInfo provider;

    public ServiceDto() {}

    public static ServiceDto fromEntity(Service s) {
        ServiceDto dto = new ServiceDto();
        dto.setId(s.getId());
        dto.setTitle(s.getTitle());
        dto.setDescription(s.getDescription());
        dto.setCategory(s.getCategory());
        dto.setPrice(s.getPrice());
        dto.setLocation(s.getLocation());
        dto.setIsAvailable(s.getIsAvailable());
        dto.setIsAvailableNow(s.getIsAvailableNow());
        dto.setPlatformFee(s.getPlatformFee());
        dto.setImageUrl(s.getImageUrl());
        if (s.getProvider() != null) {
            dto.setProviderId(s.getProvider().getId());
            dto.setProviderName(s.getProvider().getFullName());
            ProviderInfo prov = new ProviderInfo();
            prov.setId(s.getProvider().getId());
            prov.setFullName(s.getProvider().getFullName());
            prov.setTrustScore(s.getProvider().getTrustScore());
            dto.setProvider(prov);
        }
        dto.setAverageRating(s.getAverageRating());
        dto.setReviewCount(s.getTotalReviews());
        dto.setCreatedAt(s.getCreatedAt());
        dto.setLatitude(s.getLatitude());
        dto.setLongitude(s.getLongitude());
        dto.setDistanceKm(s.getDistanceKm());
        
        // Manual Portfolio Images
        dto.setPortfolioImages(s.getPortfolioImageUrls());
        
        // Automated Project Reels (Live Proof-of-Work from Booking History)
        if (s.getBookings() != null) {
            java.util.List<ProjectReelDto> reels = s.getBookings().stream()
                .filter(b -> b.getStatus() == com.nearnest.model.Booking.BookingStatus.COMPLETED)
                .filter(b -> b.getAfterImageUrl() != null && !b.getAfterImageUrl().isEmpty())
                .sorted((b1, b2) -> b2.getUpdatedAt().compareTo(b1.getUpdatedAt()))
                .limit(6)
                .map(b -> new ProjectReelDto(
                    b.getId(),
                    b.getBeforeImageUrl(),
                    b.getAfterImageUrl(),
                    b.getUpdatedAt(),
                    b.getNotes()
                ))
                .collect(java.util.stream.Collectors.toList());
            dto.setProjectReels(reels);
        }
        
        return dto;
    }

    // Nested provider info class
    public static class ProviderInfo {
        private Long id;
        private String fullName;
        private Integer trustScore;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getFullName() { return fullName; }
        public void setFullName(String fullName) { this.fullName = fullName; }
        public Integer getTrustScore() { return trustScore; }
        public void setTrustScore(Integer trustScore) { this.trustScore = trustScore; }
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public Boolean getIsAvailable() { return isAvailable; }
    public void setIsAvailable(Boolean isAvailable) { this.isAvailable = isAvailable; }
    public Boolean getIsAvailableNow() { return isAvailableNow; }
    public void setIsAvailableNow(Boolean isAvailableNow) { this.isAvailableNow = isAvailableNow; }
    public Double getPlatformFee() { return platformFee; }
    public void setPlatformFee(Double platformFee) { this.platformFee = platformFee; }
    public Long getProviderId() { return providerId; }
    public void setProviderId(Long providerId) { this.providerId = providerId; }
    public String getProviderName() { return providerName; }
    public void setProviderName(String providerName) { this.providerName = providerName; }
    public Double getAverageRating() { return averageRating; }
    public void setAverageRating(Double averageRating) { this.averageRating = averageRating; }
    public Integer getReviewCount() { return reviewCount; }
    public void setReviewCount(Integer reviewCount) { this.reviewCount = reviewCount; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public ProviderInfo getProvider() { return provider; }
    public void setProvider(ProviderInfo provider) { this.provider = provider; }
    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }
    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }
    public Double getDistanceKm() { return distanceKm; }
    public void setDistanceKm(Double distanceKm) { this.distanceKm = distanceKm; }

    public java.util.Set<String> getPortfolioImages() { return portfolioImages; }
    public void setPortfolioImages(java.util.Set<String> portfolioImages) { this.portfolioImages = portfolioImages; }

    public java.util.List<ProjectReelDto> getProjectReels() { return projectReels; }
    public void setProjectReels(java.util.List<ProjectReelDto> projectReels) { this.projectReels = projectReels; }
}
