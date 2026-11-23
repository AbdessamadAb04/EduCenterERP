package com.educentererp.finance.client;

import com.educentererp.common.dto.ClassResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "FORMATION-SERVICE", contextId = "financeFormationClassClient")
interface ClassFeignClient {

    @GetMapping("/api/classes/{id}")
    ClassResponse get(@PathVariable("id") Long id);
}
