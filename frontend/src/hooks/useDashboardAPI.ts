import { useState, useEffect } from 'react';
import api from '../services/api';

export interface DashboardStats {
  todayAppointments: number;
  monthlyRevenue: number;
  outstandingPayments: number;
  totalStaff: number;
  totalPatients: number;
  totalDoctors: number;
  upcomingAppointments: number;
}

export interface AppointmentData {
  name: string;
  appointments: number;
  completed: number;
  cancelled: number;
}

export interface RevenueData {
  month: string;
  revenue: number;
}

export const useDashboardStats = (dateFilter: 'today' | '7d' | '30d' = 'today') => {
  const [data, setData] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/dashboard/stats?filter=${dateFilter}`);
      setData(response.data);
      setError(null);
    } catch (err: any) {
      console.warn('Dashboard stats API failed, using fallback data:', err);
      setError(err.response?.data?.message || 'API unavailable');
      // Set fallback data instead of showing error toast
      setData({
        todayAppointments: 2,
        monthlyRevenue: 500,
        outstandingPayments: 300,
        totalStaff: 7,
        totalPatients: 45,
        totalDoctors: 5,
        upcomingAppointments: 8
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [dateFilter]);

  return { data, loading, error, refetch: fetchStats };
};

export const useAppointmentStats = (dateFilter: 'today' | '7d' | '30d' = 'today') => {
  const [data, setData] = useState<AppointmentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/appointments/stats?filter=${dateFilter}`);
      setData(response.data);
      setError(null);
    } catch (err: any) {
      console.warn('Appointment stats API failed, using fallback data:', err);
      setError(err.response?.data?.message || 'API unavailable');
      // Set fallback data instead of showing error toast
      setData([
        { name: 'February', appointments: 12, completed: 10, cancelled: 2 },
        { name: 'March', appointments: 19, completed: 15, cancelled: 4 }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [dateFilter]);

  return { data, loading, error, refetch: fetchStats };
};

export const useRevenueData = (dateFilter: 'today' | '7d' | '30d' = 'today') => {
  const [data, setData] = useState<RevenueData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRevenue = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/revenue?filter=${dateFilter}`);
      setData(response.data);
      setError(null);
    } catch (err: any) {
      console.warn('Revenue data API failed, using fallback data:', err);
      setError(err.response?.data?.message || 'API unavailable');
      // Set fallback data instead of showing error toast
      setData([
        { month: 'February', revenue: 2400 },
        { month: 'March', revenue: 1398 }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRevenue();
  }, [dateFilter]);

  return { data, loading, error, refetch: fetchRevenue };
};
