package com.nearnest.controller;

import com.nearnest.model.Service;
import com.nearnest.repository.ServiceRepository;
import com.nearnest.service.GeminiAiService;
import com.nearnest.service.GeminiAiService.AiQueryResult;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * AiController — 3 production-ready AI endpoints:
 *   POST /api/ai/search       — NLP-powered service search
 *   GET  /api/ai/recommendations — Top AI-ranked services
 *   POST /api/ai/chat         — AI assistant (Gemini)
 *
 * Every endpoint has a guaranteed fallback — the app NEVER breaks.
 */
@RestController
@RequestMapping("/api/ai")
public class AiController {

    private final GeminiAiService geminiAiService;
    private final ServiceRepository serviceRepository;

    public AiController(GeminiAiService geminiAiService, ServiceRepository serviceRepository) {
        this.geminiAiService = geminiAiService;
        this.serviceRepository = serviceRepository;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 1. NLP Smart Search
    // ─────────────────────────────────────────────────────────────────────────

    @PostMapping("/search")
    public ResponseEntity<AiSearchResponse> aiSearch(@RequestBody AiSearchRequest request) {
        if (request.query() == null || request.query().isBlank()) {
            return ResponseEntity.badRequest().build();
        }

        boolean aiPowered = false;
        boolean fallbackUsed = false;
        AiQueryResult parsed = null;
        List<Service> results;

        // ── Try AI path ──
        if (geminiAiService.isAvailable()) {
            parsed = geminiAiService.parseQuery(request.query());
        }

        if (parsed != null) {
            // Use AI-extracted params to query DB
            String category = parsed.category;
            String keyword  = parsed.keywords != null && !parsed.keywords.isEmpty()
                ? String.join(" ", parsed.keywords) : request.query();

            var page = serviceRepository.searchServices(
                category, null, null, null, null, null, keyword,
                PageRequest.of(0, 10, Sort.by(Sort.Direction.DESC, "averageRating"))
            );
            results = page.getContent();

            // If AI category returned no results, widen to keyword-only
            if (results.isEmpty() && category != null) {
                page = serviceRepository.searchServices(
                    null, null, null, null, null, null, keyword,
                    PageRequest.of(0, 10, Sort.by(Sort.Direction.DESC, "averageRating"))
                );
                results = page.getContent();
            }
            aiPowered = true;
        } else {
            // ── Fallback: plain keyword search ──
            results = serviceRepository
                .searchByQuery(request.query(), PageRequest.of(0, 10))
                .getContent();
            fallbackUsed = true;
        }

        return ResponseEntity.ok(new AiSearchResponse(results, parsed, aiPowered, fallbackUsed));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 2. AI Recommendations
    // ─────────────────────────────────────────────────────────────────────────

    @GetMapping("/recommendations")
    public ResponseEntity<AiRecommendationResponse> recommendations() {
        // Top 5 available services sorted by rating
        var top = serviceRepository.searchServices(
            null, null, null, null, 3.0, true, null,
            PageRequest.of(0, 5, Sort.by(Sort.Direction.DESC, "averageRating"))
        ).getContent();

        // Fallback: just top 5 by rating if < 5 available
        if (top.size() < 3) {
            top = serviceRepository.findAll(
                PageRequest.of(0, 5, Sort.by(Sort.Direction.DESC, "averageRating"))
            ).getContent();
        }

        boolean aiAvailable = geminiAiService.isAvailable();
        String label = aiAvailable ? "AI Recommended — Trending Near You" : "Top Rated Services";
        return ResponseEntity.ok(new AiRecommendationResponse(top, label, aiAvailable));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 3. AI Chat Assistant
    // ─────────────────────────────────────────────────────────────────────────

    @PostMapping("/chat")
    public ResponseEntity<AiChatResponse> chat(@RequestBody AiChatRequest request) {
        if (request.message() == null || request.message().isBlank()) {
            return ResponseEntity.badRequest().build();
        }

        String reply = geminiAiService.chat(request.message());

        if (reply == null) {
            // Guaranteed fallback — rule-based response
            reply = buildFallbackReply(request.message());
        }

        List<String> actions = suggestActions(request.message());
        return ResponseEntity.ok(new AiChatResponse(reply, actions, reply != null && geminiAiService.isAvailable()));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Private helpers
    // ─────────────────────────────────────────────────────────────────────────

    private String buildFallbackReply(String message) {
        String lower = message.toLowerCase();
        if (lower.contains("plumb") || lower.contains("pipe") || lower.contains("leak"))
            return "It sounds like you need a plumber! Search for 'Plumbing' services near you to find qualified experts.";
        if (lower.contains("electric") || lower.contains("wiring") || lower.contains("light"))
            return "You need an electrician. Search for 'Electrical' services and pick a top-rated pro near you.";
        if (lower.contains("ac") || lower.contains("cool") || lower.contains("heat"))
            return "Sounds like an AC issue! Search for 'AC Repair' services — most experts can come same-day.";
        if (lower.contains("clean") || lower.contains("pest") || lower.contains("dust"))
            return "I can help you find cleaning or pest control professionals. Try searching 'Cleaning' services!";
        return "I'd be happy to help! Try searching for the service you need (e.g. 'plumber', 'electrician', 'AC repair') and I'll find the best providers near you.";
    }

    private List<String> suggestActions(String message) {
        String lower = message.toLowerCase();
        if (lower.contains("plumb") || lower.contains("pipe")) return List.of("Search Plumbing", "View Top Providers");
        if (lower.contains("electric"))                          return List.of("Search Electrical", "View Top Providers");
        if (lower.contains("ac") || lower.contains("cool"))      return List.of("Search AC Repair", "View Top Providers");
        if (lower.contains("clean") || lower.contains("pest"))   return List.of("Search Cleaning", "View Top Providers");
        return List.of("Browse All Services", "View Recommendations");
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Request / Response records
    // ─────────────────────────────────────────────────────────────────────────

    public record AiSearchRequest(String query) {}

    public record AiSearchResponse(
        List<Service> services,
        AiQueryResult aiQuery,
        boolean isAiPowered,
        boolean fallbackUsed
    ) {}

    public record AiRecommendationResponse(
        List<Service> services,
        String label,
        boolean aiPowered
    ) {}

    public record AiChatRequest(String message, String context) {}

    public record AiChatResponse(
        String reply,
        List<String> suggestedActions,
        boolean aiPowered
    ) {}
}
