package com.educentererp.formation.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "FINANCE-SERVICE", contextId = "formationPaymentClient")
interface PaymentFeignClient {

    @GetMapping("/api/payments/count")
    long countByStudentId(@RequestParam("student_id") Long studentId);
}
