package com.educentererp.common;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI eduCenterOpenApi(@Value("${spring.application.name:EduCenterERP}") String applicationName) {
        return new OpenAPI()
                .info(new Info()
                        .title(applicationName + " API")
                        .description("EduCenterERP microservice API")
                        .version("1.0.0"));
    }
}
