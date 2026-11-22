package com.educentererp.module.etablissement;

public record EtablissementResponse(
        String id,
        String center_name,
        String center_type,
        String city,
        String address,
        String phone,
        String secondary_phone,
        String email,
        String website,
        Double registration_fee,
        String logo,
        String created_at,
        String updated_at,
        String owner_user_id
) {
}
