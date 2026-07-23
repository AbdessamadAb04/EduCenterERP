import { supabase } from '../lib/supabaseClient';

function todayISO() {
  return new Date().toISOString().split('T')[0];
}

function computeDaysLate(dueDate: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate + 'T00:00:00');
  return Math.max(0, Math.floor((today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24)));
}

function mapStudentRow(row: any) {
  return {
    id: row.id,
    full_name: row.full_name,
    phone: row.phone,
    classe_id: row.classe_id,
    enrollment_date: row.enrollment_date,
    status: row.status,
    tuition_fee: row.tuition_fee,
    tuition_fee_status: row.tuition_fee_status,
    registration_fee: row.registration_fee,
    registration_fee_paid: row.registration_fee_paid,
    notes: row.notes,
    email: row.email,
    created_at: row.created_at,
    etablissement_id: row.etablissement_id,
    class_name: row.classes?.name || '',
  };
}

export const studentsService = {
  async list(etablissementId: string) {
    const { data, error } = await supabase
      .from('students')
      .select('*, classes!inner(name, etablissement_id)')
      .eq('classes.etablissement_id', etablissementId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(mapStudentRow);
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('students')
      .select('*, classes(name)')
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    return data ? mapStudentRow(data) : null;
  },

  async create(params: {
    full_name: string;
    phone: string;
    classe_id: string;
    enrollment_date: string;
    tuition_fee: number;
    registration_fee: number;
    notes?: string;
    email?: string;
    classe_id: string;
  }) {
    const { data, error } = await supabase
      .from('students')
      .insert({
        full_name: params.full_name,
        phone: params.phone,
        classe_id: params.classe_id,
        enrollment_date: params.enrollment_date,
        tuition_fee: params.tuition_fee,
        registration_fee: params.registration_fee,
        notes: params.notes || null,
        email: params.email || null,
      })
      .select('*, classes(name)')
      .single();
    if (error) throw error;
    return mapStudentRow(data);
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
  }>) {
    const { data, error } = await supabase
      .from('students')
      .update({
        ...params,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('*, classes(name)')
      .single();
    if (error) throw error;
    return mapStudentRow(data);
  },

  async remove(id: string) {
    const { error } = await supabase
      .from('students')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  async softDelete(id: string) {
    return studentsService.update(id, { status: 'DROPPED' });
  },
};

export const classesService = {
  async list(etablissementId: string) {
    const { data, error } = await supabase
      .from('classes')
      .select('*')
      .eq('etablissement_id', etablissementId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('classes')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    return data;
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
  }) {
    const { data, error } = await supabase
      .from('classes')
      .insert({
        ...params,
        status: params.status || 'ACTIVE',
      })
      .select()
      .single();
    if (error) throw error;
    return data;
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
  }>) {
    const { data, error } = await supabase
      .from('classes')
      .update({ ...params, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async remove(id: string) {
    const { error } = await supabase
      .from('classes')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  async archive(id: string) {
    return classesService.update(id, { status: 'ARCHIVED' });
  },
};

export const scheduleService = {
  async listByClass(classId: string) {
    const { data, error } = await supabase
      .from('schedule_classes')
      .select('*')
      .eq('class_id', classId)
      .order('day', { ascending: true });
    if (error) throw error;
    return data || [];
  },

  async listByEtablissement(etablissementId: string) {
    const { data, error } = await supabase
      .from('schedule_classes')
      .select('*, classes!inner(etablissement_id, name, subject, teacher, color)')
      .eq('classes.etablissement_id', etablissementId)
      .order('day', { ascending: true });
    if (error) throw error;
    return data || [];
  },

  async create(params: {
    class_id: string;
    day: number;
    start_time: string;
    end_time: string;
  }) {
    const startParts = params.start_time.split(':');
    const endParts = params.end_time.split(':');
    const startMin = parseInt(startParts[0]) * 60 + parseInt(startParts[1]);
    const endMin = parseInt(endParts[0]) * 60 + parseInt(endParts[1]);
    const durationMinutes = endMin - startMin;

    const { data, error } = await supabase
      .from('schedule_classes')
      .insert({
        class_id: params.class_id,
        day: params.day,
        start_time: params.start_time,
        end_time: params.end_time,
        duration: `${Math.floor(durationMinutes / 60)} hours ${durationMinutes % 60} minutes`,
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id: string, params: Partial<{
    day: number;
    start_time: string;
    end_time: string;
  }>) {
    const updateData: any = { ...params, updated_at: new Date().toISOString() };
    if (params.start_time && params.end_time) {
      const startParts = params.start_time.split(':');
      const endParts = params.end_time.split(':');
      const startMin = parseInt(startParts[0]) * 60 + parseInt(startParts[1]);
      const endMin = parseInt(endParts[0]) * 60 + parseInt(endParts[1]);
      updateData.duration = `${Math.floor((endMin - startMin) / 60)} hours ${(endMin - startMin) % 60} minutes`;
    }
    const { data, error } = await supabase
      .from('schedule_classes')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async remove(id: string) {
    const { error } = await supabase
      .from('schedule_classes')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  async removeByClass(classId: string) {
    const { error } = await supabase
      .from('schedule_classes')
      .delete()
      .eq('class_id', classId);
    if (error) throw error;
  },
};

export const paymentsService = {
  async list(etablissementId: string) {
    const { data, error } = await supabase
      .from('payments')
      .select('*, students!inner(full_name, phone, etablissement_id)')
      .eq('students.etablissement_id', etablissementId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map((p: any) => ({
      id: p.id,
      student_id: p.student_id,
      student_name: p.students?.full_name || '',
      student_phone: p.students?.phone || '',
      amount: p.amount,
      due_date: p.due_date,
      payment_date: p.payment_date,
      method: p.method,
      status: p.status,
      notes: p.notes,
      days_late: computeDaysLate(p.due_date),
      payment_category: p.payment_category,
      period_start_date: p.period_start_date,
      period_end_date: p.period_end_date,
      created_at: p.created_at,
    }));
  },

  async create(params: {
    student_id: string;
    amount: number;
    due_date: string;
    method: string;
    payment_category?: string;
    period_start_date?: string;
    period_end_date?: string;
    notes?: string;
  }) {
    const { data, error } = await supabase
      .from('payments')
      .insert({
        student_id: params.student_id,
        amount: params.amount,
        due_date: params.due_date,
        method: params.method,
        payment_category: params.payment_category || 'TUITION',
        period_start_date: params.period_start_date || null,
        period_end_date: params.period_end_date || null,
        notes: params.notes || null,
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id: string, params: Partial<{
    amount: number;
    due_date: string;
    payment_date: string;
    method: string;
    status: string;
    notes: string;
    days_late: number;
    payment_category: string;
    period_start_date: string;
    period_end_date: string;
  }>) {
    const updateData: any = { ...params, updated_at: new Date().toISOString() };
    if (params.due_date) {
      updateData.days_late = computeDaysLate(params.due_date);
    }
    const { data, error } = await supabase
      .from('payments')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async markAsPaid(id: string, paymentDate: string, method: string) {
    return paymentsService.update(id, {
      status: 'PAID',
      payment_date: paymentDate,
      method,
      days_late: 0,
    });
  },

  async markOverdue(id: string, daysLate: number) {
    return paymentsService.update(id, { status: 'OVERDUE', days_late: daysLate });
  },

  async archive(id: string) {
    return paymentsService.update(id, { status: 'ARCHIVED' });
  },

  async remove(id: string) {
    const { error } = await supabase
      .from('payments')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },
};

export const dashboardService = {
  async getStats(etablissementId: string) {
    const [studentsRes, classesRes, paymentsRes] = await Promise.all([
      supabase.from('students').select('id, status, created_at').eq('etablissement_id', etablissementId),
      supabase.from('classes').select('id, status, name, level').eq('etablissement_id', etablissementId).order('created_at'),
      supabase.from('payments').select('id, amount, status, payment_date, due_date, method, students!inner(etablissement_id)').eq('students.etablissement_id', etablissementId),
    ]);

    const students = studentsRes.data || [];
    const classes = classesRes.data || [];
    const payments = paymentsRes.data || [];

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const activeStudents = students.filter(s => s.status === 'ACTIVE').length;
    const activeClasses = classes.filter(c => c.status === 'ACTIVE').length;

    const monthRevenue = payments
      .filter((p: any) => {
        if (p.status !== 'PAID' || !p.payment_date) return false;
        const d = new Date(p.payment_date + 'T00:00:00');
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      })
      .reduce((sum: number, p: any) => sum + (p.amount || 0), 0);

    const overduePayments = payments.filter((p: any) => p.status === 'PENDING');
    const nowDate = new Date();
    nowDate.setHours(0, 0, 0, 0);
    const overdueWithDays = overduePayments.map((p: any) => ({
      ...p,
      days_late: p.due_date ? Math.max(0, Math.floor((nowDate.getTime() - new Date(p.due_date + 'T00:00:00').getTime()) / (1000 * 60 * 60 * 24))) : 0,
    })).filter((p: any) => p.days_late > 0);

    const overdueAmount = overdueWithDays.reduce((sum: number, p: any) => sum + (p.amount || 0), 0);

    const totalPayments = payments.length;
    const totalCollected = payments
      .filter((p: any) => p.status === 'PAID')
      .reduce((sum: number, p: any) => sum + (p.amount || 0), 0);

    return {
      activeStudents,
      activeClasses,
      monthRevenue,
      overduePayments: overdueWithDays.length,
      overdueAmount,
      totalPayments,
      totalCollected,
      students,
      classes,
      payments,
    };
  },
};
