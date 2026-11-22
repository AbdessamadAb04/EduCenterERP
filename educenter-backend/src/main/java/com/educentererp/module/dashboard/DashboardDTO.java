package com.educentererp.module.dashboard;

import com.educentererp.module.finance.PaymentResponse;
import com.educentererp.module.student.StudentResponse;
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
