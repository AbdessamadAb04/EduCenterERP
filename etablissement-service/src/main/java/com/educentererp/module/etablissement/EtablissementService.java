package com.educentererp.module.etablissement;

import com.educentererp.common.JsonValues;
import com.educentererp.common.dto.EtablissementResponse;
import com.educentererp.module.user.UserEtablissement;
import com.educentererp.module.user.UserEtablissementRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
public class EtablissementService {

    private final EtablissementRepository etablissementRepository;
    private final UserEtablissementRepository userEtablissementRepository;

    public List<EtablissementResponse> list() {
        return etablissementRepository.findAll().stream()
                .map(EtablissementService::toResponse)
                .toList();
    }

    public EtablissementResponse get(Long id) {
        return toResponse(getEntity(id));
    }

    public Etablissement getEntity(Long id) {
        return etablissementRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Établissement introuvable: " + id));
    }

    public EtablissementResponse create(Map<String, Object> body) {
        Etablissement etablissement = new Etablissement();
        apply(etablissement, body);
        Etablissement saved = etablissementRepository.save(etablissement);

        Long ownerId = JsonValues.id(body, "owner_user_id");
        if (ownerId != null && userEtablissementRepository.findByUserIdAndEtablissementId(ownerId, saved.getId()).isEmpty()) {
            UserEtablissement membership = new UserEtablissement();
            membership.setUserId(ownerId);
            membership.setEtablissementId(saved.getId());
            membership.setRole("OWNER");
            userEtablissementRepository.save(membership);
        }
        return toResponse(saved);
    }

    public EtablissementResponse update(Long id, Map<String, Object> body) {
        Etablissement etablissement = getEntity(id);
        apply(etablissement, body);
        return toResponse(etablissementRepository.save(etablissement));
    }

    private void apply(Etablissement etablissement, Map<String, Object> body) {
        if (JsonValues.has(body, "center_name")) {
            etablissement.setCenterName(JsonValues.string(body, "center_name"));
        }
        if (JsonValues.has(body, "center_type")) {
            etablissement.setCenterType(JsonValues.string(body, "center_type"));
        }
        if (JsonValues.has(body, "city")) {
            etablissement.setCity(JsonValues.string(body, "city"));
        }
        if (JsonValues.has(body, "address")) {
            etablissement.setAddress(JsonValues.string(body, "address"));
        }
        if (JsonValues.has(body, "phone")) {
            etablissement.setPhone(JsonValues.string(body, "phone"));
        }
        if (JsonValues.has(body, "secondary_phone")) {
            etablissement.setSecondaryPhone(JsonValues.string(body, "secondary_phone"));
        }
        if (JsonValues.has(body, "email")) {
            etablissement.setEmail(JsonValues.string(body, "email"));
        }
        if (JsonValues.has(body, "website")) {
            etablissement.setWebsite(JsonValues.string(body, "website"));
        }
        if (JsonValues.has(body, "registration_fee")) {
            etablissement.setRegistrationFee(JsonValues.number(body, "registration_fee"));
        }
        if (JsonValues.has(body, "logo")) {
            etablissement.setLogo(JsonValues.string(body, "logo"));
        }
        if (JsonValues.has(body, "owner_user_id")) {
            etablissement.setOwnerUserId(JsonValues.id(body, "owner_user_id"));
        }
    }

    public static EtablissementResponse toResponse(Etablissement etablissement) {
        return new EtablissementResponse(
                JsonValues.idString(etablissement.getId()),
                etablissement.getCenterName(),
                etablissement.getCenterType(),
                etablissement.getCity(),
                etablissement.getAddress(),
                etablissement.getPhone(),
                etablissement.getSecondaryPhone(),
                etablissement.getEmail(),
                etablissement.getWebsite(),
                etablissement.getRegistrationFee(),
                etablissement.getLogo(),
                etablissement.getCreatedAt() == null ? null : etablissement.getCreatedAt().toString(),
                etablissement.getUpdatedAt() == null ? null : etablissement.getUpdatedAt().toString(),
                JsonValues.idString(etablissement.getOwnerUserId())
        );
    }
}
