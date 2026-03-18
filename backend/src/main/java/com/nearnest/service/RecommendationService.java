package com.nearnest.service;

import com.nearnest.dto.ServiceDto;
import com.nearnest.repository.ServiceRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Connects to the Python ML microservice and retrieves ranked service recommendations
 * for a specific user using content-based + collaborative + location-based filtering.
 */
@Service
public class RecommendationService {

    private static final Logger logger = LoggerFactory.getLogger(RecommendationService.class);

    @Autowired
    private ServiceRepository serviceRepository;

    @Value("${ml.service.url:http://localhost:8000}")
    private String mlServiceUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    public List<ServiceDto> getRecommendationsForUser(Long userId) {
        String url = UriComponentsBuilder.fromHttpUrl(mlServiceUrl)
                .path("/api/recommendations/user/{userId}")
                .buildAndExpand(userId)
                .toUriString();

        try {
            ResponseEntity<List<Long>> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    null,
                    new ParameterizedTypeReference<List<Long>>() {}
            );

            List<Long> recommendedServiceIds = response.getBody();
            if (recommendedServiceIds != null && !recommendedServiceIds.isEmpty()) {
                List<com.nearnest.model.Service> recommendedServices = serviceRepository.findAllById(recommendedServiceIds);

                // Reorder to match ML service ranking
                recommendedServices.sort((s1, s2) ->
                    Integer.compare(recommendedServiceIds.indexOf(s1.getId()),
                                    recommendedServiceIds.indexOf(s2.getId()))
                );
                return recommendedServices.stream()
                        .map(ServiceDto::fromEntity)
                        .collect(Collectors.toList());
            }
        } catch (Exception e) {
            logger.error("Failed to fetch recommendations from ML service for user {}", userId, e);
        }
        return Collections.emptyList();
    }
}
