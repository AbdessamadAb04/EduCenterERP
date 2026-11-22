package com.educentererp.module.dashboard;

import com.educentererp.common.dto.DashboardDTO;
import com.educentererp.finance.client.StudentClient;
import com.educentererp.module.finance.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final PaymentService paymentService;
    private final StudentClient studentClient;

    public DashboardDTO getDashboardData() {
        LocalDate today = LocalDate.now();
        LocalDate firstOfMonth = today.withDayOfMonth(1);

        List<com.educentererp.common.dto.StudentResponse> students = studentClient.list();

        long activeStudents = students.stream()
                .filter(student -> "ACTIVE".equals(student.status()))
                .count();

        double monthlyRevenue = paymentService.findPaid().stream()
                .filter(payment -> payment.getPaymentDate() != null
                        && !payment.getPaymentDate().isBefore(firstOfMonth))
                .mapToDouble(payment -> payment.getAmount() == null ? 0.0 : payment.getAmount())
                .sum();

        List<com.educentererp.module.finance.Payment> overdue = paymentService.findPending().stream()
                .filter(payment -> payment.getDueDate() != null && payment.getDueDate().isBefore(today))
                .sorted(Comparator.comparing(com.educentererp.module.finance.Payment::getDueDate))
                .toList();

        long pendingCount = paymentService.findPending().stream()
                .filter(payment -> payment.getDueDate() != null && !payment.getDueDate().isBefore(today))
                .count();

        return DashboardDTO.builder()
                .totalActiveStudents(activeStudents)
                .totalRevenueThisMonth(monthlyRevenue)
                .pendingPaymentsCount(pendingCount)
                .overduePaymentsCount((long) overdue.size())
                .recentEnrollments(students.stream()
                        .sorted(Comparator.comparing(
                                student -> student.enrollment_date() == null ? "" : student.enrollment_date(),
                                Comparator.reverseOrder()))
                        .limit(5)
                        .toList())
                .recentOverduePayments(overdue.stream()
                        .limit(5)
                        .map(PaymentService::toResponse)
                        .toList())
                .build();
    }
}
