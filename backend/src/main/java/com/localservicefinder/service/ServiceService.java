package com.localservicefinder.service;

import com.localservicefinder.model.Service;
import com.localservicefinder.model.User;
import com.localservicefinder.repository.ServiceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@org.springframework.stereotype.Service
public class ServiceService {
    @Autowired
    ServiceRepository serviceRepository;

    @Autowired
    AuthService authService;

    public List<Service> getAllServices() {
        return serviceRepository.findAll();
    }

    public List<Service> searchServices(String category, String location, Double minPrice, 
                                       Double maxPrice, Double minRating) {
        return serviceRepository.searchServices(category, location, minPrice, maxPrice, minRating);
    }

    public List<Service> searchByQuery(String query) {
        return serviceRepository.searchByQuery(query);
    }

    public List<String> getAllCategories() {
        return serviceRepository.findAllDistinctCategories();
    }

    public Optional<Service> getServiceById(Long id) {
        return serviceRepository.findById(id);
    }

    @Transactional
    public Service createService(Service service) {
        User currentUser = authService.getCurrentUser();
        if (currentUser == null) {
            throw new RuntimeException("User not authenticated");
        }
        if (currentUser.getRole() != User.Role.PROVIDER && currentUser.getRole() != User.Role.ADMIN) {
            throw new RuntimeException("Only providers and admins can create services");
        }
        service.setProvider(currentUser);
        return serviceRepository.save(service);
    }

    @Transactional
    public Service updateService(Long id, Service serviceDetails) {
        Service service = serviceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Service not found"));
        
        User currentUser = authService.getCurrentUser();
        if (currentUser.getRole() != User.Role.ADMIN && 
            !service.getProvider().getId().equals(currentUser.getId())) {
            throw new RuntimeException("You don't have permission to update this service");
        }

        if (serviceDetails.getTitle() != null) {
            service.setTitle(serviceDetails.getTitle());
        }
        if (serviceDetails.getDescription() != null) {
            service.setDescription(serviceDetails.getDescription());
        }
        if (serviceDetails.getCategory() != null) {
            service.setCategory(serviceDetails.getCategory());
        }
        if (serviceDetails.getPrice() != null) {
            service.setPrice(serviceDetails.getPrice());
        }
        if (serviceDetails.getLocation() != null) {
            service.setLocation(serviceDetails.getLocation());
        }
        if (serviceDetails.getLatitude() != null) {
            service.setLatitude(serviceDetails.getLatitude());
        }
        if (serviceDetails.getLongitude() != null) {
            service.setLongitude(serviceDetails.getLongitude());
        }
        if (serviceDetails.getImageUrl() != null) {
            service.setImageUrl(serviceDetails.getImageUrl());
        }
        if (serviceDetails.getIsAvailable() != null) {
            service.setIsAvailable(serviceDetails.getIsAvailable());
        }

        return serviceRepository.save(service);
    }

    @Transactional
    public void deleteService(Long id) {
        Service service = serviceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Service not found"));

        User currentUser = authService.getCurrentUser();
        boolean canDelete = currentUser.getRole() == User.Role.ADMIN
                || service.getProvider().getId().equals(currentUser.getId());
        if (!canDelete) {
            throw new RuntimeException("You don't have permission to delete this service");
        }

        serviceRepository.delete(service);
    }

    public List<Service> getServicesByProvider(Long providerId) {
        return serviceRepository.findByProviderId(providerId);
    }

    public List<Service> getMyServices() {
        User currentUser = authService.getCurrentUser();
        if (currentUser == null) {
            throw new RuntimeException("Not authenticated");
        }
        if (currentUser.getRole() != User.Role.PROVIDER && currentUser.getRole() != User.Role.ADMIN) {
            throw new RuntimeException("Only providers can list their services");
        }
        return serviceRepository.findByProviderId(currentUser.getId());
    }
}
