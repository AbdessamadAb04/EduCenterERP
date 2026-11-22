package com.educentererp.common.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

import java.util.LinkedHashMap;
import java.util.Map;

public record EtablissementRequest(
        @NotBlank String center_name,
        String center_type,
        String city,
        String address,
        String phone,
        String secondary_phone,
        @Email String email,
        String website,
        Double registration_fee,
        String logo,
        String owner_user_id
) {
    public Map<String, Object> toMap() {
        Map<String, Object> values = new LinkedHashMap<>();
        RequestMaps.put(values, "center_name", center_name);
        RequestMaps.put(values, "center_type", center_type);
        RequestMaps.put(values, "city", city);
        RequestMaps.put(values, "address", address);
        RequestMaps.put(values, "phone", phone);
        RequestMaps.put(values, "secondary_phone", secondary_phone);
        RequestMaps.put(values, "email", email);
        RequestMaps.put(values, "website", website);
        RequestMaps.put(values, "registration_fee", registration_fee);
        RequestMaps.put(values, "logo", logo);
        RequestMaps.put(values, "owner_user_id", owner_user_id);
        return values;
    }
}
