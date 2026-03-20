package com.akademi.service;

import com.akademi.dto.request.ResourceRequest;
import com.akademi.dto.response.ApiResponse;
import com.akademi.enums.ResourceStatus;
import com.akademi.exception.ResourceNotFoundException;
import com.akademi.model.Resource;
import com.akademi.repository.ResourceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ResourceService {

    private final ResourceRepository resourceRepository;

    public List<Resource> getAllResources() {
        return resourceRepository.findAll();
    }

    public List<Resource> getAvailableResources() {
        return resourceRepository.findByStatus(ResourceStatus.AVAILABLE);
    }

    public Resource getResourceById(Long id) {
        return resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource", id));
    }

    public Resource createResource(ResourceRequest request) {
        Resource resource = Resource.builder()
                .name(request.getName())
                .description(request.getDescription())
                .location(request.getLocation())
                .capacity(request.getCapacity())
                .status(request.getStatus())
                .imageUrl(request.getImageUrl())
                .openingTime(request.getOpeningTime())
                .closingTime(request.getClosingTime())
                .build();
        return resourceRepository.save(resource);
    }

    public Resource updateResource(Long id, ResourceRequest request) {
        Resource resource = getResourceById(id);
        resource.setName(request.getName());
        resource.setDescription(request.getDescription());
        resource.setLocation(request.getLocation());
        resource.setCapacity(request.getCapacity());
        resource.setStatus(request.getStatus());
        resource.setImageUrl(request.getImageUrl());
        resource.setOpeningTime(request.getOpeningTime());
        resource.setClosingTime(request.getClosingTime());
        return resourceRepository.save(resource);
    }

    public void deleteResource(Long id) {
        Resource resource = getResourceById(id);
        resourceRepository.delete(resource);
    }

    public List<Resource> searchResources(String name) {
        return resourceRepository.findByNameContainingIgnoreCase(name);
    }
}
