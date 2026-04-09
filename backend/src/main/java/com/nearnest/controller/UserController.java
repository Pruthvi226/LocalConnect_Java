package com.nearnest.controller;

import com.nearnest.dto.UserProfileDto;
import com.nearnest.dto.UserUpdateDto;
import com.nearnest.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Objects;

@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"}, allowCredentials = "true")
@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping("/me")
    public ResponseEntity<UserProfileDto> getCurrentUser() {
        return ResponseEntity.ok(userService.getCurrentUserProfile());
    }

    @PutMapping("/me")
    public ResponseEntity<UserProfileDto> updateCurrentUser(@Valid @RequestBody UserUpdateDto updateRequest) {
        return ResponseEntity.ok(userService.updateUserProfile(Objects.requireNonNull(updateRequest)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserProfileDto> getUserById(@PathVariable(name = "id") Long id) {
        return ResponseEntity.ok(userService.getUserProfileById(Objects.requireNonNull(id)));
    }
}
