package com.educentererp.finance;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest(properties = {
        "eureka.client.enabled=false",
        "seed.enabled=false",
        "spring.datasource.url=jdbc:h2:mem:finance-test;DB_CLOSE_DELAY=-1",
        "spring.jpa.hibernate.ddl-auto=create-drop"
})
class FinanceServiceApplicationTests {

    @Test
    void contextLoads() {
    }
}
