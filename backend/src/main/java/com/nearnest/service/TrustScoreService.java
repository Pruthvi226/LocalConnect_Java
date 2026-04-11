package com.nearnest.service;

import com.nearnest.model.User;
import com.nearnest.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class TrustScoreService {

    @Autowired
    private UserRepository userRepository;


    /**
     * Calculates and updates the trust score for a specific provider.
     * Scale: 0-100%
     */
    @Transactional
    public void updateProviderTrustScore(long providerId) {
        User provider = userRepository.findById(providerId)
                .orElseThrow(() -> new RuntimeException("Provider not found"));

        if (provider.getRole() != User.Role.PROVIDER) return;

        // Weights
        double completionWeight = 0.4;
        double onTimeWeight = 0.3;
        double ratingWeight = 0.2;
        double responseWeight = 0.1;

        // Fetch metrics (defaults to 100 if new)
        double completionRate = provider.getCompletionRate() != null ? provider.getCompletionRate() : 100.0;
        double onTimePerf = provider.getOnTimePerformance() != null ? provider.getOnTimePerformance() : 100.0;
        double rawRating = provider.getAverageRating() != null ? provider.getAverageRating() : 5.0;
        double responseScore = provider.getResponseScore() != null ? provider.getResponseScore() : 100.0;

        // Normalize rating (0-5 -> 0-100)
        double ratingNorm = (rawRating / 5.0) * 100.0;

        // Calculate Final Score
        double finalScore = (completionRate * completionWeight) +
                           (onTimePerf * onTimeWeight) +
                           (ratingNorm * ratingWeight) +
                           (responseScore * responseWeight);

        provider.setTrustScore((int) Math.round(finalScore));
        userRepository.save(provider);
    }

    /**
     * Batch update all providers nightly at 2 AM
     */
    @Scheduled(cron = "0 0 2 * * *")
    @Transactional
    public void updateAllProviderScores() {
        List<User> providers = userRepository.findByRole(User.Role.PROVIDER);
        for (User provider : providers) {
            if (provider.getId() != null) {
                updateProviderTrustScore(provider.getId());
            }
        }
    }
}
