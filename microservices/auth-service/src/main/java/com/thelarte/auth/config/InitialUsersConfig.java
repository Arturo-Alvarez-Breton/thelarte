package com.thelarte.auth.config;

import com.thelarte.auth.entity.User;
import com.thelarte.auth.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

@Configuration
public class InitialUsersConfig {

    @Bean
    public CommandLineRunner initializeUsers(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            List<String> defaultUsers = Arrays.asList("edwinb", "jeanp", "arturob");
            String defaultPassword = "1234";

            for (String username : defaultUsers) {
                if (!userRepository.existsByEmail(username)) {
                    User user = new User();
                    user.setEmail(username);
                    user.setPassword(passwordEncoder.encode(defaultPassword));
                    user.setRoles(Collections.singletonList("ROLE_USER"));
                    user.setActive(true);
                    userRepository.save(user);
                    System.out.println("Usuario creado: " + username);
                }
            }
        };
    }
}
