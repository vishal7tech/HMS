import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { 
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Download,
  Filter,
  FileText,
  PieChart,
  BarChart3,
  Activity,
  Users,
  CreditCard,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

interface RevenueData {
  date: string;
  revenue: number;
  invoices: number;
  payments: number;
}

interface TopPayer {
  patientId: number;
  patientName: string;
  totalAmount: number;
  invoiceCount: number;
  lastPaymentDate: string;
}

interface ServiceRevenue {
  serviceType: string;
  revenue: number;
  count: number;
  percentage: number;
}

interface PaymentMethodStats {
  method: string;
  count: number;
  amount: number;
  percentage: number;
}

interface BillingReport {
  totalRevenue: number;
  totalInvoices: number;
  totalPayments: number;
  averageInvoiceValue: number;
  paymentSuccessRate: number;
  overdueAmount: number;
  pendingAmount: number;
  monthlyGrowth: number;
  revenueData: RevenueData[];
  topPayers: TopPayer[];
  serviceRevenue: ServiceRevenue[];
  paymentMethodStats: PaymentMethodStats[];
}

const BillingReports = () => {
  const [reportData, setReportData] = useState<BillingReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30'); // days
  const [reportType, setReportType] = useState<'revenue' | 'payments' | 'invoices'>('revenue');

  useEffect(() => {
    fetchReportData();
  }, [dateRange, reportType]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      
      const response = await api.get(`/billing/reports?days=${dateRange}&type=${reportType}`);
      setReportData(response.data);
      
    } catch (error) {
      console.error('Failed to fetch report data:', error);
      toast.error('Failed to load report data');
      // Set fallback data
      setReportData({
        totalRevenue: 125000,
        totalInvoices: 89,
        totalPayments: 76,
        averageInvoiceValue: 1404,
        paymentSuccessRate: 85.4,
        overdueAmount: 3200,
        pendingAmount: 8900,
        monthlyGrowth: 12.5,
        revenueData: [
          { date: '2024-01-01', revenue: 4500, invoices: 12, payments: 10 },
          { date: '2024-01-02', revenue: 3200, invoices: 8, payments: 7 },
          { date: '2024-01-03', revenue: 5100, invoices: 15, payments: 13 },
          { date: '2024-01-04', revenue: 2800, invoices: 7, payments: 6 },
          { date: '2024-01-05', revenue: 4200, invoices: 11, payments: 9 },
        ],
        topPayers: [
          {
            patientId: 1,
            patientName: 'John Doe',
            totalAmount: 2500,
            invoiceCount: 5,
            lastPaymentDate: '2024-01-05'
          },
          {
            patientId: 2,
            patientName: 'Jane Smith',
            totalAmount: 1800,
            invoiceCount: 4,
            lastPaymentDate: '2024-01-04'
          }
        ],
        serviceRevenue: [
          { serviceType: 'Consultation', revenue: 45000, count: 150, percentage: 36 },
          { serviceType: 'Treatment', revenue: 38000, count: 95, percentage: 30.4 },
          { serviceType: 'Diagnostic', revenue: 25000, count: 120, percentage: 20 },
          { serviceType: 'Emergency', revenue: 17000, count: 25, percentage: 13.6 }
        ],
        paymentMethodStats: [
          { method: 'CARD', count: 45, amount: 68000, percentage: 54.4 },
          { method: 'CASH', count: 20, amount: 32000, percentage: 25.6 },
          { method: 'UPI', count: 8, amount: 15000, percentage: 12 },
          { method: 'INSURANCE', count: 3, amount: 10000, percentage: 8 }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExportReport = async () => {
    try {
      const response = await api.get(`/billing/reports/export?days=${dateRange}&type=${reportType}`, { 
        responseType: 'blob' 
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `billing_report_${reportType}_${dateRange}days_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Report exported successfully');
    } catch (error) {
      console.error('Failed to export report:', error);
      toast.error('Failed to export report');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getGrowthIcon = (growth: number) => {
    return growth >= 0 ? (
      <TrendingUp className="w-4 h-4 text-green-600" />
    ) : (
      <TrendingDown className="w-4 h-4 text-red-600" />
    );
  };

  const getGrowthColor = (growth: number) => {
    return growth >= 0 ? 'text-green-600' : 'text-red-600';
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

  if (!reportData) {
    return (
      <div className="p-8">
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No report data available</h3>
          <p className="text-gray-600">Unable to load billing reports at this time</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Billing Reports</h1>
          <p className="text-gray-600 mt-1">Comprehensive analytics and insights for billing operations</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleExportReport}
            className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition duration-200"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
            <div className="flex space-x-2">
              <button
                onClick={() => setReportType('revenue')}
                className={`px-4 py-2 rounded-lg font-medium transition duration-200 ${
                  reportType === 'revenue'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Revenue
              </button>
              <button
                onClick={() => setReportType('payments')}
                className={`px-4 py-2 rounded-lg font-medium transition duration-200 ${
                  reportType === 'payments'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Payments
              </button>
              <button
                onClick={() => setReportType('invoices')}
                className={`px-4 py-2 rounded-lg font-medium transition duration-200 ${
                  reportType === 'invoices'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Invoices
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 3 months</option>
              <option value="365">Last year</option>
            </select>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatCurrency(reportData.totalRevenue)}
              </p>
              <div className="flex items-center mt-2 text-xs">
                {getGrowthIcon(reportData.monthlyGrowth)}
                <span className={`ml-1 ${getGrowthColor(reportData.monthlyGrowth)}`}>
                  {Math.abs(reportData.monthlyGrowth)}% from last month
                </span>
              </div>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Invoices</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">
                {reportData.totalInvoices}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Avg: {formatCurrency(reportData.averageInvoiceValue)}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Payment Success Rate</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {reportData.paymentSuccessRate}%
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {reportData.totalPayments} of {reportData.totalInvoices} paid
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Outstanding</p>
              <p className="text-2xl font-bold text-orange-600 mt-1">
                {formatCurrency(reportData.overdueAmount + reportData.pendingAmount)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {formatCurrency(reportData.overdueAmount)} overdue
              </p>
            </div>
            <div className="bg-orange-100 p-3 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Revenue Trend Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Revenue Trend</h2>
            <BarChart3 className="w-5 h-5 text-gray-400" />
          </div>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Revenue chart visualization</p>
              <p className="text-sm text-gray-500 mt-1">
                {reportData.revenueData.length} data points
              </p>
            </div>
          </div>
        </div>

        {/* Payment Methods Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Payment Methods</h2>
            <PieChart className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {reportData.paymentMethodStats.map((method, index) => (
              <div key={method.method} className="flex items-center justify-between">
                <div className="flex items-center flex-1">
                  <div className="w-3 h-3 rounded-full mr-3" style={{
                    backgroundColor: ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b'][index]
                  }}></div>
                  <span className="text-sm font-medium text-gray-700">{method.method}</span>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-500">{method.count} transactions</span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatCurrency(method.amount)}
                  </span>
                  <span className="text-sm text-gray-500">{method.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Service Revenue Breakdown */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Service Revenue Breakdown</h2>
          <Activity className="w-5 h-5 text-gray-400" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Count</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Percentage</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg. Revenue</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reportData.serviceRevenue.map((service) => (
                <tr key={service.serviceType} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{service.serviceType}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{service.count}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {formatCurrency(service.revenue)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className="bg-purple-600 h-2 rounded-full" 
                          style={{ width: `${service.percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-900">{service.percentage}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatCurrency(service.revenue / service.count)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Payers */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Top Payers</h2>
          <Users className="w-5 h-5 text-gray-400" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoices</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg. Invoice</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Payment</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reportData.topPayers.map((payer) => (
                <tr key={payer.patientId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="bg-gray-100 w-8 h-8 rounded-full flex items-center justify-center mr-3">
                        <Users className="w-4 h-4 text-gray-600" />
                      </div>
                      <div className="text-sm font-medium text-gray-900">{payer.patientName}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {formatCurrency(payer.totalAmount)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{payer.invoiceCount}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatCurrency(payer.totalAmount / payer.invoiceCount)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {new Date(payer.lastPaymentDate).toLocaleDateString()}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BillingReports;
