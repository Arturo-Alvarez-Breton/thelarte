package com.thelarte.shared.controller;

import com.thelarte.shared.dto.CountryDTO;
import com.thelarte.shared.service.GeoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Endpoints proxy para Países y Ciudades, estandarizando datos y evitando exponer llamadas a APIs externas desde el frontend.
 * Ruta base: /api/geo
 */
@RestController
@RequestMapping("/api/geo")
public class GeoController {

    private final GeoService geoService;

    public GeoController(GeoService geoService) {
        this.geoService = geoService;
    }

    /**
     * GET /api/geo/countries
     * Lista de países (nombre e ISO2)
     */
    @GetMapping("/countries")
    public ResponseEntity<List<CountryDTO>> getCountries() {
        return ResponseEntity.ok(geoService.getCountries());
    }

    /**
     * GET /api/geo/countries/{iso2}/cities
     * Lista de ciudades de un país por código ISO2
     */
    @GetMapping("/countries/{iso2}/cities")
    public ResponseEntity<List<String>> getCitiesByCountry(@PathVariable String iso2) {
        return ResponseEntity.ok(geoService.getCitiesByCountryIso2(iso2));
    }
}