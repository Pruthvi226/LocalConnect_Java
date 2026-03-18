package com.nearnest.dto;

import com.nearnest.model.Favorite;
import java.time.LocalDateTime;

public class FavoriteDto {
    private Long id;
    private Long serviceId;
    private String serviceTitle;
    private String serviceCategory;
    private Double serviceRating;
    private Integer serviceReviewCount;
    private LocalDateTime createdAt;

    public FavoriteDto() {}

    public static FavoriteDto fromEntity(Favorite f) {
        FavoriteDto dto = new FavoriteDto();
        dto.setId(f.getId());
        dto.setServiceId(f.getService().getId());
        dto.setServiceTitle(f.getService().getTitle());
        dto.setServiceCategory(f.getService().getCategory());
        dto.setServiceRating(f.getService().getAverageRating());
        dto.setServiceReviewCount(f.getService().getTotalReviews());
        dto.setCreatedAt(f.getCreatedAt());
        return dto;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getServiceId() { return serviceId; }
    public void setServiceId(Long serviceId) { this.serviceId = serviceId; }
    public String getServiceTitle() { return serviceTitle; }
    public void setServiceTitle(String serviceTitle) { this.serviceTitle = serviceTitle; }
    public String getServiceCategory() { return serviceCategory; }
    public void setServiceCategory(String serviceCategory) { this.serviceCategory = serviceCategory; }
    public Double getServiceRating() { return serviceRating; }
    public void setServiceRating(Double serviceRating) { this.serviceRating = serviceRating; }
    public Integer getServiceReviewCount() { return serviceReviewCount; }
    public void setServiceReviewCount(Integer serviceReviewCount) { this.serviceReviewCount = serviceReviewCount; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
