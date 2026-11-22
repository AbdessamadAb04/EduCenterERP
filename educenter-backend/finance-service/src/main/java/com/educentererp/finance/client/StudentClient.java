package com.educentererp.finance.client;

import com.educentererp.common.dto.StudentResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException.NotFound;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.NoSuchElementException;

@Component
public class StudentClient {

    private final RestClient restClient;

    public StudentClient(RestClient.Builder builder,
                         @Value("${services.formation.url:http://localhost:8082}") String baseUrl) {
        this.restClient = builder.baseUrl(baseUrl).build();
    }

    public StudentResponse get(Long id) {
        try {
            return restClient.get()
                    .uri("/api/students/{id}", id)
                    .retrieve()
                    .body(StudentResponse.class);
        } catch (NotFound ex) {
            throw new NoSuchElementException("Étudiant introuvable: " + id);
        }
    }

    public List<StudentResponse> list() {
        List<StudentResponse> students = restClient.get()
                .uri("/api/students")
                .retrieve()
                .body(new ParameterizedTypeReference<>() {
                });
        return students == null ? List.of() : students;
    }
}
