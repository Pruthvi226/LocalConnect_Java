package com.nearnest.controller;

import com.nearnest.dto.JwtResponse;
import com.nearnest.dto.LoginRequest;
import com.nearnest.dto.RegisterRequest;
import com.nearnest.dto.UserDto;
import com.nearnest.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    @Autowired
    AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<UserDto> registerUser(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/register/customer")
    public ResponseEntity<UserDto> registerCustomer(@Valid @RequestBody RegisterRequest request) {
        request.setRole("USER");
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/register/provider")
    public ResponseEntity<UserDto> registerProvider(@Valid @RequestBody RegisterRequest request) {
        request.setRole("PROVIDER");
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<JwtResponse> authenticateUser(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @GetMapping("/me")
    public ResponseEntity<UserDto> getCurrentUser() {
        UserDto userDto = authService.getCurrentUserDto();
        if (userDto == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(userDto);
    }
}
