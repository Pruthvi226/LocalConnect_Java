package com.nearnest.config;

import com.nearnest.model.Service;
import com.nearnest.model.User;
import com.nearnest.repository.ServiceRepository;
import com.nearnest.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.util.Random;

@Configuration
public class DatabaseSeeder {

    @Bean
    CommandLineRunner initDatabase(UserRepository userRepository, 
                                 ServiceRepository serviceRepository,
                                 PasswordEncoder passwordEncoder) {
        return args -> {
            System.out.println("Checking database seed status...");

            // ─── IDEMPOTENT GUARD ─────────────────────────────────────────────────────
            // CRITICAL FIX: Only seed when DB is empty. Previous code called
            // serviceRepository.deleteAll() on every restart, wiping all data.
            if (serviceRepository.count() > 0) {
                System.out.println("Database already seeded. Skipping. (services=" + serviceRepository.count() + ")");
                return;
            }
            System.out.println("Empty database detected. Starting initial seed...");

            String[] categories = {
                "Plumbing", "Electrical", "Tutoring", "Cleaning", 
                "AC Repair", "Pest Control", "Gardening", "Moving"
            };

            String[] locations = {
                "Mumbai, Andheri", "Mumbai, Bandra", "Bangalore, Indiranagar", 
                "Bangalore, Koramangala", "Delhi, Saket", "Delhi, Rohini",
                "Pune, Hinjewadi", "Pune, Kothrud"
            };

            double[][] coords = {
                {19.1136, 72.8697}, {19.0596, 72.8295}, {12.9719, 77.6412},
                {12.9352, 77.6245}, {28.5244, 77.2100}, {28.7041, 77.1025},
                {18.5913, 73.7389}, {18.5074, 73.8077}
            };

            String[] bios = {
                "Certified professional with over 10 years of experience in high-end residential projects. Specialized in modern techniques and sustainable solutions.",
                "Top-rated expert dedicated to providing reliable and efficient service. Known for attention to detail and customer satisfaction.",
                "Highly skilled specialist with a background in large-scale commercial installations. Committed to safety and excellence.",
                "Award-winning professional offering premium services. Passionate about quality and clear communication with every client."
            };

            // Fixed seed → reproducible, consistent demo data every time
            Random random = new Random(42);

            for (int i = 1; i <= 15; i++) {
                String username = "vendor" + i;
                String category = categories[random.nextInt(categories.length)];
                String location = locations[random.nextInt(locations.length)];
                String fullName = getProviderName(i);

                // Only create if not already present
                if (userRepository.findByUsername(username).isEmpty()) {
                    User provider = new User();
                    provider.setUsername(username);
                    provider.setEmail(username + "@proxisense.com");
                    provider.setPassword(passwordEncoder.encode("Test@1234"));
                    provider.setRole(User.Role.PROVIDER);
                    provider.setFullName(fullName);
                    provider.setPhone("+91 98765" + String.format("%05d", 10000 + i));
                    provider.setAddress(location + ", Street " + i);
                    provider.setBio(bios[i % bios.length]);
                    provider = userRepository.save(provider);

                    int numServices = 2 + random.nextInt(3);
                    for (int j = 1; j <= numServices; j++) {
                        Service service = new Service();
                        service.setTitle(getServiceTitle(category, j));
                        service.setCategory(category);
                        service.setDescription("Expert " + category + " services by " + provider.getFullName()
                                + ". Professional tools, certified workers, and 24/7 support.");
                        service.setPrice(BigDecimal.valueOf(500 + random.nextInt(2500)));
                        service.setLocation(location);
                        service.setImageUrl(getCategoryImage(category, j));
                        service.setBeforeImageUrl(getBeforeImage(category, j));
                        service.setAfterImageUrl(getAfterImage(category, j));
                        service.setAverageRating(3.5 + (random.nextDouble() * 1.5));
                        service.setTotalReviews(10 + random.nextInt(200));
                        service.setIsAvailable(random.nextDouble() > 0.2);

                        int locIdx = -1;
                        for (int k = 0; k < locations.length; k++) {
                            if (locations[k].equals(location)) { locIdx = k; break; }
                        }
                        if (locIdx != -1) {
                            service.setLatitude(coords[locIdx][0] + (random.nextDouble() - 0.5) * 0.01);
                            service.setLongitude(coords[locIdx][1] + (random.nextDouble() - 0.5) * 0.01);
                        }
                        service.setProvider(provider);
                        serviceRepository.save(service);
                    }
                }
            }

            // ─── Demo Customer ────────────────────────────────────────────────────────
            if (userRepository.findByUsername("customer1").isEmpty()) {
                User customer = new User();
                customer.setUsername("customer1");
                customer.setEmail("customer@proxisense.com");
                customer.setPassword(passwordEncoder.encode("Test@1234"));
                customer.setFullName("Verified Customer");
                customer.setPhone("+91 99999 00001");
                customer.setAddress("Mumbai, Andheri");
                customer.setRole(User.Role.USER);
                userRepository.save(customer);
                System.out.println("Created customer: customer1 / Test@1234");
            }

            // ─── E2E Test Customer ────────────────────────────────────────────────────
            if (userRepository.findByUsername("user1").isEmpty()) {
                User user1 = new User();
                user1.setUsername("user1");
                user1.setEmail("user1@proxisense.com");
                user1.setPassword(passwordEncoder.encode("Test@1234"));
                user1.setFullName("Audit Customer");
                user1.setRole(User.Role.USER);
                userRepository.save(user1);
                System.out.println("Created test customer: user1 / Test@1234");
            }

            // ─── Admin Account (was previously missing) ───────────────────────────────
            if (userRepository.findByUsername("admin").isEmpty()) {
                User admin = new User();
                admin.setUsername("admin");
                admin.setEmail("admin@proxisense.com");
                admin.setPassword(passwordEncoder.encode("Admin@1234"));
                admin.setFullName("System Administrator");
                admin.setPhone("+91 00000 00000");
                admin.setRole(User.Role.ADMIN);
                userRepository.save(admin);
                System.out.println("Created admin account: admin / Admin@1234");
            }

            System.out.println("Database seeding completed successfully.");
        };
    }

    private String getProviderName(int i) {
        String[] names = {
            "Rajesh Kumar", "Amit Sharma", "Sneha Patil", "Vijay Singh", 
            "Priya Iyer", "Anil Mehta", "Sunita Rao", "Deepak Gupta",
            "Megha Joshi", "Suresh Reddy", "Kiran Verma", "Pooja Malhotra",
            "Vikram Deshmukh", "Nisha Khan", "Rahul Bose"
        };
        return names[(i - 1) % names.length];
    }

    private String getCategoryImage(String category, int j) {
        String[] plumbing = {
            "https://images.unsplash.com/photo-1504148455328-c376907d081c",
            "https://images.unsplash.com/photo-1581244276891-99659424827f",
            "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39"
        };
        String[] electrical = {
            "https://images.unsplash.com/photo-1621905251189-08b45d6a269e",
            "https://images.unsplash.com/photo-1544724569-5f546fd6f2b5"
        };
        String[] tutoring = {
            "https://images.unsplash.com/photo-1522202176988-66273c2fd55f",
            "https://images.unsplash.com/photo-1434030216411-0b793f4b4173",
            "https://images.unsplash.com/photo-1524178232363-1fb2b075b655"
        };
        String[] cleaning = {
            "https://images.unsplash.com/photo-1581578731548-c64695cc6958",
            "https://images.unsplash.com/photo-1528740561666-dc2479dc08ab",
            "https://images.unsplash.com/photo-1563453392212-326f5e854473"
        };
        String[] ac = {
            "https://images.unsplash.com/photo-1631545866282-2972417ec627",
            "https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5",
            "https://images.unsplash.com/photo-1621360841013-c7683c659ec6"
        };
        String[] pest = {
            "https://images.unsplash.com/photo-1587393855524-087f83d95bc9",
            "https://images.unsplash.com/photo-1590684153400-09503893325e"
        };
        String[] garden = {
            "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae",
            "https://images.unsplash.com/photo-1592419044706-39796d40f98c",
            "https://images.unsplash.com/photo-1557429287-b2e26467fc2b"
        };
        String[] moving = {
            "https://images.unsplash.com/photo-1520509414578-d9cbf09933a1",
            "https://images.unsplash.com/photo-1600518464441-9154a4dea21b"
        };

        String[] pool;
        switch (category) {
            case "Plumbing":    pool = plumbing; break;
            case "Electrical":  pool = electrical; break;
            case "Tutoring":    pool = tutoring; break;
            case "Cleaning":    pool = cleaning; break;
            case "AC Repair":   pool = ac; break;
            case "Pest Control":pool = pest; break;
            case "Gardening":   pool = garden; break;
            case "Moving":      pool = moving; break;
            default:            pool = new String[]{"https://images.unsplash.com/photo-1581578731548-c64695cc6958"}; break;
        }
        return pool[j % pool.length] + "?auto=format&fit=crop&w=800&q=80";
    }

    private String getServiceTitle(String category, int index) {
        switch (category) {
            case "Plumbing": {
                String[] p = {"Emergency Leak Repair", "Full Bathroom Revive", "Advanced Kitchen Plumbing", "Drainage System Maintenance"};
                return p[index % p.length];
            }
            case "Electrical": {
                String[] e = {"Smart Home Wiring", "Modern Lighting Setup", "Electrical Safety Audit", "System Upgrade & Repair"};
                return e[index % e.length];
            }
            case "Tutoring": {
                String[] t = {"Advanced Mathematics", "Physics Masterclass", "SAT/GRE Preparation", "Creative Writing Workshop"};
                return t[index % t.length];
            }
            case "Cleaning": {
                String[] c = {"Deep Sanitization", "Premium Office Cleaning", "Industrial Space Revive", "Eco-Friendly Home Wash"};
                return c[index % c.length];
            }
            case "AC Repair": {
                String[] ac = {"Central Air Installation", "Split AC Duct Cleaning", "Rapid Cooling Maintenance", "Gas Refill & Check"};
                return ac[index % ac.length];
            }
            case "Pest Control": {
                String[] pc = {"Full Home Disinfection", "Commercial Pest Shield", "Ant & Termite Protection", "Herbal Pest Control"};
                return pc[index % pc.length];
            }
            case "Gardening": {
                String[] g = {"Landscape Design", "Lawn Overhaul", "Vertical Garden Setup", "Periodic Yard Care"};
                return g[index % g.length];
            }
            case "Moving": {
                String[] m = {"Interstate Relocation", "Local Furniture Transit", "Fragile Art Packing", "Office Asset Move"};
                return m[index % m.length];
            }
            default:
                return "Expert " + category + " Solutions";
        }
    }

    private String getBeforeImage(String category, int j) {
        if ("Cleaning".equals(category)) {
            String[] imgs = {"https://images.unsplash.com/photo-1584820927498-cafe2c161a0b", "https://images.unsplash.com/photo-1505691938895-1758d7feb511"};
            return imgs[j % imgs.length] + "?auto=format&fit=crop&w=800&q=80";
        } else if ("AC Repair".equals(category)) {
            String[] imgs = {"https://images.unsplash.com/photo-1534398079543-7ae6d016b801", "https://images.unsplash.com/photo-1621360841013-c7683c659ec6"};
            return imgs[j % imgs.length] + "?auto=format&fit=crop&w=800&q=80";
        } else if ("Plumbing".equals(category)) {
            String[] imgs = {"https://images.unsplash.com/photo-1585704033282-36fb1c49bf69", "https://images.unsplash.com/photo-1542013936693-884638332954"};
            return imgs[j % imgs.length] + "?auto=format&fit=crop&w=800&q=80";
        }
        return null;
    }

    private String getAfterImage(String category, int j) {
        if ("Cleaning".equals(category)) {
            String[] imgs = {"https://images.unsplash.com/photo-1581578731548-c64695cc6958", "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac"};
            return imgs[j % imgs.length] + "?auto=format&fit=crop&w=800&q=80";
        } else if ("AC Repair".equals(category)) {
            String[] imgs = {"https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5", "https://images.unsplash.com/photo-1527689638836-411945a2b57c"};
            return imgs[j % imgs.length] + "?auto=format&fit=crop&w=800&q=80";
        } else if ("Plumbing".equals(category)) {
            String[] imgs = {"https://images.unsplash.com/photo-1504148455328-c376907d081c", "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39"};
            return imgs[j % imgs.length] + "?auto=format&fit=crop&w=800&q=80";
        }
        return null;
    }
}
