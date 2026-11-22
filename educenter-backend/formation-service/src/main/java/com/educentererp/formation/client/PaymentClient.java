package com.educentererp.formation.client;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

@Component
public class PaymentClient {

    private final RestClient restClient;

    public PaymentClient(RestClient.Builder builder,
                         @Value("${services.finance.url:http://localhost:8083}") String baseUrl) {
        this.restClient = builder.baseUrl(baseUrl).build();
    }

    public long countByStudentId(Long studentId) {
        Long count = restClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/api/payments/count")
                        .queryParam("student_id", studentId)
                        .build())
                .retrieve()
                .body(Long.class);
        return count == null ? 0L : count;
    }
}
