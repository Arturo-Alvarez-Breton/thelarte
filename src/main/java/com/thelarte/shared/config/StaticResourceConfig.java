package com.thelarte.shared.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class StaticResourceConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Configurar el manejo de archivos estáticos para las imágenes de productos
        registry.addResourceHandler("/uploads/imagenes/**")
                .addResourceLocations("file:uploads/imagenes/")
                .setCachePeriod(3600); // Cache por 1 hora
    }
}
