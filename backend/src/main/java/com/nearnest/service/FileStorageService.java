package com.nearnest.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

/**
 * Handles local-disk file storage.
 * Future upgrade path: replace body of storeFile() to uploadToCloudinary().
 */
@Service
public class FileStorageService {

    private static final long   MAX_SIZE_BYTES     = 5 * 1024 * 1024; // 5 MB
    private static final List<String> ALLOWED_TYPES = Arrays.asList(
            "image/jpeg", "image/png", "image/webp", "image/gif");

    private final Path uploadRoot;

    public FileStorageService(@Value("${app.upload.dir:uploads}") String uploadDir) {
        this.uploadRoot = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.uploadRoot);
        } catch (IOException e) {
            throw new RuntimeException("Could not create upload directory: " + e.getMessage(), e);
        }
    }

    /**
     * Stores a multipart file on disk and returns the relative URL path.
     * @param file the uploaded file
     * @return relative serving path like "/uploads/abc123.jpg"
     */
    public String storeFile(MultipartFile file) {
        validateFile(file);

        String originalName = file.getOriginalFilename();
        String originalFilename = StringUtils.cleanPath(
                originalName != null && !originalName.isBlank() ? originalName : "upload.jpg");
        String extension = getExtension(originalFilename);
        String storedFilename = UUID.randomUUID() + (extension.isEmpty() ? ".jpg" : extension);

        Path targetPath = uploadRoot.resolve(storedFilename);
        try {
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new RuntimeException("Failed to store file: " + e.getMessage(), e);
        }

        return "/uploads/" + storedFilename;
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new RuntimeException("No file provided or file is empty.");
        }
        if (file.getSize() > MAX_SIZE_BYTES) {
            throw new RuntimeException("File size exceeds the 5MB limit.");
        }
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_TYPES.contains(contentType.toLowerCase())) {
            throw new RuntimeException("Invalid file type. Allowed types: JPEG, PNG, WebP, GIF.");
        }
    }

    private String getExtension(String filename) {
        int dotIndex = filename.lastIndexOf('.');
        return (dotIndex >= 0) ? filename.substring(dotIndex) : "";
    }
}
