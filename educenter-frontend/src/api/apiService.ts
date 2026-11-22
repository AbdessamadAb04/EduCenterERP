import { apiBody, apiFetch, apiQuery } from '../lib/apiClient';

function computeDaysLate(dueDate: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate + 'T00:00:00');
  return Math.max(0, Math.floor((today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24)));
}

export interface MappedStudent {
  id: string;
  full_name: string;
  phone: string;
  classe_id: string;
  enrollment_date: string;
  status: string;
  tuition_fee: number;
  tuition_fee_status: string;
  registration_fee: number;
  registration_fee_paid: string;
  notes: string | null;
  email: string | null;
  created_at: string;
  class_name: string;
  classes?: { name?: string } | null;
}

export interface ClassRow {
  id: string;
  name: string;
  subject: string;
  level: string;
  teacher: string;
  max_capacity: number;
  status: string;
  tarif_amount: number;
  tarif_period: string;
  color: string;
  etablissement_id: string;
  created_at: string;
  updated_at: string;
}

export interface MappedClass extends ClassRow {
  maxCapacity: number;
  tarifAmount: number;
  tarifPeriod: string;
  schedule: string;
  capacity: string;
  studentCount: number;
  tarifCustomLabel: string;
}

export type SessionStatus = 'ACTIVE' | 'PAUSED' | 'ARCHIVED';

export interface ScheduleRow {
  id: string;
  class_id: string;
  day: number;
  start_time: string;
  end_time: string;
  duration: string;
  status: SessionStatus;
  created_at: string;
  updated_at: string;
  classes?: { name?: string; subject?: string; teacher?: string; color?: string } | null;
}

export interface UiScheduleEvent {
  id: string;
  classId: string;
  name: string;
  subject: string;
  teacher: string;
  day: number;
  startTime: string;
  endTime: string;
  color?: string;
  status: SessionStatus;
}

export function scheduleDbToUi(row: ScheduleRow): UiScheduleEvent {
  return {
    id: row.id,
    classId: row.class_id,
    name: row.classes?.name || '',
    subject: row.classes?.subject || '',
    teacher: row.classes?.teacher || '',
    day: row.day,
    startTime: row.start_time,
    endTime: row.end_time,
    color: row.classes?.color || undefined,
    status: row.status,
  };
}

export interface ClassUiPayload {
  name: string;
  subject: string;
  level: string;
  teacher: string;
  maxCapacity: number;
  tarifAmount: number;
  tarifPeriod: string;
  color: string;
  status?: string;
}

export function classeUiToDb(data: ClassUiPayload): {
  name: string;
  subject: string;
  level: string;
  teacher: string;
  max_capacity: number;
  tarif_amount: number;
  tarif_period: string;
  color: string;
  status: string;
} {
  return {
    name: data.name,
    subject: data.subject,
    level: data.level,
    teacher: data.teacher,
    max_capacity: data.maxCapacity,
    tarif_amount: data.tarifAmount,
    tarif_period: data.tarifPeriod,
    color: data.color,
    status: data.status || 'ACTIVE',
  };
}

export interface ScheduleUiPayload {
  classId: string;
  day: number;
  startTime: string;
  endTime: string;
}

export function scheduleUiToDb(data: ScheduleUiPayload): {
  class_id: string;
  day: number;
  start_time: string;
  end_time: string;
} {
  return {
    class_id: data.classId,
    day: data.day,
    start_time: data.startTime,
    end_time: data.endTime,
  };
}

export interface PaymentRecord {
  id: string;
  studentId: string;
  student: string;
  phone: string;
  class: string;
  amount: number;
  dueDate: string;
  paymentDate: string | null;
  method: string;
  status: string;
  notes: string | null;
  daysLate: number;
  paymentCategory: string;
  periodStartDate: string | null;
  periodEndDate: string | null;
  createdAt: string;
}

interface PaymentDbRow {
  id: string;
  student_id: string;
  class: string;
  student: string;
  phone: string;
  amount: number;
  due_date: string;
  payment_date: string | null;
  method: string;
  status: string;
  notes: string | null;
  days_late: number;
  payment_category: string;
  period_start_date: string | null;
  period_end_date: string | null;
  created_at: string;
}

function mapPayment(row: PaymentDbRow): PaymentRecord {
  return {
    id: row.id,
    studentId: row.student_id,
    student: row.student || '',
    phone: row.phone || '',
    class: row.class || '',
    amount: row.amount,
    dueDate: row.due_date,
    paymentDate: row.payment_date,
    method: row.method,
    status: row.status,
    notes: row.notes,
    daysLate: row.days_late ?? computeDaysLate(row.due_date),
    paymentCategory: row.payment_category,
    periodStartDate: row.period_start_date,
    periodEndDate: row.period_end_date,
    createdAt: row.created_at,
  };
}

export const studentsService = {
  async list(etablissementId: string): Promise<MappedStudent[]> {
    return apiFetch<MappedStudent[]>(`/api/students${apiQuery({ etablissement_id: etablissementId })}`);
  },

  async getById(id: string): Promise<MappedStudent | null> {
    try {
      return await apiFetch<MappedStudent>(`/api/students/${id}`);
    } catch (error) {
      if (error instanceof Error && error.message.includes('HTTP 404')) {
        return null;
      }
      throw error;
    }
  },

  async create(params: {
    full_name: string;
    phone: string;
    classe_id: string;
    enrollment_date: string;
    tuition_fee: number;
    tuition_fee_status?: string;
    registration_fee: number;
    registration_fee_paid?: string;
    status?: string;
    notes?: string;
    email?: string;
  }): Promise<MappedStudent> {
    return apiFetch<MappedStudent>('/api/students', {
      method: 'POST',
      body: apiBody(params),
    });
  },

  async update(id: string, params: Partial<{
    full_name: string;
    phone: string;
    classe_id: string;
    enrollment_date: string;
    status: string;
    tuition_fee: number;
    tuition_fee_status: string;
    registration_fee: number;
    registration_fee_paid: string;
    notes: string;
    email: string;
  }>): Promise<MappedStudent> {
    return apiFetch<MappedStudent>(`/api/students/${id}`, {
      method: 'PUT',
      body: apiBody(params),
    });
  },

  async remove(id: string): Promise<void> {
    await apiFetch<void>(`/api/students/${id}`, { method: 'DELETE' });
  },

  async softDelete(id: string): Promise<MappedStudent> {
    return apiFetch<MappedStudent>(`/api/students/${id}/archive`, { method: 'PUT' });
  },
};

export const classesService = {
  async list(etablissementId: string): Promise<MappedClass[]> {
    const [classes, students] = await Promise.all([
      apiFetch<ClassRow[]>(`/api/classes${apiQuery({ etablissement_id: etablissementId })}`),
      apiFetch<Array<{ classe_id: string; status: string }>>(
        `/api/students${apiQuery({ etablissement_id: etablissementId })}`),
    ]);

    const counts: Record<string, number> = {};
    students.forEach((student) => {
      if (student.status === 'DROPPED') {
        return;
      }
      counts[student.classe_id] = (counts[student.classe_id] || 0) + 1;
    });

    return classes.map((cls) => ({
      ...cls,
      maxCapacity: cls.max_capacity,
      tarifAmount: Number(cls.tarif_amount) || 0,
      tarifPeriod: cls.tarif_period,
      schedule: 'Matin',
      studentCount: counts[cls.id] || 0,
      capacity: `${counts[cls.id] || 0}/${cls.max_capacity}`,
      tarifCustomLabel: '',
    }));
  },

  async getById(id: string): Promise<ClassRow | null> {
    try {
      return await apiFetch<ClassRow>(`/api/classes/${id}`);
    } catch (error) {
      if (error instanceof Error && error.message.includes('HTTP 404')) {
        return null;
      }
      throw error;
    }
  },

  async create(params: {
    name: string;
    subject: string;
    level: string;
    teacher: string;
    max_capacity: number;
    tarif_amount: number;
    tarif_period: string;
    color: string;
    etablissement_id: string;
    status?: string;
  }): Promise<ClassRow> {
    return apiFetch<ClassRow>('/api/classes', {
      method: 'POST',
      body: apiBody(params),
    });
  },

  async update(id: string, params: Partial<{
    name: string;
    subject: string;
    level: string;
    teacher: string;
    max_capacity: number;
    tarif_amount: number;
    tarif_period: string;
    color: string;
    status: string;
  }>): Promise<ClassRow> {
    return apiFetch<ClassRow>(`/api/classes/${id}`, {
      method: 'PUT',
      body: apiBody(params),
    });
  },

  async remove(id: string): Promise<void> {
    await apiFetch<void>(`/api/classes/${id}`, { method: 'DELETE' });
  },

  async archive(id: string): Promise<ClassRow> {
    return apiFetch<ClassRow>(`/api/classes/${id}/archive`, { method: 'PUT' });
  },
};

export const scheduleService = {
  async listByClass(classId: string): Promise<ScheduleRow[]> {
    return apiFetch<ScheduleRow[]>(`/api/sessions${apiQuery({ class_id: classId })}`);
  },

  async listByEtablissement(etablissementId: string): Promise<ScheduleRow[]> {
    return apiFetch<ScheduleRow[]>(`/api/sessions${apiQuery({ etablissement_id: etablissementId })}`);
  },

  async create(params: {
    class_id: string;
    day: number;
    start_time: string;
    end_time: string;
  }): Promise<ScheduleRow> {
    return apiFetch<ScheduleRow>('/api/sessions', {
      method: 'POST',
      body: apiBody(params),
    });
  },

  async createForClass(classId: string, sessions: { day: number; start_time: string; end_time: string }[]): Promise<void> {
    if (sessions.length === 0) {
      return;
    }
    await apiFetch<void>(`/api/sessions/classes/${classId}`, {
      method: 'POST',
      body: apiBody(sessions),
    });
  },

  async update(id: string, params: Partial<{
    day: number;
    start_time: string;
    end_time: string;
    status: SessionStatus;
  }>): Promise<ScheduleRow> {
    return apiFetch<ScheduleRow>(`/api/sessions/${id}`, {
      method: 'PUT',
      body: apiBody(params),
    });
  },

  async remove(id: string): Promise<void> {
    await apiFetch<void>(`/api/sessions/${id}`, { method: 'DELETE' });
  },

  async removeByClass(classId: string): Promise<void> {
    await apiFetch<void>(`/api/sessions/classes/${classId}`, { method: 'DELETE' });
  },

  async replaceActiveForClass(
    classId: string,
    sessions: { day: number; start_time: string; end_time: string }[],
  ): Promise<void> {
    await apiFetch<void>(`/api/sessions/classes/${classId}/replace-active`, {
      method: 'PUT',
      body: apiBody(sessions),
    });
  },

  async archive(id: string): Promise<ScheduleRow> {
    return apiFetch<ScheduleRow>(`/api/sessions/${id}/archive`, { method: 'PUT' });
  },

  async restore(id: string): Promise<ScheduleRow> {
    return apiFetch<ScheduleRow>(`/api/sessions/${id}/restore`, { method: 'PUT' });
  },

  async removeArchivedByEtablissement(etablissementId: string): Promise<void> {
    await apiFetch<void>(`/api/sessions/archived${apiQuery({ etablissement_id: etablissementId })}`, {
      method: 'DELETE',
    });
  },
};

export const paymentsService = {
  async list(etablissementId: string): Promise<PaymentRecord[]> {
    const rows = await apiFetch<PaymentDbRow[]>(`/api/payments${apiQuery({ etablissement_id: etablissementId })}`);
    return rows.map(mapPayment);
  },

  async create(params: {
    student_id: string;
    amount: number;
    due_date: string;
    method: string;
    payment_category?: string;
    payment_date?: string | null;
    status?: string;
    period_start_date?: string;
    period_end_date?: string;
    notes?: string;
  }): Promise<PaymentRecord> {
    const row = await apiFetch<PaymentDbRow>('/api/payments', {
      method: 'POST',
      body: apiBody(params),
    });
    return mapPayment(row);
  },

  async update(id: string, params: Partial<{
    student_id: string;
    amount: number;
    due_date: string;
    payment_date: string | null;
    method: string;
    status: string;
    notes: string;
    days_late: number;
    payment_category: string;
    period_start_date: string;
    period_end_date: string;
  }>): Promise<PaymentRecord> {
    const row = await apiFetch<PaymentDbRow>(`/api/payments/${id}`, {
      method: 'PUT',
      body: apiBody(params),
    });
    return mapPayment(row);
  },

  async markAsPaid(id: string, paymentDate: string, method: string): Promise<PaymentRecord> {
    const row = await apiFetch<PaymentDbRow>(`/api/payments/${id}/pay`, {
      method: 'PUT',
      body: apiBody({ payment_date: paymentDate, method }),
    });
    return mapPayment(row);
  },

  async markOverdue(id: string, daysLate: number): Promise<PaymentRecord> {
    return paymentsService.update(id, { status: 'OVERDUE', days_late: daysLate });
  },

  async archive(id: string): Promise<PaymentRecord> {
    const row = await apiFetch<PaymentDbRow>(`/api/payments/${id}/archive`, { method: 'PUT' });
    return mapPayment(row);
  },

  async remove(id: string): Promise<void> {
    await apiFetch<void>(`/api/payments/${id}`, { method: 'DELETE' });
  },
};

export interface DashboardStudent {
  id: string;
  status: string;
  created_at: string;
  enrollment_date: string;
  classe_id: string;
  full_name: string;
  classes?: { name?: string } | null;
}

export interface DashboardClass {
  id: string;
  status: string;
  name: string;
  level: string;
}

export interface DashboardPayment {
  id: string;
  amount: number;
  status: string;
  payment_date: string | null;
  due_date: string;
  method: string;
  days_late?: number;
  students?: { full_name?: string; phone?: string } | null;
}

export interface DashboardStats {
  activeStudents: number;
  activeClasses: number;
  monthRevenue: number;
  overduePayments: number;
  overdueAmount: number;
  totalPayments: number;
  totalCollected: number;
  students: DashboardStudent[];
  classes: DashboardClass[];
  payments: DashboardPayment[];
}

export const dashboardService = {
  async getStats(etablissementId: string): Promise<DashboardStats> {
    const [studentRows, classRows, paymentRows] = await Promise.all([
      apiFetch<MappedStudent[]>(`/api/students${apiQuery({ etablissement_id: etablissementId })}`),
      apiFetch<ClassRow[]>(`/api/classes${apiQuery({ etablissement_id: etablissementId })}`),
      apiFetch<PaymentDbRow[]>(`/api/payments${apiQuery({ etablissement_id: etablissementId })}`),
    ]);

    const students: DashboardStudent[] = studentRows.map((student) => ({
      id: student.id,
      status: student.status,
      created_at: student.created_at,
      enrollment_date: student.enrollment_date,
      classe_id: student.classe_id,
      full_name: student.full_name,
      classes: { name: student.class_name },
    }));
    const classes: DashboardClass[] = classRows.map((cls) => ({
      id: cls.id,
      status: cls.status,
      name: cls.name,
      level: cls.level,
    }));
    const payments: DashboardPayment[] = paymentRows.map((payment) => ({
      id: payment.id,
      amount: payment.amount,
      status: payment.status,
      payment_date: payment.payment_date,
      due_date: payment.due_date,
      method: payment.method,
      days_late: payment.days_late,
      students: { full_name: payment.student, phone: payment.phone },
    }));

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const monthRevenue = payments
      .filter((payment) => {
        if (payment.status !== 'PAID' || !payment.payment_date) {
          return false;
        }
        const date = new Date(payment.payment_date + 'T00:00:00');
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
      })
      .reduce((sum, payment) => sum + (payment.amount || 0), 0);

    const paymentsWithLate = payments.map((payment) => ({
      ...payment,
      days_late: payment.due_date ? computeDaysLate(payment.due_date) : 0,
    }));
    const overdueWithDays = paymentsWithLate.filter(
      (payment) => payment.status === 'PENDING' && (payment.days_late || 0) > 0,
    );

    return {
      activeStudents: students.filter((student) => student.status === 'ACTIVE').length,
      activeClasses: classes.filter((cls) => cls.status === 'ACTIVE').length,
      monthRevenue,
      overduePayments: overdueWithDays.length,
      overdueAmount: overdueWithDays.reduce((sum, payment) => sum + (payment.amount || 0), 0),
      totalPayments: payments.length,
      totalCollected: paymentsWithLate
        .filter((payment) => payment.status === 'PAID')
        .reduce((sum, payment) => sum + (payment.amount || 0), 0),
      students,
      classes,
      payments: paymentsWithLate,
    };
  },
};

export interface EtablissementRow {
  id: string;
  center_name: string;
  center_type: string;
  city: string;
  address: string;
  phone: string;
  secondary_phone: string | null;
  email: string;
  website: string | null;
  registration_fee: number;
  logo: string | null;
  created_at: string;
  updated_at: string;
  owner_user_id: string;
}

export const etablissementsService = {
  async list(): Promise<EtablissementRow[]> {
    return apiFetch<EtablissementRow[]>('/api/etablissements');
  },

  async getById(id: string): Promise<EtablissementRow | null> {
    try {
      return await apiFetch<EtablissementRow>(`/api/etablissements/${id}`);
    } catch (error) {
      if (error instanceof Error && error.message.includes('HTTP 404')) {
        return null;
      }
      throw error;
    }
  },

  async create(params: Partial<EtablissementRow>): Promise<EtablissementRow> {
    return apiFetch<EtablissementRow>('/api/etablissements', {
      method: 'POST',
      body: apiBody(params),
    });
  },

  async update(id: string, params: Partial<EtablissementRow>): Promise<EtablissementRow> {
    return apiFetch<EtablissementRow>(`/api/etablissements/${id}`, {
      method: 'PUT',
      body: apiBody(params),
    });
  },
};

export interface UserRow {
  id: string;
  email: string;
  full_name: string;
}

export interface MembershipRow {
  role: string;
  etablissement: EtablissementRow | null;
}

export const usersService = {
  async me(email: string, fullName?: string): Promise<UserRow> {
    return apiFetch<UserRow>(`/api/users/me${apiQuery({ email, full_name: fullName })}`);
  },

  async get(id: string): Promise<UserRow> {
    return apiFetch<UserRow>(`/api/users/${id}`);
  },

  async update(id: string, params: Partial<UserRow>): Promise<UserRow> {
    return apiFetch<UserRow>(`/api/users/${id}`, {
      method: 'PUT',
      body: apiBody(params),
    });
  },

  async memberships(userId: string): Promise<MembershipRow[]> {
    return apiFetch<MembershipRow[]>(`/api/users/${userId}/etablissements`);
  },
};
