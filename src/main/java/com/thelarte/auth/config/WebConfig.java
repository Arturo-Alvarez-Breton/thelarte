package com.thelarte.auth.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.lang.NonNull;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {    @Override
    public void addResourceHandlers(@NonNull ResourceHandlerRegistry registry) {
        // Serve frontend static files from classpath
        registry.addResourceHandler("/static/**")
                .addResourceLocations("classpath:/static/");
                  // Serve the external frontend files
        registry.addResourceHandler("/frontend/**")
                .addResourceLocations("file:frontend/src/");
        
        // Serve the external frontend pages specifically  
        registry.addResourceHandler("/frontend/pages/**")
                .addResourceLocations("file:frontend/src/pages/");
                
        registry.addResourceHandler("/css/**")
                .addResourceLocations("classpath:/static/css/", "file:frontend/src/css/");
                
        registry.addResourceHandler("/js/**")
                .addResourceLocations("classpath:/static/js/", "file:frontend/src/js/");
                
        registry.addResourceHandler("/pages/**")
                .addResourceLocations("classpath:/static/pages/", "file:frontend/src/pages/");
                
        // Handle login.html specifically
        registry.addResourceHandler("/login.html")
                .addResourceLocations("classpath:/static/pages/");
        
        // Handle dashboard.html specifically
        registry.addResourceHandler("/dashboard.html")
                .addResourceLocations("classpath:/static/pages/");
                
        // Handle suplidor pages specifically
        registry.addResourceHandler("/suplidor/**")
                .addResourceLocations("file:frontend/src/pages/suplidor/", "file:frontend/suplidor/");
    }    @Override
    public void addViewControllers(@NonNull ViewControllerRegistry registry) {
        // Default route to login page
        registry.addViewController("/").setViewName("forward:/login.html");
        
        // Suplidor routes - serve from static resources
        registry.addViewController("/suplidor").setViewName("forward:/pages/suplidor/index.html");
        registry.addViewController("/suplidor/").setViewName("forward:/pages/suplidor/index.html");
        registry.addViewController("/suplidor/index").setViewName("forward:/pages/suplidor/index.html");
        registry.addViewController("/suplidor/create").setViewName("forward:/pages/suplidor/create.html");
        registry.addViewController("/suplidor/edit").setViewName("forward:/pages/suplidor/edit.html");
    }
}
