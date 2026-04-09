package com.nearnest.service;

import com.nearnest.dto.JwtResponse;
import com.nearnest.dto.LoginRequest;
import com.nearnest.dto.RegisterRequest;
import com.nearnest.dto.UserDto;
import com.nearnest.exception.BadRequestException;
import com.nearnest.model.User;
import com.nearnest.repository.UserRepository;
import com.nearnest.security.JwtUtils;
import com.nearnest.security.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {
    @Autowired
    UserRepository userRepository;

    @Autowired
    PasswordEncoder passwordEncoder;

    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    JwtUtils jwtUtils;

    @Transactional
    public UserDto register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new BadRequestException("Username '" + request.getUsername() + "' is already taken.");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("An account with email '" + request.getEmail() + "' already exists.");
        }

        // Phone uniqueness check (only if phone is provided)
        if (request.getPhone() != null && !request.getPhone().isBlank()) {
            if (userRepository.existsByPhone(request.getPhone())) {
                throw new BadRequestException("An account with this phone number already exists.");
            }
        }

        // Password strength validation: min 8 chars, must contain at least 1 digit
        String password = request.getPassword();
        if (password == null || password.length() < 8) {
            throw new BadRequestException("Password must be at least 8 characters long.");
        }
        if (!password.matches(".*\\d.*")) {
            throw new BadRequestException("Password must contain at least one number.");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFullName(request.getFullName());
        user.setPhone(request.getPhone());
        user.setAddress(request.getAddress());
        
        if (request.getRole() != null && !request.getRole().isBlank()) {
            String roleInput = request.getRole().trim().toUpperCase();
            switch (roleInput) {
                case "PROVIDER":
                    user.setRole(User.Role.PROVIDER);
                    break;
                case "ADMIN":
                    user.setRole(User.Role.ADMIN);
                    break;
                case "CUSTOMER":
                case "USER":
                default:
                    user.setRole(User.Role.USER);
                    break;
            }
        } else {
            user.setRole(User.Role.USER);
        }

        User saved = userRepository.save(user);
        return UserDto.fromEntity(saved);
    }

    public JwtResponse login(LoginRequest request) {
        // Support login with either username or email
        String usernameOrEmail = request.getUsername();
        String resolvedUsername = usernameOrEmail;
        if (usernameOrEmail != null && usernameOrEmail.contains("@")) {
            // Treat as email, look up username
            resolvedUsername = userRepository.findByEmail(usernameOrEmail)
                    .map(User::getUsername)
                    .orElse(usernameOrEmail); // fall through so Spring Security returns proper error
        }

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(resolvedUsername, request.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        
        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found after successful authentication"));
                
        String roleStr = (user.getRole() != null) ? user.getRole().name() : User.Role.USER.name();

        String jwt = jwtUtils.generateToken(userDetails.getUsername(), roleStr);

        return new JwtResponse(jwt, user.getId(), user.getUsername(), user.getEmail(), roleStr);
    }

    public UserDto getCurrentUserDto() {
        User user = getCurrentUser();
        return user != null ? UserDto.fromEntity(user) : null;
    }

    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || 
            "anonymousUser".equals(authentication.getPrincipal())) {
            return null;
        }
        String username = authentication.getName();
        return userRepository.findByUsername(username).orElse(null);
    }
}
