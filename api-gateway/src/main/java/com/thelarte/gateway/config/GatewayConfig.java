package com.thelarte.gateway.config;

import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsWebFilter;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;

@Configuration
public class GatewayConfig {
    
    @Bean
    public RouteLocator customRouteLocator(RouteLocatorBuilder builder) {
        return builder.routes()
            .route("auth-service", r -> r
                .path("/auth/**")
                .uri("lb://auth-service"))
            .route("inventory-service", r -> r
                .path("/inventory/**")
                .uri("lb://inventory-service"))
            .route("sales-service", r -> r
                .path("/sales/**")
                .uri("lb://sales-service"))            
            .route("billing-service", r -> r
                .path("/billing/**")
                .uri("lb://billing-service"))
            .route("user-service", r -> r
                .path("/users/**", "/api/empleados/**", "/api/clientes/**", "/api/personas/**")
                .uri("lb://user-service"))
            .build();
    }
      @Bean
    public CorsWebFilter corsWebFilter() {
        CorsConfiguration corsConfig = new CorsConfiguration();
        // Use setAllowedOriginPatterns for robust matching of origins like http://localhost:3000
        corsConfig.setAllowedOriginPatterns(java.util.Arrays.asList("http://localhost:3000", "http://localhost:8080"));
        corsConfig.addAllowedMethod("*"); // Allow all HTTP methods, including OPTIONS for preflight
        corsConfig.addAllowedHeader("*"); // Allow all headers
        corsConfig.setAllowCredentials(true); // Allow credentials (e.g., cookies, authorization headers)
        corsConfig.setMaxAge(3600L); // Cache preflight response for 1 hour

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", corsConfig); // Apply this CORS configuration to all paths

        return new CorsWebFilter(source);
    }
}
