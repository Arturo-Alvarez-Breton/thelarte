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
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .authorizeHttpRequests(auth -> auth
                .anyRequest().permitAll()  // TEMPORARY: Allow all requests for debugging
            )
//            .cors(cors -> cors.configurationSource(corsConfigurationSource()))            .authorizeHttpRequests(auth -> auth
//                .requestMatchers("/login", "/login.html", "/register", "/h2-console/**", "/", "/static/**", "/frontend/**", "/css/**", "/js/**", "/pages/**").permitAll()
//                .requestMatchers("*.html", "*.css", "*.js").permitAll()
//                .requestMatchers("/dashboard", "/dashboard.html").permitAll()  // Allow access, JS will handle auth
//                .requestMatchers("/suplidor/**").permitAll()  // Make suplidor pages public
//                .requestMatchers("/api/dashboard/validate").hasAnyRole("VENDEDOR", "GERENTE", "TI", "CONTABILIDAD")  // All roles can access dashboard
//                .requestMatchers("/api/suplidores/**").permitAll()  // Make suplidor API public
//                .requestMatchers("/api/productos/**").permitAll()
//                .requestMatchers("/producto/**").permitAll()
//                .requestMatchers("/uploads/**").permitAll()
//                .requestMatchers("/api/unidades/**").permitAll()
//                .requestMatchers("/unidades/**").permitAll()
//                .anyRequest().authenticated())
            .userDetailsService(userService)
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        http.headers(headers -> headers.frameOptions(frame -> frame.sameOrigin()));

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