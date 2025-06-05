package com.thelarte.auth.config;

import com.thelarte.auth.entity.User;
import com.thelarte.auth.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.Collections;

@Component
@Profile("dev")
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        initializeData();
    }

    private void initializeData() {
        if (userRepository.count() == 0) {
            logger.info("Initializing development data for auth-service...");
            
            // Create admin user
            User admin = new User();
            admin.setEmail("admin@thelarte.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setRoles(Arrays.asList("ROLE_USER", "ROLE_ADMIN"));
            admin.setActive(true);
            userRepository.save(admin);
            
            // Create regular user
            User user = new User();
            user.setEmail("user@thelarte.com");
            user.setPassword(passwordEncoder.encode("user123"));
            user.setRoles(Collections.singletonList("ROLE_USER"));
            user.setActive(true);
            userRepository.save(user);
            
            logger.info("Development data initialized successfully!");
            logger.info("Admin user: admin@thelarte.com / admin123");
            logger.info("Regular user: user@thelarte.com / user123");
        } else {
            logger.info("Development data already exists, skipping initialization.");
        }
    }
}
