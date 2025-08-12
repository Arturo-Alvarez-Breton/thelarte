package com.thelarte.shared.service;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.thelarte.shared.dto.CountryDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.text.Normalizer;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

/**
 * Servicio para obtener países y ciudades desde APIs públicas.
 * - Países (códigos ISO): https://countriesnow.space/api/v0.1/countries/iso
 * - Países con sus ciudades: https://countriesnow.space/api/v0.1/countries
 *
 * Usa caché en memoria y matching flexible para evitar problemas de nombres.
 */
@Service
public class GeoService {

    private static final String COUNTRIES_ISO_URL = "https://countriesnow.space/api/v0.1/countries/iso";
    private static final String COUNTRIES_WITH_CITIES_URL = "https://countriesnow.space/api/v0.1/countries";

    private final RestTemplate restTemplate = new RestTemplate();

    // Cache en memoria
    private volatile List<CountryDTO> countriesCache = null; // name + iso2
    // Mapa normalizado de nombre de país -> ciudades
    private volatile Map<String, List<String>> citiesByCountryNormalized = null;

    // Alias opcionales para compatibilidad entre nombres (si fuera necesario)
    private static final Map<String, String> COUNTRY_ALIASES = Map.ofEntries(
            Map.entry("unitedstates", "unitedstatesofamerica"),
            Map.entry("russia", "russianfederation"),
            Map.entry("southkorea", "koreasouth"),
            Map.entry("northkorea", "koreanorth"),
            Map.entry("drcongo", "congodemocraticrepublic"),
            Map.entry("congo", "congorepublic"),
            Map.entry("czechrepublic", "czechia"),
            Map.entry("uae", "unitedarabemirates"),
            Map.entry("uk", "unitedkingdom")
    );

    public List<CountryDTO> getCountries() {
        if (countriesCache != null && !countriesCache.isEmpty()) {
            return countriesCache;
        }

        ResponseEntity<CountriesIsoResponse> resp = restTemplate.getForEntity(COUNTRIES_ISO_URL, CountriesIsoResponse.class);
        if (!resp.getStatusCode().is2xxSuccessful() || resp.getBody() == null || resp.getBody().data == null) {
            return Collections.emptyList();
        }

        List<CountryDTO> result = resp.getBody().data.stream()
                .filter(c -> c.name != null && c.iso2 != null)
                .map(c -> new CountryDTO(c.name.trim(), c.iso2.trim().toUpperCase(Locale.ROOT)))
                .sorted(Comparator.comparing(CountryDTO::getName))
                .collect(Collectors.toList());

        countriesCache = result;
        return result;
    }

    public List<String> getCitiesByCountryIso2(String iso2) {
        if (iso2 == null || iso2.isBlank()) return Collections.emptyList();
        ensureCitiesMapLoaded();

        // Buscar nombre del país por ISO2
        List<CountryDTO> countries = getCountries();
        Optional<CountryDTO> match = countries.stream()
                .filter(c -> c.getIso2().equalsIgnoreCase(iso2))
                .findFirst();

        if (match.isEmpty()) {
            return Collections.emptyList();
        }

        String countryName = match.get().getName();
        String norm = normalize(countryName);

        // 1) Intento exacto
        List<String> cities = citiesByCountryNormalized.get(norm);
        if (cities != null && !cities.isEmpty()) {
            return cities;
        }

        // 2) Alias directos
        String alias = COUNTRY_ALIASES.get(norm);
        if (alias != null) {
            cities = citiesByCountryNormalized.get(alias);
            if (cities != null && !cities.isEmpty()) {
                return cities;
            }
        }

        // 3) Búsqueda flexible: contiene o empieza con
        String normNoSpaces = norm.replace(" ", "");
        cities = citiesByCountryNormalized.entrySet().stream()
                .filter(e -> {
                    String key = e.getKey();
                    String keyNoSpaces = key.replace(" ", "");
                    return key.contains(norm) || norm.contains(key) || keyNoSpaces.contains(normNoSpaces) || normNoSpaces.contains(keyNoSpaces);
                })
                .map(Map.Entry::getValue)
                .filter(list -> list != null && !list.isEmpty())
                .findFirst()
                .orElse(Collections.emptyList());

        return cities;
    }

    private void ensureCitiesMapLoaded() {
        if (citiesByCountryNormalized != null && !citiesByCountryNormalized.isEmpty()) {
            return;
        }

        synchronized (this) {
            if (citiesByCountryNormalized != null && !citiesByCountryNormalized.isEmpty()) {
                return;
            }

            ResponseEntity<CountriesWithCitiesResponse> resp = restTemplate.getForEntity(COUNTRIES_WITH_CITIES_URL, CountriesWithCitiesResponse.class);
            Map<String, List<String>> tmp = new ConcurrentHashMap<>();

            if (resp.getStatusCode().is2xxSuccessful() && resp.getBody() != null && resp.getBody().data != null) {
                for (CountryWithCities c : resp.getBody().data) {
                    if (c == null || c.country == null) continue;
                    String normName = normalize(c.country);
                    List<String> cities = Optional.ofNullable(c.cities)
                            .orElse(Collections.emptyList())
                            .stream()
                            .filter(Objects::nonNull)
                            .map(String::trim)
                            .filter(s -> !s.isBlank())
                            .distinct()
                            .sorted(String.CASE_INSENSITIVE_ORDER)
                            .collect(Collectors.toList());
                    tmp.put(normName, cities);
                }
            }

            citiesByCountryNormalized = tmp;
        }
    }

    private static String normalize(String s) {
        if (s == null) return "";
        String lower = s.trim().toLowerCase(Locale.ROOT);

        // Eliminar artículos comunes y paréntesis " (the)"
        lower = lower.replace("(the)", " ");
        lower = lower.replace(" and ", " ");
        lower = lower.replace("&", " and ");

        // Quitar diacríticos y todo lo que no sea alfanumérico/espacio
        String noAccents = Normalizer.normalize(lower, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "");
        String cleaned = noAccents.replaceAll("[^a-z0-9 ]", " ");
        // Normalizar espacios
        cleaned = cleaned.replaceAll("\\s+", " ").trim();

        // Alias manuales comunes
        if (COUNTRY_ALIASES.containsKey(cleaned)) {
            return COUNTRY_ALIASES.get(cleaned);
        }

        return cleaned;
    }

    // Modelos para parsear respuestas externas
    @JsonIgnoreProperties(ignoreUnknown = true)
    private static class CountriesIsoResponse {
        public boolean error;
        public String msg;
        public List<CountryIsoItem> data;
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    private static class CountryIsoItem {
        public String name;
        @JsonProperty("Iso2")
        public String iso2;
        @JsonProperty("Iso3")
        public String iso3;
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    private static class CountriesWithCitiesResponse {
        public boolean error;
        public String msg;
        public List<CountryWithCities> data;
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    private static class CountryWithCities {
        @JsonProperty("country")
        public String country;
        @JsonProperty("cities")
        public List<String> cities;
    }
}