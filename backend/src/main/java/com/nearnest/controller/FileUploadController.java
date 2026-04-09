package com.nearnest.controller;

import com.nearnest.service.FileStorageService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

/**
 * Handles file uploads. Files are stored on the local disk (uploads/ directory)
 * and served back via /uploads/** static resource path.
 *
 * Future upgrade: replace FileStorageService.storeFile() with Cloudinary upload.
 */
@RestController
@RequestMapping("/api/upload")
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"}, allowCredentials = "true")
public class FileUploadController {

    private final FileStorageService fileStorageService;

    public FileUploadController(FileStorageService fileStorageService) {
        this.fileStorageService = fileStorageService;
    }

    /**
     * Upload a single image file.
     * POST /api/upload/image
     * Content-Type: multipart/form-data
     * Form field: "file"
     *
     * Returns: { "url": "/uploads/uuid.jpg" }
     */
    @PostMapping("/image")
    public ResponseEntity<Map<String, String>> uploadImage(
            @RequestParam("file") MultipartFile file) {
        String url = fileStorageService.storeFile(file);
        return ResponseEntity.ok(Map.of("url", url));
    }
}
