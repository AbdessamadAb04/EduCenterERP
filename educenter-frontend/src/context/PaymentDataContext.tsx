import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { paymentsService } from '../api/apiService';

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

type CreatePaymentParams = {
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
};

type UpdatePaymentParams = Partial<CreatePaymentParams>;

interface PaymentDataContextType {
  payments: PaymentRecord[];
  loading: boolean;
  error: string | null;
  refreshPayments: () => Promise<void>;
  handleCreatePayment: (params: CreatePaymentParams) => Promise<unknown>;
  handleUpdatePayment: (id: string, params: UpdatePaymentParams) => Promise<unknown>;
  handleDeletePayment: (id: string) => Promise<void>;
  handleMarkAsPaid: (id: string, paymentDate: string, method: string) => Promise<unknown>;
  handleArchivePayment: (id: string) => Promise<unknown>;
}

const PaymentDataContext = createContext<PaymentDataContextType | undefined>(undefined);

export const PaymentDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();
  const etablissementId = location.pathname.match(/etablissement\/([^/]+)/)?.[1] ?? null;

  const refreshPayments = useCallback(async () => {
    if (!etablissementId) {
      setPayments([]);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await paymentsService.list(etablissementId);
      setPayments(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load payments');
    } finally {
      setLoading(false);
    }
  }, [etablissementId]);

  useEffect(() => {
    setPayments([]);
    setError(null);
    refreshPayments();
  }, [refreshPayments]);

  const handleCreatePayment = async (params: CreatePaymentParams) => {
    const result = await paymentsService.create(params);
    await refreshPayments();
    return result;
  };

  const handleUpdatePayment = async (id: string, params: UpdatePaymentParams) => {
    const result = await paymentsService.update(id, params);
    await refreshPayments();
    return result;
  };

  const handleDeletePayment = async (id: string) => {
    await paymentsService.remove(id);
    await refreshPayments();
  };

  const handleMarkAsPaid = async (id: string, paymentDate: string, method: string) => {
    const result = await paymentsService.markAsPaid(id, paymentDate, method);
    await refreshPayments();
    return result;
  };

  const handleArchivePayment = async (id: string) => {
    const result = await paymentsService.archive(id);
    await refreshPayments();
    return result;
  };

  return (
    <PaymentDataContext.Provider value={{
      payments, loading, error, refreshPayments,
      handleCreatePayment, handleUpdatePayment, handleDeletePayment,
      handleMarkAsPaid, handleArchivePayment,
    }}>
      {children}
    </PaymentDataContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const usePaymentData = () => {
  const context = useContext(PaymentDataContext);
  if (context === undefined) {
    throw new Error('usePaymentData must be used within a PaymentDataProvider');
  }
  return context;
};
