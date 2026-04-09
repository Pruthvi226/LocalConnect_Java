package com.nearnest.dto;

import com.nearnest.model.User;

public class UserDto {
    private Long id;
    private String username;
    private String email;
    private String fullName;
    private String role;
    private String phoneNumber;
    private String address;
    private Integer trustScore;
    private Double completionRate;
    private Double onTimePerformance;
    private Double cancellationRate;
    private String emergencyContactName;
    private String emergencyContactPhone;

    // Provider Payout Details
    private String bankAccountNumber;
    private String ifscCode;
    private String upiId;
    private Double averageRating;
    private Integer totalReviews;

    public UserDto() {}

    public static UserDto fromEntity(User u) {
        UserDto dto = new UserDto();
        dto.setId(u.getId());
        dto.setUsername(u.getUsername());
        dto.setEmail(u.getEmail());
        dto.setFullName(u.getFullName());
        dto.setRole(u.getRole().name());
        dto.setPhoneNumber(u.getPhone());
        dto.setAddress(u.getAddress());
        dto.setTrustScore(u.getTrustScore());
        dto.setCompletionRate(u.getCompletionRate());
        dto.setOnTimePerformance(u.getOnTimePerformance());
        dto.setCancellationRate(u.getCancellationRate());
        dto.setEmergencyContactName(u.getEmergencyContactName());
        dto.setEmergencyContactPhone(u.getEmergencyContactPhone());
        dto.setBankAccountNumber(u.getBankAccountNumber());
        dto.setIfscCode(u.getIfscCode());
        dto.setUpiId(u.getUpiId());
        dto.setAverageRating(u.getAverageRating());
        dto.setTotalReviews(u.getTotalReviews());
        return dto;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public Integer getTrustScore() { return trustScore; }
    public void setTrustScore(Integer trustScore) { this.trustScore = trustScore; }
    public Double getCompletionRate() { return completionRate; }
    public void setCompletionRate(Double completionRate) { this.completionRate = completionRate; }
    public Double getOnTimePerformance() { return onTimePerformance; }
    public void setOnTimePerformance(Double onTimePerformance) { this.onTimePerformance = onTimePerformance; }
    public Double getCancellationRate() { return cancellationRate; }
    public void setCancellationRate(Double cancellationRate) { this.cancellationRate = cancellationRate; }
    public String getEmergencyContactName() { return emergencyContactName; }
    public void setEmergencyContactName(String emergencyContactName) { this.emergencyContactName = emergencyContactName; }
    public String getEmergencyContactPhone() { return emergencyContactPhone; }
    public void setEmergencyContactPhone(String emergencyContactPhone) { this.emergencyContactPhone = emergencyContactPhone; }
    public String getBankAccountNumber() { return bankAccountNumber; }
    public void setBankAccountNumber(String bankAccountNumber) { this.bankAccountNumber = bankAccountNumber; }
    public String getIfscCode() { return ifscCode; }
    public void setIfscCode(String ifscCode) { this.ifscCode = ifscCode; }
    public String getUpiId() { return upiId; }
    public void setUpiId(String upiId) { this.upiId = upiId; }
    public Double getAverageRating() { return averageRating; }
    public void setAverageRating(Double averageRating) { this.averageRating = averageRating; }
    public Integer getTotalReviews() { return totalReviews; }
    public void setTotalReviews(Integer totalReviews) { this.totalReviews = totalReviews; }
}
