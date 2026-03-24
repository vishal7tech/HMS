import React from 'react';
import { useNotifications } from '../contexts/NotificationContext';
import toast from 'react-hot-toast';

const NotificationDisplay: React.FC = () => {
  const { notifications, clearNotifications, isConnected } = useNotifications();

  React.useEffect(() => {
    // Show toast notifications for new appointments
    notifications.forEach((notification, index) => {
      if (index === 0) { // Only show toast for the latest notification
        const message = `${notification.message}: ${notification.patientName} with Dr. ${notification.doctorName} at ${notification.slotTime}`;
        
        switch (notification.type) {
          case 'CREATED':
            toast.success(message, { duration: 5000 });
            break;
          case 'UPDATED':
            toast(message, { icon: '🔄', duration: 5000 });
            break;
          case 'CANCELLED':
            toast.error(message, { duration: 5000 });
            break;
          case 'COMPLETED':
            toast(message, { icon: '✅', duration: 5000 });
            break;
        }
      }
    });
  }, [notifications]);

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      <div className="bg-white rounded-lg shadow-lg p-4 border border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm font-medium text-gray-700">
              Live Updates ({notifications.length})
            </span>
          </div>
          <button
            onClick={clearNotifications}
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            Clear
          </button>
        </div>
        
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {notifications.map((notification, index) => (
            <div
              key={`${notification.appointmentId}-${index}`}
              className={`p-3 rounded-lg border-l-4 ${
                notification.type === 'CREATED' ? 'border-green-500 bg-green-50' :
                notification.type === 'UPDATED' ? 'border-yellow-500 bg-yellow-50' :
                notification.type === 'CANCELLED' ? 'border-red-500 bg-red-50' :
                'border-gray-500 bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-xs font-medium ${
                  notification.type === 'CREATED' ? 'text-green-700' :
                  notification.type === 'UPDATED' ? 'text-yellow-700' :
                  notification.type === 'CANCELLED' ? 'text-red-700' :
                  'text-gray-700'
                }`}>
                  {notification.type}
                </span>
                <span className="text-xs text-gray-500">
                  {new Date().toLocaleTimeString()}
                </span>
              </div>
              
              <p className="text-sm text-gray-700 mt-1">{notification.message}</p>
              <div className="text-xs text-gray-600 mt-1">
                <div>Patient: {notification.patientName}</div>
                <div>Doctor: {notification.doctorName}</div>
                <div>Time: {notification.slotTime}</div>
                <div>Status: {notification.status}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NotificationDisplay;
