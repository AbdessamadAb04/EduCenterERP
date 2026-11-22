package com.educentererp.module.user;

import com.educentererp.module.etablissement.EtablissementResponse;

public record MembershipResponse(
        String role,
        EtablissementResponse etablissement
) {
}
