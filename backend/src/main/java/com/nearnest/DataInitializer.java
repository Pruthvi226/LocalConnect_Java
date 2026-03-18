package com.nearnest;

import com.nearnest.model.Service;
import com.nearnest.model.User;
import com.nearnest.repository.ServiceRepository;
import com.nearnest.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

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
                        u.setFullName("Demo Provider");
                        u.setPhone("9999999999");
                        u.setAddress("Bangalore, India");
                        u.setRole(User.Role.PROVIDER);
                        return userRepository.save(u);
                    });

            serviceRepository.save(createService(provider, "Plumber – Pipe Leak Repair",
                    "Quick and reliable pipe leak repair for kitchens and bathrooms.",
                    "Plumbing", new BigDecimal("300")));
            serviceRepository.save(createService(provider, "Electrician – Switch Board Repair",
                    "Safe repair and replacement of faulty switch boards and wiring.",
                    "Electrical", new BigDecimal("400")));
            serviceRepository.save(createService(provider, "AC Technician – AC Gas Refill",
                    "Professional AC gas refill and cooling performance check.",
                    "AC Technician", new BigDecimal("1200")));
            serviceRepository.save(createService(provider, "Carpenter – Furniture Repair",
                    "Repair and refurbishment of wooden furniture and fittings.",
                    "Carpentry", new BigDecimal("700")));
            serviceRepository.save(createService(provider, "Painter – Wall Painting",
                    "Interior and exterior wall painting with premium paints.",
                    "Painting", new BigDecimal("1500")));
            serviceRepository.save(createService(provider, "Cleaner – Home Cleaning",
                    "Deep cleaning service for homes and apartments.",
                    "Cleaning", new BigDecimal("600")));
            serviceRepository.save(createService(provider, "RO Technician – Water Filter Service",
                    "RO water purifier service, filter change, and maintenance.",
                    "RO Technician", new BigDecimal("500")));
        };
    }

    private Service createService(User provider,
                                  String title,
                                  String description,
                                  String category,
                                  BigDecimal price) {
        Service s = new Service();
        s.setProvider(provider);
        s.setTitle(title);
        s.setDescription(description);
        s.setCategory(category);
        s.setPrice(price);
        s.setLocation(provider.getAddress());
        s.setIsAvailable(true);
        return s;
    }
}

