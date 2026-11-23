package com.educentererp.finance.client;

import com.educentererp.common.RemoteServiceException;
import com.educentererp.common.dto.StudentResponse;
import feign.FeignException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.NoSuchElementException;

@Component
@RequiredArgsConstructor
public class StudentClient {

    private final StudentFeignClient feign;

    public StudentResponse get(Long id) {
        try {
            return feign.get(id);
        } catch (FeignException.NotFound ex) {
            throw new NoSuchElementException("Étudiant introuvable: " + id);
        } catch (FeignException ex) {
            throw new RemoteServiceException("Formation service indisponible", ex);
        }
    }

    public List<StudentResponse> list() {
        try {
            return feign.list();
        } catch (FeignException ex) {
            throw new RemoteServiceException("Formation service indisponible", ex);
        }
    }
}
