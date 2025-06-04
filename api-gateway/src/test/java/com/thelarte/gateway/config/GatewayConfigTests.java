package com.thelarte.gateway.config;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.reactive.AutoConfigureWebTestClient;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.reactive.server.WebTestClient;

import static org.junit.jupiter.api.Assertions.assertNotNull;

@SpringBootTest
@AutoConfigureWebTestClient
@ActiveProfiles("test")
public class GatewayConfigTests {

    @Autowired
    private WebTestClient webTestClient;

    @Autowired
    private RouteLocator routeLocator;

    @Test
    void routeLocatorShouldBeConfigured() {
        assertNotNull(routeLocator, "RouteLocator should not be null");
    }

    @Test
    void healthEndpointShouldRespond() {
        webTestClient
            .get()
            .uri("/actuator/health")
            .exchange()
            .expectStatus().isOk();
    }
}
