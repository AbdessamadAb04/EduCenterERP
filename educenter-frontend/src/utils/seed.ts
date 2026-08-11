import { supabase } from '../lib/supabaseClient';
import { classesService, scheduleService } from '../api/supabaseService';

type LegacyClass = {
  id?: number | string;
  name: string;
  subject?: string;
  level?: string;
  teacher?: string;
  capacity?: string;
  maxCapacity?: number;
  tarifAmount?: number;
  tarifPeriod?: string;
  tarifCustomLabel?: string;
  status?: string;
  day?: string;
  color?: string;
};

type LegacyEvent = {
  id?: number | string;
  classId?: number | string;
  name: string;
  subject: string;
  teacher: string;
  day: number;
  startTime: string;
  endTime: string;
  color?: string;
  status?: 'ACTIVE' | 'ARCHIVED';
};

const getItem = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

const removeItem = (key: string) => {
  try {
    localStorage.removeItem(key);
  } catch {
    // ignore storage errors
  }
};

async function doSeed(etablissementId: string): Promise<{ seeded: boolean }> {
  const { data: existing, error } = await supabase
    .from('classes')
    .select('id')
    .eq('etablissement_id', etablissementId)
    .limit(1);
  if (error) throw error;
  if ((existing || []).length > 0) return { seeded: false };

  const legacyKey = `classes_${etablissementId}`;
  const legacyScheduleKey = `scheduleEvents_${etablissementId}`;
  const legacyClasses = getItem<LegacyClass[] | null>(legacyKey, null) ?? getItem<LegacyClass[] | null>('classes', null);
  if (!Array.isArray(legacyClasses) || legacyClasses.length === 0) return { seeded: false };

  const legacyEvents = getItem<LegacyEvent[] | null>(legacyScheduleKey, null) ?? getItem<LegacyEvent[] | null>('scheduleEvents', null);
  const classIdMap = new Map<number | string, string>();

  for (const legacy of legacyClasses) {
    const created = await classesService.create({
      etablissement_id: etablissementId,
      name: legacy.name || 'Classe sans nom',
      subject: legacy.subject || '',
      level: legacy.level || '',
      teacher: legacy.teacher || '',
      max_capacity:
        Number(legacy.maxCapacity) ||
        (legacy.capacity ? parseInt(legacy.capacity.split('/')[1], 10) : 15) ||
        15,
      tarif_amount: Number(legacy.tarifAmount) || 0,
      tarif_period: legacy.tarifPeriod || 'mensuel',
      color: legacy.color || '#e5e7eb',
      status: legacy.status || 'ACTIVE',
    });
    const createdId = (created as { id: string }).id;
    if (legacy.id !== undefined) classIdMap.set(legacy.id, createdId);
  }

  if (Array.isArray(legacyEvents)) {
    for (const ev of legacyEvents) {
      if (ev.status === 'ARCHIVED') continue;
      const classId = ev.classId !== undefined ? classIdMap.get(ev.classId) : undefined;
      if (classId === undefined) continue;
      await scheduleService.create({
        class_id: classId,
        day: ev.day,
        start_time: ev.startTime,
        end_time: ev.endTime,
      });
    }
  }

  removeItem(legacyKey);
  removeItem(legacyScheduleKey);
  return { seeded: true };
}

let inFlight: Promise<{ seeded: boolean }> | null = null;

export function seedLegacyClasses(etablissementId: string): Promise<{ seeded: boolean }> {
  if (!inFlight) {
    inFlight = doSeed(etablissementId).finally(() => {
      inFlight = null;
    });
  }
  return inFlight;
}
