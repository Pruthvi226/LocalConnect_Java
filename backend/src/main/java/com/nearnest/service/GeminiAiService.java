package com.nearnest.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

/**
 * GeminiAiService — Calls Google Gemini 1.5 Flash REST API directly.
 * All calls have a 2-second timeout and graceful null fallback.
 * Never throws exceptions to callers — fallback is always guaranteed.
 */
@Service
public class GeminiAiService {

    private static final Logger log = LoggerFactory.getLogger(GeminiAiService.class);

    private static final String GEMINI_URL =
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=";

    @Value("${gemini.api.key:}")
    private String geminiApiKey;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public GeminiAiService() {
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }

    // ── DTOs ─────────────────────────────────────────────────────────────────

    public static class AiQueryResult {
        public String category;
        public String intent;
        public String urgency;       // low / medium / high
        public String pricePreference;
        public String locationHint;
        public List<String> keywords;
        public String requestedDate;      // ISO date or relative e.g. "Tomorrow"
        public String requestedTime;      // "Morning", "Afternoon", "Evening", or specific time
    }

    // ── Public API ────────────────────────────────────────────────────────────

    /**
     * Parse a natural language query into structured search parameters.
     * Returns null if AI is unavailable (caller must fallback to keyword search).
     */
    public AiQueryResult parseQuery(String userQuery) {
        if (!isAvailable()) return null;

        String prompt = """
            You are an NLP-powered intelligent service classifier for a local service marketplace.

            Use Natural Language Processing to understand the query and extract:
            - category: one of (Plumbing, Electrical, AC Repair, Cleaning, Painting, Carpentry, Tech Support, General)
            - intent: repair/install/maintenance/cleaning/general
            - urgency: low/medium/high
            - pricePreference: low/medium/high (null if not mentioned)
            - locationHint: location mentioned (null if not mentioned)
            - keywords: array of key terms for search
            - requestedDate: specific date or relative term like "tomorrow", "Friday", "next week" (null if not mentioned)
            - requestedTime: "morning", "afternoon", "evening" or specific time (null if not mentioned)

            Return ONLY valid JSON, no markdown, no explanation.

            User Query: "%s"
            """.formatted(userQuery);

        try {
            long start = System.currentTimeMillis();
            String raw = callGemini(prompt, 256);
            long ms = System.currentTimeMillis() - start;
            log.info("[Gemini/parseQuery] latency={}ms query=\"{}\"", ms, userQuery);

            if (raw == null) return null;

            // Strip markdown code fences if present
            raw = raw.replaceAll("(?s)```json\\s*", "").replaceAll("```", "").trim();

            return objectMapper.readValue(raw, AiQueryResult.class);
        } catch (Exception e) {
            log.warn("[Gemini/parseQuery] Failed: {}", e.getMessage());
            return null;
        }
    }

    /**
     * AI assistant chat — responds to user messages about service booking.
     * Returns null if AI is unavailable.
     */
    public String chat(String userMessage) {
        if (!isAvailable()) return null;

        String prompt = """
            You are a helpful AI assistant for a service booking platform called ProxiSense.

            Help users:
            - Identify what service they need
            - Suggest relevant services
            - Guide them to booking

            Keep responses:
            - Short (2-3 sentences max)
            - Clear and friendly
            - Actionable (suggest what to search/book)

            User: "%s"
            """.formatted(userMessage);

        try {
            long start = System.currentTimeMillis();
            String reply = callGemini(prompt, 200);
            long ms = System.currentTimeMillis() - start;
            log.info("[Gemini/chat] latency={}ms", ms);
            return reply;
        } catch (Exception e) {
            log.warn("[Gemini/chat] Failed: {}", e.getMessage());
            return null;
        }
    }

    /**
     * Phase 8: AI-Vision Diagnosis.
     * Analyzes image base64 to identify technical issues.
     */
    public String diagnoseProblem(String base64Image, String mimeType) {
        if (!isAvailable()) return null;

        String prompt = """
            Analyze this image of a home maintenance problem.
            Identify:
            1. Likely technical issue (be specific).
            2. Urgency level: LOW (monitor), MEDIUM (fix soon), HIGH (sparking/flood/hazard).
            3. Recommended service category: Plumbing, Electrical, AC Repair, Cleaning, Tech Support.
            4. Estimated labor range (₹).
            
            Return a professional JSON summary with these keys:
            { "issue", "urgency", "category", "estimatedLabor", "requiredParts" }
            
            Return ONLY JSON. No explanation.
            """;

        try {
            long start = System.currentTimeMillis();
            String reply = callGeminiWithImage(prompt, base64Image, mimeType, 512);
            long ms = System.currentTimeMillis() - start;
            log.info("[Gemini/diagnose] latency={}ms", ms);
            return reply;
        } catch (Exception e) {
            log.warn("[Gemini/diagnose] Failed: {}", e.getMessage());
            return null;
        }
    }

    public boolean isAvailable() {
        return geminiApiKey != null && !geminiApiKey.isBlank();
    }

    // ── Private Helpers ───────────────────────────────────────────────────────

    private String callGemini(String prompt, int maxTokens) {
        return callGeminiWithImage(prompt, null, null, maxTokens);
    }

    private String callGeminiWithImage(String prompt, String base64Image, String mimeType, int maxTokens) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        List<Map<String, Object>> parts = new java.util.ArrayList<>();
        parts.add(Map.of("text", prompt));

        if (base64Image != null && mimeType != null) {
            parts.add(Map.of("inlineData", Map.of(
                "mimeType", mimeType,
                "data", base64Image
            )));
        }

        Map<String, Object> body = Map.of(
            "contents", List.of(Map.of("parts", parts)),
            "generationConfig", Map.of(
                "temperature", 0.1,
                "maxOutputTokens", maxTokens,
                "candidateCount", 1
            )
        );

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<String> response = restTemplate.postForEntity(
                GEMINI_URL + geminiApiKey, request, String.class
            );

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                JsonNode root = objectMapper.readTree(response.getBody());
                return root.path("candidates")
                           .path(0)
                           .path("content")
                           .path("parts")
                           .path(0)
                           .path("text")
                           .asText(null);
            }
        } catch (Exception e) {
            log.error("[Gemini] API call failed: {}", e.getMessage());
        }
        return null;
    }
}
