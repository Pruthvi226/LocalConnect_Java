package com.nearnest.dto;

import com.nearnest.model.Service;
public class AiServiceDto {
    private Long id;
    private String title;
    private String category;
    private Double averageRating;
    private Integer totalReviews;
    private java.math.BigDecimal price;
    private String location;
    private Double latitude;
    private Double longitude;
    private String providerName;
    private Double providerTrustScore;
    private Boolean isAvailableNow;

    public AiServiceDto() {}

    public static AiServiceDto fromEntity(Service s) {
        AiServiceDto dto = new AiServiceDto();
        dto.setId(s.getId());
        dto.setTitle(s.getTitle());
        dto.setCategory(s.getCategory());
        dto.setAverageRating(s.getAverageRating());
        dto.setTotalReviews(s.getTotalReviews());
        dto.setPrice(s.getPrice());
        dto.setLocation(s.getLocation());
        dto.setLatitude(s.getLatitude());
        dto.setLongitude(s.getLongitude());
        if (s.getProvider() != null) {
            dto.setProviderName(s.getProvider().getFullName());
            dto.setProviderTrustScore((double) s.getProvider().getTrustScore());
        }
        dto.setIsAvailableNow(s.getIsAvailableNow());
        return dto;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public Double getAverageRating() { return averageRating; }
    public void setAverageRating(Double averageRating) { this.averageRating = averageRating; }
    public Integer getTotalReviews() { return totalReviews; }
    public void setTotalReviews(Integer totalReviews) { this.totalReviews = totalReviews; }
    public java.math.BigDecimal getPrice() { return price; }
    public void setPrice(java.math.BigDecimal price) { this.price = price; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }
    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }
    public String getProviderName() { return providerName; }
    public void setProviderName(String providerName) { this.providerName = providerName; }
    public Double getProviderTrustScore() { return providerTrustScore; }
    public void setProviderTrustScore(Double providerTrustScore) { this.providerTrustScore = providerTrustScore; }
    public Boolean getIsAvailableNow() { return isAvailableNow; }
    public void setIsAvailableNow(Boolean isAvailableNow) { this.isAvailableNow = isAvailableNow; }
}
