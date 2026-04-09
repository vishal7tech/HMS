// src/pages/receptionist/ReceptionistDashboard.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const ReceptionistDashboard: React.FC = () => {
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.sub?.split('@')[0] || 'Receptionist'}!</h1>
        <p className="mt-2 text-gray-600">Here's what's happening at reception today.</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-blue-50 rounded-lg">
              <span className="text-2xl">📅</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Today's Appointments</p>
              <p className="text-2xl font-bold text-blue-600">12</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-orange-50 rounded-lg">
              <span className="text-2xl">⏳</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Waiting Patients</p>
              <p className="text-2xl font-bold text-orange-600">8</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-green-50 rounded-lg">
              <span className="text-2xl">💰</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Today's Revenue</p>
              <p className="text-2xl font-bold text-green-600">₹12,500</p>
            </div>
          </div>
        </div>
      </div>

      {/* Shortcut Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Link
          to="/patients"
          className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow duration-200 group"
        >
          <div className="flex items-start">
            <div className="p-3 bg-blue-50 rounded-lg group-hover:scale-110 transition-transform duration-200">
              <span className="text-2xl">👥</span>
            </div>
            <div className="ml-4 flex-1">
              <h3 className="text-lg font-semibold text-blue-600 mb-2">Patients</h3>
              <p className="text-sm text-gray-600">Manage patient registrations and information</p>
            </div>
            <div className="ml-2">
              <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </Link>

        <Link
          to="/doctors"
          className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow duration-200 group"
        >
          <div className="flex items-start">
            <div className="p-3 bg-purple-50 rounded-lg group-hover:scale-110 transition-transform duration-200">
              <span className="text-2xl">👨‍⚕️</span>
            </div>
            <div className="ml-4 flex-1">
              <h3 className="text-lg font-semibold text-purple-600 mb-2">Doctors</h3>
              <p className="text-sm text-gray-600">View doctor profiles and availability</p>
            </div>
            <div className="ml-2">
              <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </Link>

        <Link
          to="/appointments"
          className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow duration-200 group"
        >
          <div className="flex items-start">
            <div className="p-3 bg-green-50 rounded-lg group-hover:scale-110 transition-transform duration-200">
              <span className="text-2xl">📋</span>
            </div>
            <div className="ml-4 flex-1">
              <h3 className="text-lg font-semibold text-green-600 mb-2">Appointments</h3>
              <p className="text-sm text-gray-600">Schedule and manage patient appointments</p>
            </div>
            <div className="ml-2">
              <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </Link>

        <Link
          to="/billing"
          className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow duration-200 group"
        >
          <div className="flex items-start">
            <div className="p-3 bg-yellow-50 rounded-lg group-hover:scale-110 transition-transform duration-200">
              <span className="text-2xl">💳</span>
            </div>
            <div className="ml-4 flex-1">
              <h3 className="text-lg font-semibold text-yellow-600 mb-2">Billing</h3>
              <p className="text-sm text-gray-600">Generate invoices and manage payments</p>
            </div>
            <div className="ml-2">
              <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </Link>
      </div>

      {/* Quick Actions Section */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/appointments"
            className="flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            <span className="mr-2">📅</span>
            Book New Appointment
          </Link>
          <Link
            to="/patients"
            className="flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
          >
            <span className="mr-2">➕</span>
            Register New Patient
          </Link>
          <Link
            to="/billing"
            className="flex items-center justify-center px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200"
          >
            <span className="mr-2">🧾</span>
            Generate Invoice
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ReceptionistDashboard;
