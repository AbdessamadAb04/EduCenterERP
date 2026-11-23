package com.educentererp.finance.client;

import com.educentererp.common.dto.EtablissementResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "ETABLISSEMENT-SERVICE", contextId = "financeEtablissementClient")
interface EtablissementFeignClient {

    @GetMapping("/api/etablissements/{id}")
    EtablissementResponse get(@PathVariable("id") Long id);
}
