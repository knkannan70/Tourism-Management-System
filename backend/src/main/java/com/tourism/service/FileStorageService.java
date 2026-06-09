package com.tourism.service;

import com.tourism.exception.BadRequestException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.*;
import java.util.UUID;

@Service
public class FileStorageService {

    @Value("${file.upload-dir}")
    private String uploadDir;

    @Value("${github.api.token:}")
    private String githubToken;

    @Value("${github.repo:knkannan70/tourism}")
    private String githubRepo;

    public String storeFile(MultipartFile file, String folder) {
        if (githubToken != null && !githubToken.isEmpty()) {
            return storeToGithub(file, folder);
        }
        return storeToLocal(file, folder);
    }

    private String storeToLocal(MultipartFile file, String folder) {
        try {
            Path uploadPath = Paths.get(uploadDir, folder).toAbsolutePath().normalize();
            Files.createDirectories(uploadPath);
            String ext = "";
            String originalName = file.getOriginalFilename();
            if (originalName != null && originalName.contains(".")) {
                ext = originalName.substring(originalName.lastIndexOf("."));
            }
            String fileName = UUID.randomUUID() + ext;
            Path targetLocation = uploadPath.resolve(fileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
            return "/uploads/" + folder + "/" + fileName;
        } catch (IOException ex) {
            throw new BadRequestException("Could not store file locally: " + ex.getMessage());
        }
    }

    private String storeToGithub(MultipartFile file, String folder) {
        try {
            String ext = "";
            String originalName = file.getOriginalFilename();
            if (originalName != null && originalName.contains(".")) {
                ext = originalName.substring(originalName.lastIndexOf("."));
            }
            String fileName = folder + "/" + UUID.randomUUID() + ext;
            
            // Encode file to base64
            byte[] fileContent = file.getBytes();
            String base64Content = java.util.Base64.getEncoder().encodeToString(fileContent);

            org.springframework.web.client.RestTemplate restTemplate = new org.springframework.web.client.RestTemplate();
            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
            headers.set("Authorization", "Bearer " + githubToken);
            headers.set("Accept", "application/vnd.github.v3+json");
            headers.set("User-Agent", "Tourism-App");

            String url = "https://api.github.com/repos/" + githubRepo + "/contents/" + fileName;

            java.util.Map<String, Object> body = new java.util.HashMap<>();
            body.put("message", "Upload " + fileName + " via Tourism App");
            body.put("content", base64Content);

            org.springframework.http.HttpEntity<java.util.Map<String, Object>> entity = new org.springframework.http.HttpEntity<>(body, headers);

            org.springframework.http.ResponseEntity<java.util.Map> response = restTemplate.exchange(
                    url, org.springframework.http.HttpMethod.PUT, entity, java.util.Map.class
            );

            if (response.getStatusCode().is2xxSuccessful()) {
                // Return the raw github user content URL
                return "https://raw.githubusercontent.com/" + githubRepo + "/main/" + fileName;
            } else {
                throw new BadRequestException("GitHub API error: " + response.getStatusCode());
            }
        } catch (org.springframework.web.client.HttpClientErrorException.NotFound e) {
            throw new BadRequestException("GitHub returned 404. Ensure your token has the 'repo' scope and the repository exists.");
        } catch (org.springframework.web.client.HttpClientErrorException.Unauthorized e) {
            throw new BadRequestException("GitHub token is invalid or expired.");
        } catch (Exception ex) {
            throw new BadRequestException("Could not store file to GitHub: " + ex.getMessage());
        }
    }

    public void deleteFile(String filePath) {
        if (filePath == null || filePath.isBlank()) return;
        if (filePath.startsWith("http")) {
            if (githubToken != null && !githubToken.isEmpty() && filePath.contains(githubRepo)) {
                deleteFromGithub(filePath);
            }
            return;
        }
        try {
            String fileName = filePath.replace("/uploads/", "");
            Path path = Paths.get(uploadDir).toAbsolutePath().resolve(fileName);
            Files.deleteIfExists(path);
        } catch (IOException ignored) {}
    }

    private void deleteFromGithub(String fileUrl) {
        try {
            // Extract file path from URL
            // URL format: https://raw.githubusercontent.com/knkannan70/tourism/main/places/123.jpg
            String prefix = "https://raw.githubusercontent.com/" + githubRepo + "/main/";
            if (!fileUrl.startsWith(prefix)) return;
            
            String filePath = fileUrl.substring(prefix.length());
            String apiUrl = "https://api.github.com/repos/" + githubRepo + "/contents/" + filePath;

            org.springframework.web.client.RestTemplate restTemplate = new org.springframework.web.client.RestTemplate();
            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
            headers.set("Authorization", "Bearer " + githubToken);
            headers.set("Accept", "application/vnd.github.v3+json");
            headers.set("User-Agent", "Tourism-App");

            // 1. Get file SHA
            org.springframework.http.HttpEntity<Void> getEntity = new org.springframework.http.HttpEntity<>(headers);
            org.springframework.http.ResponseEntity<java.util.Map> getResponse = restTemplate.exchange(
                    apiUrl, org.springframework.http.HttpMethod.GET, getEntity, java.util.Map.class
            );

            if (getResponse.getStatusCode().is2xxSuccessful() && getResponse.getBody() != null) {
                String sha = (String) getResponse.getBody().get("sha");

                // 2. Delete file using SHA
                java.util.Map<String, Object> body = new java.util.HashMap<>();
                body.put("message", "Delete " + filePath + " via Tourism App");
                body.put("sha", sha);

                org.springframework.http.HttpEntity<java.util.Map<String, Object>> deleteEntity = new org.springframework.http.HttpEntity<>(body, headers);
                restTemplate.exchange(apiUrl, org.springframework.http.HttpMethod.DELETE, deleteEntity, java.util.Map.class);
            }
        } catch (Exception ex) {
            // Log error but don't throw exception to avoid breaking transactions just because of an old image delete failure
            System.err.println("Could not delete file from GitHub: " + ex.getMessage());
        }
    }
}
