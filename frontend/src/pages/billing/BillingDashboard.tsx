import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import {
  DollarSign,
  Clock,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Users,
  FileText,
  CreditCard
} from 'lucide-react';

interface BillingStats {
  todayBilling: number;
  pendingCount: number;
  paidAmount: number;
  overdueCount: number;
  totalRevenue: number;
  pendingAmount: number;
  overdueAmount: number;
  monthlyGrowth: number;
  patientCount: number;
  invoiceCount: number;
}

interface RecentTransaction {
  id: number;
  invoiceNumber: string;
  patientName: string;
  amount: number;
  status: string;
  createdAt: string;
  paymentMethod: string;
}

const BillingDashboard = () => {
  const [billingStats, setBillingStats] = useState<BillingStats>({
    todayBilling: 0,
    pendingCount: 0,
    paidAmount: 0,
    overdueCount: 0,
    totalRevenue: 0,
    pendingAmount: 0,
    overdueAmount: 0,
    monthlyGrowth: 0,
    patientCount: 0,
    invoiceCount: 0
  });
  const [recentTransactions, setRecentTransactions] = useState<RecentTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch combined dashboard data
      const dashboardResponse = await api.get('/billing/dashboard');
      const data = dashboardResponse.data;

      if (data) {
        setBillingStats(data.stats || {
          todayBilling: 0,
          pendingCount: 0,
          paidAmount: 0,
          overdueCount: 0,
          totalRevenue: 0,
          pendingAmount: 0,
          overdueAmount: 0,
          monthlyGrowth: 0,
          patientCount: 0,
          invoiceCount: 0
        });
        setRecentTransactions(data.recentTransactions || []);
      }

    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      toast.error('Failed to load dashboard data');
      // No fallback dummy data anymore to enforce API correctness
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'PAID': return 'bg-green-100 text-green-800 border-green-200';
      case 'PARTIAL': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'OVERDUE': return 'bg-red-100 text-red-800 border-red-200';
      case 'CANCELLED': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Billing Dashboard</h1>
        <p className="text-gray-600 mt-1">Overview of billing operations and financial metrics</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Today's Billing</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                ${billingStats.todayBilling.toLocaleString()}
              </p>
              <div className="flex items-center mt-2 text-xs text-green-600">
                <TrendingUp className="w-3 h-3 mr-1" />
                <span>{billingStats.monthlyGrowth}% from yesterday</span>
              </div>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Payments</p>
              <p className="text-2xl font-bold text-orange-600 mt-1">
                {billingStats.pendingCount}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                ${billingStats.pendingAmount.toLocaleString()} pending
              </p>
            </div>
            <div className="bg-orange-100 p-3 rounded-lg">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                ${billingStats.totalRevenue.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 mt-1">This month</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Overdue</p>
              <p className="text-2xl font-bold text-red-600 mt-1">
                {billingStats.overdueCount}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                ${billingStats.overdueAmount.toLocaleString()} overdue
              </p>
            </div>
            <div className="bg-red-100 p-3 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Patients</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">
                {billingStats.patientCount}
              </p>
              <p className="text-xs text-gray-500 mt-1">Active patients</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Invoices</p>
              <p className="text-2xl font-bold text-indigo-600 mt-1">
                {billingStats.invoiceCount}
              </p>
              <p className="text-xs text-gray-500 mt-1">Generated this month</p>
            </div>
            <div className="bg-indigo-100 p-3 rounded-lg">
              <FileText className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Paid Amount</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                ${billingStats.paidAmount.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 mt-1">This month</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <CreditCard className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Recent Transactions</h2>
            <p className="text-sm text-gray-600 mt-1">Latest billing activities</p>
          </div>
          <button className="text-purple-600 hover:text-purple-800 text-sm font-medium">
            View All Transactions
          </button>
        </div>

        {recentTransactions.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No recent transactions</h3>
            <p className="text-gray-600">Recent transactions will appear here</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice #</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Method</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{transaction.invoiceNumber}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{transaction.patientName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">${(transaction.amount || 0).toFixed(2)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{transaction.paymentMethod}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusColor(transaction.status)}`}>
                        {transaction.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {new Date(transaction.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default BillingDashboard;
