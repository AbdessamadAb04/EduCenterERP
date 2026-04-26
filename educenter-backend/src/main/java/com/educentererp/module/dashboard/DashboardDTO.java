package com.educentererp.module.dashboard;

import com.educentererp.module.finance.Payment;
import com.educentererp.module.student.Student;
import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class DashboardDTO {
    // Metric Cards
    private Long totalActiveStudents;
    private Double totalRevenueThisMonth;
    private Long pendingPaymentsCount;
    private Long overduePaymentsCount;

    // Lists
    private List<Student> recentEnrollments;
    private List<Payment> recentOverduePayments;
}
