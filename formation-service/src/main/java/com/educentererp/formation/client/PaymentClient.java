package com.educentererp.formation.client;

import com.educentererp.common.RemoteServiceException;
import feign.FeignException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class PaymentClient {

    private final PaymentFeignClient feign;

    public long countByStudentId(Long studentId) {
        try {
            return feign.countByStudentId(studentId);
        } catch (FeignException ex) {
            throw new RemoteServiceException("Finance service indisponible", ex);
        }
    }
}
