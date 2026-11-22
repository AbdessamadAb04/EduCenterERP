package com.educentererp.etablissement;

import com.educentererp.module.etablissement.Etablissement;
import com.educentererp.module.etablissement.EtablissementRepository;
import com.educentererp.module.user.AppUser;
import com.educentererp.module.user.UserEtablissement;
import com.educentererp.module.user.UserEtablissementRepository;
import com.educentererp.module.user.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(name = "seed.enabled", havingValue = "true", matchIfMissing = true)
public class EtablissementDataSeeder implements CommandLineRunner {

    private final EtablissementRepository etablissementRepository;
    private final UserRepository userRepository;
    private final UserEtablissementRepository membershipRepository;

    public EtablissementDataSeeder(EtablissementRepository etablissementRepository,
                                   UserRepository userRepository,
                                   UserEtablissementRepository membershipRepository) {
        this.etablissementRepository = etablissementRepository;
        this.userRepository = userRepository;
        this.membershipRepository = membershipRepository;
    }

    @Override
    public void run(String... args) {
        if (etablissementRepository.count() > 0) {
            return;
        }

        AppUser owner = userRepository.findByEmailIgnoreCase("demo@educenter.local").orElseGet(() -> {
            AppUser created = new AppUser();
            created.setEmail("demo@educenter.local");
            created.setFullName("Demo Owner");
            return userRepository.save(created);
        });

        Etablissement etablissement = new Etablissement();
        etablissement.setCenterName("Casablanca Language & Training Center");
        etablissement.setCenterType("langues");
        etablissement.setCity("Casablanca");
        etablissement.setAddress("12 Rue des Écoles, Casablanca");
        etablissement.setPhone("0660000000");
        etablissement.setEmail("contact@educenter.local");
        etablissement.setRegistrationFee(200.0);
        etablissement.setOwnerUserId(owner.getId());
        etablissement = etablissementRepository.save(etablissement);

        UserEtablissement membership = new UserEtablissement();
        membership.setUserId(owner.getId());
        membership.setEtablissementId(etablissement.getId());
        membership.setRole("OWNER");
        membershipRepository.save(membership);
    }
}
