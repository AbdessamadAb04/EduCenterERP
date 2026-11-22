package com.educentererp.etablissement;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication(scanBasePackages = "com.educentererp")
@EntityScan(basePackages = "com.educentererp.module")
@EnableJpaRepositories(basePackages = "com.educentererp.module")
public class EtablissementServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(EtablissementServiceApplication.class, args);
    }
}
