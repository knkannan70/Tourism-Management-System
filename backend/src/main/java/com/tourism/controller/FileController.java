package com.tourism.controller;

import com.tourism.dto.response.ApiResponse;
import com.tourism.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
public class FileController {

    private final FileStorageService fileStorageService;

    @PostMapping("/upload")
    public ResponseEntity<ApiResponse<String>> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "folder", defaultValue = "misc") String folder) {
        String url = fileStorageService.storeFile(file, folder);
        return ResponseEntity.ok(ApiResponse.success("File uploaded successfully", url));
    }
}
