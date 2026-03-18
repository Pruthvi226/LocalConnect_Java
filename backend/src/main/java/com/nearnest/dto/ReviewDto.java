package com.nearnest.dto;

import com.nearnest.model.Review;
import java.time.LocalDateTime;

public class ReviewDto {
    private Long id;
    private Long serviceId;
    private String serviceTitle;
    private Long userId;
    private String userName;
    private Integer rating;
    private String comment;
    private LocalDateTime createdAt;

    public ReviewDto() {}

    public ReviewDto(Long id, Long serviceId, String serviceTitle, Long userId, String userName,
                     Integer rating, String comment, LocalDateTime createdAt) {
        this.id = id;
        this.serviceId = serviceId;
        this.serviceTitle = serviceTitle;
        this.userId = userId;
        this.userName = userName;
        this.rating = rating;
        this.comment = comment;
        this.createdAt = createdAt;
    }

    public static ReviewDto fromEntity(Review r) {
        ReviewDto dto = new ReviewDto();
        dto.setId(r.getId());
        dto.setServiceId(r.getService().getId());
        dto.setServiceTitle(r.getService().getTitle());
        dto.setUserId(r.getUser().getId());
        dto.setUserName(r.getUser().getFullName());
        dto.setRating(r.getRating());
        dto.setComment(r.getComment());
        dto.setCreatedAt(r.getCreatedAt());
        return dto;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getServiceId() { return serviceId; }
    public void setServiceId(Long serviceId) { this.serviceId = serviceId; }
    public String getServiceTitle() { return serviceTitle; }
    public void setServiceTitle(String serviceTitle) { this.serviceTitle = serviceTitle; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }
    public Integer getRating() { return rating; }
    public void setRating(Integer rating) { this.rating = rating; }
    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
