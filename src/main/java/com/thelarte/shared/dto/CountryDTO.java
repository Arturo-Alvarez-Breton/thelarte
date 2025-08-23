package com.thelarte.shared.dto;

public class CountryDTO {
    private String name;
    private String iso2;

    public CountryDTO() {}

    public CountryDTO(String name, String iso2) {
        this.name = name;
        this.iso2 = iso2;
    }

    public String getName() {
        return name;
    }

    public String getIso2() {
        return iso2;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setIso2(String iso2) {
        this.iso2 = iso2;
    }
}