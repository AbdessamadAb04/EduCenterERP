package com.educentererp.module.user;

import com.educentererp.common.JsonValues;
import com.educentererp.module.etablissement.Etablissement;
import com.educentererp.module.etablissement.EtablissementRepository;
import com.educentererp.module.etablissement.EtablissementService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final UserEtablissementRepository membershipRepository;
    private final EtablissementRepository etablissementRepository;

    public UserResponse findOrCreate(String email, String fullName) {
        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("Email requis");
        }
        AppUser user = userRepository.findByEmailIgnoreCase(email).orElseGet(() -> {
            AppUser created = new AppUser();
            created.setEmail(email.trim().toLowerCase());
            created.setFullName(fullName);
            return userRepository.save(created);
        });
        return toResponse(user);
    }

    public UserResponse get(Long id) {
        return toResponse(getEntity(id));
    }

    public AppUser getEntity(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Utilisateur introuvable: " + id));
    }

    public UserResponse create(Map<String, Object> body) {
        AppUser user = new AppUser();
        String email = JsonValues.string(body, "email");
        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("Email requis");
        }
        user.setEmail(email.trim().toLowerCase());
        user.setFullName(JsonValues.string(body, "full_name"));
        return toResponse(userRepository.save(user));
    }

    public UserResponse update(Long id, Map<String, Object> body) {
        AppUser user = getEntity(id);
        if (JsonValues.has(body, "full_name")) {
            user.setFullName(JsonValues.string(body, "full_name"));
        }
        if (JsonValues.has(body, "email")) {
            String email = JsonValues.string(body, "email");
            if (email != null && !email.isBlank()) {
                user.setEmail(email.trim().toLowerCase());
            }
        }
        return toResponse(userRepository.save(user));
    }

    public List<MembershipResponse> memberships(Long userId) {
        return membershipRepository.findByUserId(userId).stream()
                .map(membership -> {
                    Etablissement etablissement = null;
                    if (membership.getEtablissementId() != null) {
                        etablissement = etablissementRepository.findById(membership.getEtablissementId()).orElse(null);
                    }
                    return new MembershipResponse(
                            membership.getRole(),
                            etablissement == null ? null : EtablissementService.toResponse(etablissement)
                    );
                })
                .toList();
    }

    public static UserResponse toResponse(AppUser user) {
        return new UserResponse(
                JsonValues.idString(user.getId()),
                user.getEmail(),
                user.getFullName()
        );
    }
}
