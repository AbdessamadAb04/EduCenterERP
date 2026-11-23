package com.educentererp.finance.client;

import com.educentererp.common.RemoteServiceException;
import com.educentererp.common.dto.EtablissementResponse;
import feign.FeignException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.NoSuchElementException;

@Component
@RequiredArgsConstructor
public class EtablissementClient {

    private final EtablissementFeignClient feign;

    public EtablissementResponse get(Long id) {
        try {
            return feign.get(id);
        } catch (FeignException.NotFound ex) {
            throw new NoSuchElementException("Établissement introuvable: " + id);
        } catch (FeignException ex) {
            throw new RemoteServiceException("Établissement service indisponible", ex);
        }
    }
}
