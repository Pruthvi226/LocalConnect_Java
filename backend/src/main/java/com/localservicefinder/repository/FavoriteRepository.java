package com.localservicefinder.repository;

import com.localservicefinder.model.Favorite;
import com.localservicefinder.model.User;
import com.localservicefinder.model.Service;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FavoriteRepository extends JpaRepository<Favorite, Long> {
    List<Favorite> findByUser(User user);

    Optional<Favorite> findByUserAndService(User user, Service service);

    boolean existsByUserAndService(User user, Service service);
}
