package com.educentererp.finance.client;

import com.educentererp.common.dto.StudentResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;

@FeignClient(name = "FORMATION-SERVICE", contextId = "financeFormationStudentClient")
interface StudentFeignClient {

    @GetMapping("/api/students/{id}")
    StudentResponse get(@PathVariable("id") Long id);

    @GetMapping("/api/students")
    List<StudentResponse> list();
}
