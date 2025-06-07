package com.thelarte.gateway.config;

import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class GatewayConfig {    @Bean
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
                .uri("lb://sales-service"))            .route("billing-service", r -> r
                .path("/billing/**")
                .uri("lb://billing-service"))
            .route("user-service", r -> r
                .path("/users/**", "/api/empleados/**", "/api/clientes/**", "/api/personas/**")
                .uri("lb://user-service"))
            .build();
    }
}
