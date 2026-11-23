package com.educentererp.etablissement;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest(properties = {
        "spring.config.import=",
        "eureka.client.enabled=false",
        "seed.enabled=false",
        "spring.datasource.url=jdbc:h2:mem:etablissement-test;DB_CLOSE_DELAY=-1",
        "spring.jpa.hibernate.ddl-auto=create-drop"
})
class EtablissementServiceApplicationTests {

    @Test
    void contextLoads() {
    }
}
