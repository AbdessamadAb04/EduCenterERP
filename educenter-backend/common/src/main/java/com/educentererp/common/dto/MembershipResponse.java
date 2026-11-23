package com.educentererp.common.dto;

public record MembershipResponse(
        String role,
        EtablissementResponse etablissement
) {
}
