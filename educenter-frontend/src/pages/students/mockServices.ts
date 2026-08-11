import { getItem, setItem } from '../../utils/storage';

interface MockClass {
  id: string | number;
  name: string;
  [key: string]: unknown;
}

interface MockStudent {
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
  updated_at: string;
  etablissement_id: string;
}

type StudentWithClass = MockStudent & { class_name: string };

interface StudentCreateParams {
  full_name: string;
  phone: string;
  classe_id: string;
  enrollment_date: string;
  tuition_fee?: number;
  tuition_fee_status?: string;
  registration_fee?: number;
  registration_fee_paid?: string;
  notes?: string;
  email?: string;
}

type StudentUpdateParams = Partial<Omit<MockStudent, 'id' | 'created_at' | 'updated_at' | 'etablissement_id'>>;

interface PaymentCreateParams {
  student_id: string;
  amount: number;
  due_date: string;
  method: string;
  payment_category?: string;
  payment_date?: string;
  status?: string;
  period_start_date?: string;
  period_end_date?: string;
  notes?: string;
}

const studentsKey = (etablissementId: string) => `students_${etablissementId}`;
const paymentsKey = (etablissementId: string) => `payments_${etablissementId}`;
const classesKey = (etablissementId: string) => `classes_${etablissementId}`;

function getCurrentEtablissementId(): string {
  const match = window.location.pathname.match(/etablissement\/([^/]+)/);
  return match?.[1] || 'default';
}

function readStore<T>(key: string): T[] {
  const data = getItem<T[]>(key, []);
  return Array.isArray(data) ? data : [];
}

function writeStore<T>(key: string, value: T[]): void {
  setItem(key, value);
}

function getClasses(etablissementId: string): MockClass[] {
  return readStore<MockClass>(classesKey(etablissementId));
}

function generateUuid(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.floor(Math.random() * 16);
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function mapStudentRow(row: MockStudent, classes: MockClass[]): StudentWithClass {
  const cls = classes.find(c => String(c.id) === String(row.classe_id));
  return { ...row, class_name: cls?.name || '' };
}

export const studentsService = {
  async list(etablissementId: string): Promise<StudentWithClass[]> {
    const classes = getClasses(etablissementId);
    return readStore<MockStudent>(studentsKey(etablissementId))
      .slice()
      .sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)))
      .map(row => mapStudentRow(row, classes));
  },

  async getById(id: string): Promise<StudentWithClass | null> {
    const eid = getCurrentEtablissementId();
    const row = readStore<MockStudent>(studentsKey(eid)).find(s => String(s.id) === String(id));
    return row ? mapStudentRow(row, getClasses(eid)) : null;
  },

  async create(params: StudentCreateParams): Promise<StudentWithClass> {
    const eid = getCurrentEtablissementId();
    const list = readStore<MockStudent>(studentsKey(eid));
    const now = new Date().toISOString();
    const row: MockStudent = {
      id: generateUuid(),
      full_name: params.full_name,
      phone: params.phone,
      classe_id: params.classe_id,
      enrollment_date: params.enrollment_date,
      status: 'ACTIVE',
      tuition_fee: params.tuition_fee || 0,
      tuition_fee_status: params.tuition_fee_status || 'PENDING',
      registration_fee: params.registration_fee || 0,
      registration_fee_paid: params.registration_fee_paid || 'PENDING',
      notes: params.notes || null,
      email: params.email || null,
      created_at: now,
      updated_at: now,
      etablissement_id: eid,
    };
    list.push(row);
    writeStore(studentsKey(eid), list);
    return mapStudentRow(row, getClasses(eid));
  },

  async update(id: string, params: StudentUpdateParams): Promise<StudentWithClass | null> {
    const eid = getCurrentEtablissementId();
    const list = readStore<MockStudent>(studentsKey(eid));
    const idx = list.findIndex(s => String(s.id) === String(id));
    if (idx === -1) return null;
    const row = { ...list[idx], ...params, updated_at: new Date().toISOString() };
    list[idx] = row;
    writeStore(studentsKey(eid), list);
    return mapStudentRow(row, getClasses(eid));
  },

  async remove(id: string): Promise<void> {
    const eid = getCurrentEtablissementId();
    writeStore(
      studentsKey(eid),
      readStore<MockStudent>(studentsKey(eid)).filter(s => String(s.id) !== String(id)),
    );
  },

  async softDelete(id: string): Promise<StudentWithClass | null> {
    return studentsService.update(id, { status: 'DROPPED' });
  },
};

export const paymentsService = {
  async create(params: PaymentCreateParams) {
    const eid = getCurrentEtablissementId();
    const list = readStore<Record<string, unknown>>(paymentsKey(eid));
    const now = new Date().toISOString();
    const row: Record<string, unknown> = {
      id: generateUuid(),
      studentId: params.student_id,
      student: '',
      phone: '',
      class: '',
      amount: params.amount,
      dueDate: params.due_date,
      paymentDate: params.payment_date || null,
      method: params.method,
      status: params.status || 'PENDING',
      notes: params.notes || null,
      daysLate: 0,
      paymentCategory: params.payment_category || 'TUITION',
      periodStartDate: params.period_start_date || null,
      periodEndDate: params.period_end_date || null,
      createdAt: now,
    };
    list.push(row);
    writeStore(paymentsKey(eid), list);
    return row;
  },
};
