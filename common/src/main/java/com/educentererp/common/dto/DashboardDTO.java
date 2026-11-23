package com.educentererp.common.dto;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class DashboardDTO {
    private Long totalActiveStudents;
    private Double totalRevenueThisMonth;
    private Long pendingPaymentsCount;
    private Long overduePaymentsCount;
    private List<StudentResponse> recentEnrollments;
    private List<PaymentResponse> recentOverduePayments;
}
