package com.localservicefinder.repository;

import com.localservicefinder.model.Service;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ServiceRepository extends JpaRepository<Service, Long> {
    List<Service> findByCategory(String category);
    List<Service> findByLocationContainingIgnoreCase(String location);
    List<Service> findByIsAvailableTrue();
    
    @Query("SELECT s FROM Service s WHERE " +
           "(:category IS NULL OR s.category = :category) AND " +
           "(:location IS NULL OR LOWER(s.location) LIKE LOWER(CONCAT('%', :location, '%'))) AND " +
           "(:minPrice IS NULL OR s.price >= :minPrice) AND " +
           "(:maxPrice IS NULL OR s.price <= :maxPrice) AND " +
           "(:minRating IS NULL OR s.averageRating >= :minRating) AND " +
           "s.isAvailable = true")
    List<Service> searchServices(
        @Param("category") String category,
        @Param("location") String location,
        @Param("minPrice") Double minPrice,
        @Param("maxPrice") Double maxPrice,
        @Param("minRating") Double minRating
    );
    
    @Query("SELECT DISTINCT s.category FROM Service s ORDER BY s.category")
    List<String> findAllDistinctCategories();
    
    @Query("SELECT s FROM Service s WHERE LOWER(s.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(s.description) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Service> searchByQuery(@Param("query") String query);
    
    List<Service> findByProviderId(Long providerId);
}
