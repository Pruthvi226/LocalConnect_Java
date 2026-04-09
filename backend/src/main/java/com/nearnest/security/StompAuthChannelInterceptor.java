package com.nearnest.security;

import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.lang.NonNull;

@Component
public class StompAuthChannelInterceptor implements ChannelInterceptor {
    private final JwtUtils jwtUtils;
    private final UserDetailsServiceImpl userDetailsService;

    public StompAuthChannelInterceptor(JwtUtils jwtUtils, UserDetailsServiceImpl userDetailsService) {
        this.jwtUtils = jwtUtils;
        this.userDetailsService = userDetailsService;
    }

    @Override
    public Message<?> preSend(@NonNull Message<?> message, @NonNull MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        if (accessor == null) {
            return message;
        }

        if (StompCommand.CONNECT.equals(accessor.getCommand())) {
            String authHeader = accessor.getFirstNativeHeader("Authorization");
            if (authHeader == null || authHeader.isBlank()) {
                throw new IllegalArgumentException("Missing Authorization header");
            }

            String token = authHeader.startsWith("Bearer ") ? authHeader.substring("Bearer ".length()) : authHeader;
            if (!jwtUtils.validateToken(token)) {
                throw new IllegalArgumentException("Invalid JWT token");
            }

            String username = jwtUtils.extractUsername(token);
            UserDetails userDetails = userDetailsService.loadUserByUsername(username);

            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
            accessor.setUser(authentication);
            SecurityContextHolder.getContext().setAuthentication(authentication);
        }

        return message;
    }
}

