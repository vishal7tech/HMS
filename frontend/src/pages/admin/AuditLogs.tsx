import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

// interface DailySummary {
//     [key: string]: number;
// }

interface AuditLog {
    id: number;
    changedAt: string;
    action: string;
    entityType: string;
    entityName: string;
    entityId: number;
    email: string;
    ipAddress: string;
}

const AuditLogs: React.FC = () => {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    // const [dailySummary, setDailySummary] = useState<DailySummary>({});
    const [loading, setLoading] = useState(true);
    // const [summaryLoading, setSummaryLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [filter, setFilter] = useState({
        entityType: '',
        userId: '',
    });

    const fetchLogs = async () => {
        setLoading(true);
        try {
            let url = `/audit?page=${page}&size=15`;
            if (filter.entityType) url += `&entityType=${filter.entityType}`;
            if (filter.userId) url = `/audit/user/${filter.userId}?page=${page}&size=15`;

            const res = await api.get(url);
            setLogs(res.data.content);
            setTotalPages(res.data.totalPages);
        } catch (err) {
            console.error('Failed to load audit logs', err);
            toast.error('Failed to load audit logs');
        } finally {
            setLoading(false);
        }
    };

    // const fetchDailySummary = async () => {
    //     setSummaryLoading(true);
    //     try {
    //         const res = await api.get('/audit/daily-summary');
    //         setDailySummary(res.data);
    //     } catch (err) {
    //         console.error('Failed to load daily summary', err);
    //         toast.error('Failed to load daily summary');
    //     } finally {
    //         setSummaryLoading(false);
    //     }
    // };

    useEffect(() => {
        fetchLogs();
        // fetchDailySummary();
    }, [page]);

    const handleFilterSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(0);
        fetchLogs();
    };

    const getActionBadge = (action: string) => {
        const badges: any = {
            INSERT: "bg-green-100 text-green-700 border-green-200",
            UPDATE: "bg-blue-100 text-blue-700 border-blue-200",
            DELETE: "bg-red-100 text-red-700 border-red-200",
            LOGIN: "bg-purple-100 text-purple-700 border-purple-200",
            LOGOUT: "bg-orange-100 text-orange-700 border-orange-200",
            PASSWORD_CHANGE: "bg-yellow-100 text-yellow-700 border-yellow-200",
            VIEW: "bg-gray-100 text-gray-700 border-gray-200"
        };
        return (
            <span className={`px-2 py-1 rounded-md text-xs font-bold border ${badges[action] || 'bg-gray-100 text-gray-700'}`}>
                {action}
            </span>
        );
    };

    return (
        <div className="space-y-6">
            {/* Daily Summary Section - COMMENTED OUT FOR NOW */}
            {/*
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 font-sans">Daily Audit Summary</h2>
                        <p className="text-gray-500">Today's action counts</p>
                    </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-4">
                    {summaryLoading ? (
                        <div className="col-span-full flex justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                    ) : (
                        Object.entries(dailySummary).map(([action, count]) => (
                            <div key={action} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                <div className="text-sm text-gray-500 uppercase tracking-wide">{action}</div>
                                <div className="text-2xl font-bold text-gray-900">{count}</div>
                            </div>
                        ))
                    )}
                </div>
            </div>
            */}

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 font-sans">System Audit Logs</h2>
                        <p className="text-gray-500">Monitor all data modifications and security events</p>
                    </div>

                    <form onSubmit={handleFilterSubmit} className="flex flex-wrap items-end gap-3">
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-600 uppercase">Entity Type</label>
                            <select
                                value={filter.entityType}
                                onChange={(e) => setFilter({ ...filter, entityType: e.target.value })}
                                className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="">All Entities</option>
                                <option value="USER">User/Security</option>
                                <option value="PATIENT">Patient</option>
                                <option value="DOCTOR">Doctor</option>
                                <option value="APPOINTMENT">Appointment</option>
                                <option value="BILLING">Billing</option>
                                <option value="INVOICE">Invoice</option>
                            </select>
                        </div>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
                        >
                            Filter
                        </button>
                    </form>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Entity</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Entity Name</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">ID</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Gmail</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Timestamp</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Login / Logout</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">IP Address</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-10 text-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                                    </td>
                                </tr>
                            ) : logs.length > 0 ? (
                                logs.map((log) => (
                                    <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                            {log.entityType}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {log.entityName || '-'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            #{log.entityId}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {log.email || '-'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 font-mono">
                                            {new Date(log.changedAt).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            {getActionBadge(log.action)}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {log.ipAddress}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} className="px-6 py-10 text-center text-gray-500">
                                        No audit logs found for the selected criteria.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                        Page <span className="font-bold">{page + 1}</span> of <span className="font-bold">{totalPages}</span>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setPage(p => Math.max(0, p - 1))}
                            disabled={page === 0 || loading}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                            disabled={page >= totalPages - 1 || loading}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuditLogs;
