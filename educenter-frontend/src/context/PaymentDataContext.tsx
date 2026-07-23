import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { paymentsService } from '../api/supabaseService';

interface PaymentDataContextType {
  payments: any[];
  loading: boolean;
  error: string | null;
  refreshPayments: () => Promise<void>;
  handleCreatePayment: (params: any) => Promise<any>;
  handleUpdatePayment: (id: string, params: any) => Promise<any>;
  handleDeletePayment: (id: string) => Promise<void>;
  handleMarkAsPaid: (id: string, paymentDate: string, method: string) => Promise<any>;
  handleArchivePayment: (id: string) => Promise<any>;
}

const PaymentDataContext = createContext<PaymentDataContextType | undefined>(undefined);

export const PaymentDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [etablissementId, setEtablissementId] = useState<string | null>(null);

  useEffect(() => {
    const match = window.location.pathname.match(/etablissement\/([^\/]+)/);
    if (match) setEtablissementId(match[1]);
  }, []);

  const refreshPayments = useCallback(async () => {
    const match = window.location.pathname.match(/etablissement\/([^\/]+)/);
    const eid = match?.[1];
    if (!eid) return;
    setLoading(true);
    setError(null);
    try {
      const data = await paymentsService.list(eid);
      setPayments(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load payments');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshPayments();
  }, [refreshPayments]);

  const handleCreatePayment = async (params: any) => {
    const result = await paymentsService.create(params);
    await refreshPayments();
    return result;
  };

  const handleUpdatePayment = async (id: string, params: any) => {
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

export const usePaymentData = () => {
  const context = useContext(PaymentDataContext);
  if (context === undefined) {
    throw new Error('usePaymentData must be used within a PaymentDataProvider');
  }
  return context;
};
