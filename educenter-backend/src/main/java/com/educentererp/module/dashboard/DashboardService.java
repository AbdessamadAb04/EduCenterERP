package com.educentererp.module.dashboard;

import com.educentererp.module.finance.Payment;
import com.educentererp.module.finance.PaymentRepository;
import com.educentererp.module.finance.PaymentStatus;
import com.educentererp.module.student.StudentRepository;
import com.educentererp.module.student.StudentStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {
    private final StudentRepository studentRepository;
    private final PaymentRepository paymentRepository;

    public DashboardDTO getDashboardData() {
        LocalDate today = LocalDate.now();
        LocalDate firstOfMonth = today.withDayOfMonth(1);

        // Metric Cards Data
        long activeStudents = studentRepository.countByStatus(StudentStatus.ACTIVE);
        
        double monthlyRevenue = paymentRepository.findByStatus(PaymentStatus.PAID).stream()
                .filter(p -> p.getPaymentDate() != null && !p.getPaymentDate().isBefore(firstOfMonth))
                .mapToDouble(p -> p.getAmountMad())
                .sum();

        long pendingCount = paymentRepository.findByStatus(PaymentStatus.PENDING).stream()
                .filter(p -> !p.getDueDate().isBefore(today))
                .count();

        List<Payment> allOverdue = paymentRepository.findByStatus(PaymentStatus.PENDING).stream()
                .filter(p -> p.getDueDate().isBefore(today))
                .collect(Collectors.toList());

        long overdueCount = allOverdue.size();

        // Recent Data for Tables
        List<Payment> top5Overdue = allOverdue.stream()
                .sorted(Comparator.comparing(Payment::getDueDate))
                .limit(5)
                .collect(Collectors.toList());

        return DashboardDTO.builder()
                .totalActiveStudents(activeStudents)
                .totalRevenueThisMonth(monthlyRevenue)
                .pendingPaymentsCount(pendingCount)
                .overduePaymentsCount(overdueCount)
                .recentEnrollments(studentRepository.findTop5ByOrderByEnrollmentDateDesc())
                .recentOverduePayments(top5Overdue)
                .build();
    }
}