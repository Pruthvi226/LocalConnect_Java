package com.nearnest.dto;

import com.nearnest.model.Review;

public class ReviewDto {
    private Long id;
    private Long serviceId;
    private String serviceTitle;
    private Long customerId;
    private String customerName;
    private Integer rating;
    private String comment;
    private java.util.List<String> imageUrls;
    private java.time.LocalDateTime createdAt;

    public ReviewDto() {}

    public ReviewDto(Long id, Long serviceId, String serviceTitle, Long customerId, String customerName,
                     Integer rating, String comment, java.util.List<String> imageUrls, java.time.LocalDateTime createdAt) {
        this.id = id;
        this.serviceId = serviceId;
        this.serviceTitle = serviceTitle;
        this.customerId = customerId;
        this.customerName = customerName;
        this.rating = rating;
        this.comment = comment;
        this.imageUrls = imageUrls;
        this.createdAt = createdAt;
    }

    public static ReviewDto fromEntity(Review r) {
        ReviewDto dto = new ReviewDto();
        dto.setId(r.getId());
        dto.setServiceId(r.getService().getId());
        dto.setServiceTitle(r.getService().getTitle());
        dto.setCustomerId(r.getCustomer().getId());
        dto.setCustomerName(r.getCustomer().getFullName());
        dto.setRating(r.getRating());
        dto.setComment(r.getComment());
        dto.setImageUrls(new java.util.ArrayList<>(r.getImageUrls()));
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
    public Long getCustomerId() { return customerId; }
    public void setCustomerId(Long customerId) { this.customerId = customerId; }
    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }
    public Integer getRating() { return rating; }
    public void setRating(Integer rating) { this.rating = rating; }
    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }
    public java.util.List<String> getImageUrls() { return imageUrls; }
    public void setImageUrls(java.util.List<String> imageUrls) { this.imageUrls = imageUrls; }
    public java.time.LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(java.time.LocalDateTime createdAt) { this.createdAt = createdAt; }
}
