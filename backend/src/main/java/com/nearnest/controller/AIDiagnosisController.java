package com.nearnest.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

/**
 * AI Problem Diagnosis Controller
 * Rule-based engine that matches problem descriptions to service categories
 * and suggests a price estimate. Can be upgraded to a real ML model later.
 */
@RestController
@RequestMapping("/api/ai")
public class AIDiagnosisController {

    private static final List<DiagnosisRule> RULES = Arrays.asList(
        new DiagnosisRule(Arrays.asList("leak", "pipe", "water", "tap", "drain", "plumb", "clog", "flush"),
            "Plumbing", "Pipe Leak / Drain Blockage", 800.0, 2500.0),
        new DiagnosisRule(Arrays.asList("light", "wiring", "switch", "socket", "power", "electric", "circuit", "breaker", "short"),
            "Electrical", "Electrical Wiring / Fixture Issue", 600.0, 3000.0),
        new DiagnosisRule(Arrays.asList("ac", "air condition", "cooling", "heater", "heat", "hvac", "refrigerat", "fridge"),
            "AC Repair", "Cooling / Heating System Fault", 1200.0, 5000.0),
        new DiagnosisRule(Arrays.asList("clean", "dust", "mess", "dirty", "mop", "sweep", "sanitize", "pest", "cockroach", "rat", "ant"),
            "Cleaning", "Deep Cleaning / Pest Control", 500.0, 2000.0),
        new DiagnosisRule(Arrays.asList("paint", "wall", "ceiling", "crack", "plastering", "patch", "sealing"),
            "Painting", "Wall / Ceiling Repair & Painting", 1500.0, 8000.0),
        new DiagnosisRule(Arrays.asList("computer", "laptop", "pc", "tech", "software", "virus", "slow", "internet", "wifi", "network"),
            "Tech Support", "Computer / Network Issue", 400.0, 1500.0),
        new DiagnosisRule(Arrays.asList("lock", "key", "door", "broken", "window", "glass", "hinge", "carpent", "furniture", "wood"),
            "Carpentry", "Door / Furniture / Window Repair", 700.0, 4000.0)
    );

    @PostMapping("/diagnose")
    public ResponseEntity<DiagnosisResult> diagnose(@RequestBody DiagnosisRequest request) {
        String text = ((request.getDescription() != null ? request.getDescription() : "") + " " +
                       (request.getImageUrl() != null ? "" : "")).toLowerCase();

        for (DiagnosisRule rule : RULES) {
            for (String keyword : rule.keywords) {
                if (text.contains(keyword)) {
                    return ResponseEntity.ok(new DiagnosisResult(
                        rule.category,
                        rule.problemTitle,
                        rule.minPrice,
                        rule.maxPrice,
                        "Based on your description, this appears to be a " + rule.problemTitle + " issue.",
                        0.75 + Math.random() * 0.20  // mock confidence 75-95%
                    ));
                }
            }
        }

        // Fallback
        return ResponseEntity.ok(new DiagnosisResult(
            "General",
            "Home Repair / Maintenance",
            300.0,
            1500.0,
            "Unable to pinpoint the exact issue. A general handyman can assess and resolve it.",
            0.55
        ));
    }

    // ---- Request / Response DTOs ----
    public static class DiagnosisRequest {
        private String description;
        private String imageUrl;

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public String getImageUrl() { return imageUrl; }
        public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    }

    public static class DiagnosisResult {
        private String category;
        private String problemTitle;
        private Double minPrice;
        private Double maxPrice;
        private String explanation;
        private Double confidence;

        public DiagnosisResult(String category, String problemTitle, Double minPrice, Double maxPrice, String explanation, Double confidence) {
            this.category = category;
            this.problemTitle = problemTitle;
            this.minPrice = minPrice;
            this.maxPrice = maxPrice;
            this.explanation = explanation;
            this.confidence = Math.round(confidence * 100.0) / 100.0;
        }

        public String getCategory() { return category; }
        public String getProblemTitle() { return problemTitle; }
        public Double getMinPrice() { return minPrice; }
        public Double getMaxPrice() { return maxPrice; }
        public String getExplanation() { return explanation; }
        public Double getConfidence() { return confidence; }
    }

    private static class DiagnosisRule {
        List<String> keywords;
        String category;
        String problemTitle;
        Double minPrice;
        Double maxPrice;

        DiagnosisRule(List<String> keywords, String category, String problemTitle, Double minPrice, Double maxPrice) {
            this.keywords = keywords;
            this.category = category;
            this.problemTitle = problemTitle;
            this.minPrice = minPrice;
            this.maxPrice = maxPrice;
        }
    }
}
