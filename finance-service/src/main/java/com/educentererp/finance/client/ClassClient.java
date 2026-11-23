package com.educentererp.finance.client;

import com.educentererp.common.RemoteServiceException;
import com.educentererp.common.dto.ClassResponse;
import feign.FeignException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.NoSuchElementException;

@Component
@RequiredArgsConstructor
public class ClassClient {

    private final ClassFeignClient feign;

    public ClassResponse get(Long id) {
        try {
            return feign.get(id);
        } catch (FeignException.NotFound ex) {
            throw new NoSuchElementException("Classe introuvable: " + id);
        } catch (FeignException ex) {
            throw new RemoteServiceException("Formation service indisponible", ex);
        }
    }
}
