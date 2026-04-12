package com.nearnest.config;

import com.nearnest.security.StompAuthChannelInterceptor;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
import org.springframework.lang.NonNull;

import java.util.Arrays;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
    private final StompAuthChannelInterceptor stompAuthChannelInterceptor;

    public WebSocketConfig(StompAuthChannelInterceptor stompAuthChannelInterceptor) {
        this.stompAuthChannelInterceptor = stompAuthChannelInterceptor;
    }

    @Override
    public void registerStompEndpoints(@NonNull StompEndpointRegistry registry) {
        // Resolve allowed origins from CORS_ALLOWED_ORIGINS env var (comma-separated).
        // Example: https://proxisense.vercel.app,http://localhost:3000
        // Falls back to localhost defaults when env var is not set (local dev).
        String rawOrigins = System.getenv("CORS_ALLOWED_ORIGINS");

        // Initialize with non-null local-dev defaults
        String[] allowedPatterns = { "http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:3001" };

        if (rawOrigins != null && !rawOrigins.isBlank()) {
            allowedPatterns = Arrays.stream(rawOrigins.split(","))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .toArray(String[]::new);
        }

        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns(allowedPatterns)
                .withSockJS();
    }

    @Override
    public void configureMessageBroker(@NonNull MessageBrokerRegistry registry) {
        registry.setApplicationDestinationPrefixes("/app");
        registry.setUserDestinationPrefix("/user");
        registry.enableSimpleBroker("/topic", "/queue");
    }

    @Override
    public void configureClientInboundChannel(@NonNull ChannelRegistration registration) {
        registration.interceptors(stompAuthChannelInterceptor);
    }
}
