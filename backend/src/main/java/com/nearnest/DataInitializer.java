package com.nearnest;

import com.nearnest.model.Service;
import com.nearnest.model.User;
import com.nearnest.repository.ServiceRepository;
import com.nearnest.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.lang.NonNull;

import java.math.BigDecimal;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initSampleData(UserRepository userRepository,
                                     ServiceRepository serviceRepository,
                                     PasswordEncoder passwordEncoder) {
        return args -> {
            if (serviceRepository.count() > 0) {
                return;
            }

            // Create a demo provider if none exists
            User provider = userRepository.findByUsername("demo_provider")
                    .orElseGet(() -> {
                        User u = new User();
                        u.setUsername("demo_provider");
                        u.setEmail("demo_provider@example.com");
                        u.setPassword(passwordEncoder.encode("Demo@123"));
                        u.setFullName("ProxiSense Premier Expert");
                        u.setPhone("9999999999");
                        u.setAddress("Bangalore, India");
                        u.setRole(User.Role.PROVIDER);
                        u.setTrustScore(94);
                        u.setCompletionRate(98.0);
                        u.setOnTimePerformance(95.5);
                        u.setAverageRating(4.8);
                        u.setTotalReviews(124);
                        u.setIsVerified(true);
                        return userRepository.save(u);
                    });

            if (provider == null) throw new RuntimeException("Demo provider could not be created/found");

            // Cleaning with Proof-of-Work
            serviceRepository.save(createServiceWithPortfolio(provider, "Deep Kitchen Degreasing & Cleaning",
                    "Complete restoration of kitchen surfaces, chimneys, and cabinets using industrial grade agents.",
                    "Cleaning", new BigDecimal("899"),
                    "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=1000&auto=format&fit=crop", // Before
                    "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?q=80&w=1000&auto=format&fit=crop"  // After
            ));

            // AC Repair with Proof-of-Work
            serviceRepository.save(createServiceWithPortfolio(provider, "AC Jet Service & Gas Charging",
                    "High-pressure jet cleaning and cooling optimization for all AC types.",
                    "AC Technician", new BigDecimal("1499"),
                    "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=1000&auto=format&fit=crop", // Before
                    "https://images.unsplash.com/photo-1599933310631-dbf2ae036f3e?q=80&w=1000&auto=format&fit=crop"  // After
            ));

            // Plumbing with Proof-of-Work
            serviceRepository.save(createServiceWithPortfolio(provider, "Bathroom Fitting & Leakage Fix",
                    "Stop leaks and upgrade your bathroom fixtures with our platinum plumbing service.",
                    "Plumbing", new BigDecimal("599"),
                    "https://images.unsplash.com/photo-1584622781564-1d987f7333c1?q=80&w=1000&auto=format&fit=crop", // Before
                    "https://images.unsplash.com/photo-1507652313519-d4e9174996dd?q=80&w=1000&auto=format&fit=crop"  // After
            ));

            serviceRepository.save(createService(provider, "Electrician – Switch Board Repair",
                    "Safe repair and replacement of faulty switch boards and wiring.",
                    "Electrical", new BigDecimal("400")));

            serviceRepository.save(createService(provider, "Carpenter – Furniture Repair",
                    "Repair and refurbishment of wooden furniture and fittings.",
                    "Carpentry", new BigDecimal("700")));
        };
    }

    @NonNull
    private Service createService(@NonNull User provider,
                                   String title,
                                   String description,
                                   String category,
                                   BigDecimal price) {
        return createServiceWithPortfolio(provider, title, description, category, price, null, null);
    }

    @NonNull
    private Service createServiceWithPortfolio(@NonNull User provider,
                                              String title,
                                              String description,
                                              String category,
                                              BigDecimal price,
                                              String beforeUrl,
                                              String afterUrl) {
        Service s = new Service();
        s.setProvider(provider);
        s.setTitle(title);
        s.setDescription(description);
        s.setCategory(category);
        s.setPrice(price);
        s.setLocation(provider.getAddress());
        s.setImageUrl(afterUrl != null ? afterUrl : "https://images.unsplash.com/photo-1581094794329-c8112a89af12?q=80&w=1000&auto=format&fit=crop");
        s.setBeforeImageUrl(beforeUrl);
        s.setAfterImageUrl(afterUrl);
        s.setIsAvailable(true);
        s.setAverageRating(4.5 + Math.random() * 0.5);
        s.setTotalReviews(10 + (int)(Math.random() * 50));
        return s;
    }
}

