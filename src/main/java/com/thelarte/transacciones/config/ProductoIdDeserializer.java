package com.thelarte.transacciones.config;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;
import java.io.IOException;

public class ProductoIdDeserializer extends JsonDeserializer<Long> {
    
    @Override
    public Long deserialize(JsonParser p, DeserializationContext ctxt) throws IOException {
        String value = p.getText();
        
        if (value == null || value.trim().isEmpty()) {
            return null;
        }
        
        // Si el valor empieza con "nuevo_", devolver null para productos nuevos
        if (value.startsWith("nuevo_")) {
            return null;
        }
        
        // Intentar convertir a Long para productos existentes
        try {
            return Long.valueOf(value);
        } catch (NumberFormatException e) {
            // Si no se puede convertir, devolver null
            return null;
        }
    }
}