package com.thelarte.auth.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * CORS configuration is now handled in SecurityConfig.java to avoid conflicts
 */
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    // CORS configuration moved to SecurityConfig.java
}
