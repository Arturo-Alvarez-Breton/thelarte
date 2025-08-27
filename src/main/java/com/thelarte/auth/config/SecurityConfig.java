package com.thelarte.auth.config;

import com.thelarte.auth.security.JwtFilter;
import com.thelarte.auth.security.JwtTokenProvider;
import com.thelarte.auth.service.UserService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtTokenProvider tokenProvider;
    private final UserService userService;

    public SecurityConfig(JwtTokenProvider tokenProvider, UserService userService) {
        this.tokenProvider = tokenProvider;
        this.userService = userService;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        JwtFilter jwtFilter = new JwtFilter(tokenProvider);

        http
            .csrf(AbstractHttpConfigurer::disable)
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .authorizeHttpRequests(auth -> auth
                // Public routes - no authentication required
                .requestMatchers("/login", "/register", "/logout", "/pages/login.html", "/pages/payment-success.html").permitAll()
                .requestMatchers("/", "/static/**", "/css/**", "/js/**", "/images/**", "/uploads/**").permitAll()
                .requestMatchers("/h2-console/**").permitAll()

                // Role-based page access
                .requestMatchers("/pages/admin/**").hasRole("ADMINISTRADOR")
                .requestMatchers("/pages/ti/**").hasRole("TI")
                .requestMatchers("/pages/vendedor/**").hasRole("VENDEDOR")
                .requestMatchers("/pages/cajero/**").hasRole("CAJERO")
                .requestMatchers("/pages/contabilidad/**").hasRole("CONTABILIDAD")

                // API endpoints - role-based access
                .requestMatchers("/api/usuarios/**").hasAnyRole("ADMINISTRADOR", "TI")
                .requestMatchers("/api/empleados/**").hasAnyRole("ADMINISTRADOR", "TI")
                .requestMatchers("/api/suplidores/**").hasAnyRole("ADMINISTRADOR", "TI", "VENDEDOR")
                .requestMatchers("/api/productos/**").hasAnyRole("ADMINISTRADOR", "TI", "VENDEDOR", "CAJERO", "CONTABILIDAD")
                .requestMatchers("/api/transacciones/**").hasAnyRole("ADMINISTRADOR", "CONTABILIDAD", "CAJERO")

                .requestMatchers("/api/dashboard/validate").hasAnyRole("ADMINISTRADOR", "TI", "VENDEDOR", "CAJERO", "CONTABILIDAD")

                // All other requests require authentication
                .anyRequest().authenticated())
            .userDetailsService(userService)
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)
            .exceptionHandling(exceptions -> exceptions
                .authenticationEntryPoint((request, response, authException) -> {
                    String requestURI = request.getRequestURI();
                    if (requestURI.startsWith("/pages/") && !requestURI.equals("/pages/login.html")) {
                        response.sendRedirect("/pages/login.html");
                    } else {
                        response.sendError(401, "Unauthorized");
                    }
                })
                .accessDeniedHandler((request, response, accessDeniedException) -> {
                    String requestURI = request.getRequestURI();
                    if (requestURI.startsWith("/pages/")) {
                        response.sendRedirect("/pages/login.html");
                    } else {
                        response.sendError(403, "Access Denied");
                    }
                }));

        http.headers(headers -> headers.frameOptions(frameOptions -> frameOptions.sameOrigin()));

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(Arrays.asList("*"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }
}