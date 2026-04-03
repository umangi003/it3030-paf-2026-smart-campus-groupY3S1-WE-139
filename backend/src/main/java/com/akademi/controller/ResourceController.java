package com.akademi.controller;

import com.akademi.dto.request.ResourceRequest;
import com.akademi.dto.response.ApiResponse;
import com.akademi.model.Resource;
import com.akademi.service.ResourceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/resources")
@RequiredArgsConstructor
public class ResourceController {

    private final ResourceService resourceService;

    // Public — anyone can browse resources
    @GetMapping
    public ResponseEntity<ApiResponse<List<Resource>>> getAllResources() {
        return ResponseEntity.ok(ApiResponse.success(resourceService.getAllResources()));
    }

    @GetMapping("/available")
    public ResponseEntity<ApiResponse<List<Resource>>> getAvailableResources() {
        return ResponseEntity.ok(ApiResponse.success(resourceService.getAvailableResources()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Resource>> getResourceById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(resourceService.getResourceById(id)));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<Resource>>> searchResources(@RequestParam String name) {
        return ResponseEntity.ok(ApiResponse.success(resourceService.searchResources(name)));
    }

    // Admin only
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Resource>> createResource(@Valid @RequestBody ResourceRequest request) {
        Resource resource = resourceService.createResource(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Resource created successfully", resource));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Resource>> updateResource(
            @PathVariable Long id,
            @Valid @RequestBody ResourceRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Resource updated successfully",
                resourceService.updateResource(id, request)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteResource(@PathVariable Long id) {
        resourceService.deleteResource(id);
        return ResponseEntity.ok(ApiResponse.success("Resource deleted successfully", null));
    }
}
