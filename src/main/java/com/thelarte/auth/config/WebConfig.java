package com.thelarte.auth.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.lang.NonNull;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(@NonNull ResourceHandlerRegistry registry) {
        // Serve frontend static files from classpath
        registry.addResourceHandler("/static/**")
                .addResourceLocations("classpath:/static/");
                
        // Serve the external frontend files
        registry.addResourceHandler("/frontend/**")
                .addResourceLocations("file:frontend/src/");
                
        registry.addResourceHandler("/css/**")
                .addResourceLocations("classpath:/static/css/");
                
        registry.addResourceHandler("/js/**")
                .addResourceLocations("classpath:/static/js/");
                
        registry.addResourceHandler("/pages/**")
                .addResourceLocations("classpath:/static/pages/");
                
        // Handle login.html specifically
        registry.addResourceHandler("/login.html")
                .addResourceLocations("classpath:/static/pages/");
    }

    @Override
    public void addViewControllers(@NonNull ViewControllerRegistry registry) {
        // Default route to login page
        registry.addViewController("/").setViewName("forward:/login.html");
    }
}
