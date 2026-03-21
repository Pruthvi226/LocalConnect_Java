package com.nearnest.repository;

import com.nearnest.model.Service;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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
           "(:isAvailableNow IS NULL OR s.isAvailableNow = :isAvailableNow) AND " +
           "s.isAvailable = true")
    Page<Service> searchServices(
        @Param("category") String category,
        @Param("location") String location,
        @Param("minPrice") Double minPrice,
        @Param("maxPrice") Double maxPrice,
        @Param("minRating") Double minRating,
        @Param("isAvailableNow") Boolean isAvailableNow,
        Pageable pageable
    );
    
    @Query("SELECT DISTINCT s.category FROM Service s ORDER BY s.category")
    List<String> findAllDistinctCategories();
    
    @Query("SELECT s FROM Service s WHERE LOWER(s.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(s.description) LIKE LOWER(CONCAT('%', :query, '%'))")
    Page<Service> searchByQuery(@Param("query") String query, Pageable pageable);
    
    List<Service> findByProviderId(Long providerId);
}
