import React, { useState } from 'react';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={onClose}></div>
        </div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">{title}</h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

interface DepartmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const DepartmentModal: React.FC<DepartmentModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    headOfDepartment: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/staff-categories/departments', {
        name: formData.name,
        description: formData.description,
        headOfDepartment: formData.headOfDepartment
      });
      toast.success('Department added successfully');
      onSuccess();
      onClose();
      setFormData({ name: '', description: '', headOfDepartment: '' });
    } catch (error: any) {
      console.error('Failed to add department:', error);
      toast.error(error.response?.data?.message || 'Failed to add department');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Department">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Department Name</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Head of Department</label>
          <input
            type="text"
            value={formData.headOfDepartment}
            onChange={(e) => setFormData({ ...formData, headOfDepartment: e.target.value })}
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Add Department
          </button>
        </div>
      </form>
    </Modal>
  );
};

const DesignationModal: React.FC<DepartmentModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    department: '',
    level: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/staff-categories/designations', {
        name: formData.title,
        type: formData.department,
        description: formData.description
      });
      toast.success('Designation added successfully');
      onSuccess();
      onClose();
      setFormData({ title: '', description: '', department: '', level: '' });
    } catch (error: any) {
      console.error('Failed to add designation:', error);
      toast.error(error.response?.data?.message || 'Failed to add designation');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Designation">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Designation Title</label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Department</label>
          <select
            value={formData.department}
            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Department</option>
            <option value="medical">Medical</option>
            <option value="surgical">Surgical</option>
            <option value="administrative">Administrative</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Level</label>
          <input
            type="text"
            value={formData.level}
            onChange={(e) => setFormData({ ...formData, level: e.target.value })}
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Add Designation
          </button>
        </div>
      </form>
    </Modal>
  );
};

const DesignationTypeModal: React.FC<DepartmentModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/staff-categories/designations', {
        name: formData.name,
        type: formData.category,
        description: formData.description
      });
      toast.success('Designation Type added successfully');
      onSuccess();
      onClose();
      setFormData({ name: '', category: '', description: '' });
    } catch (error: any) {
      console.error('Failed to add designation type:', error);
      toast.error(error.response?.data?.message || 'Failed to add designation type');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Designation Type">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Type Name</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Category</label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Category</option>
            <option value="clinical">Clinical</option>
            <option value="non-clinical">Non-Clinical</option>
            <option value="administrative">Administrative</option>
          </select>
        </div>
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Add Type
          </button>
        </div>
      </form>
    </Modal>
  );
};

const ShiftModal: React.FC<DepartmentModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    startTime: '',
    endTime: '',
    description: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/staff-categories/shifts', {
        name: formData.name,
        startTime: formData.startTime,
        endTime: formData.endTime,
        description: formData.description
      });
      toast.success('Shift added successfully');
      onSuccess();
      onClose();
      setFormData({ name: '', startTime: '', endTime: '', description: '' });
    } catch (error: any) {
      console.error('Failed to add shift:', error);
      toast.error(error.response?.data?.message || 'Failed to add shift');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Shift">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Shift Name</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Start Time</label>
            <input
              type="time"
              required
              value={formData.startTime}
              onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">End Time</label>
            <input
              type="time"
              required
              value={formData.endTime}
              onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Add Shift
          </button>
        </div>
      </form>
    </Modal>
  );
};

const LeaveTypeModal: React.FC<DepartmentModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    maxDays: '',
    description: '',
    isPaid: true
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/staff-categories/leave-types', {
        name: formData.name,
        maxDaysPerYear: parseInt(formData.maxDays),
        requiresApproval: true,
        description: formData.description
      });
      toast.success('Leave Type added successfully');
      onSuccess();
      onClose();
      setFormData({ name: '', maxDays: '', description: '', isPaid: true });
    } catch (error: any) {
      console.error('Failed to add leave type:', error);
      toast.error(error.response?.data?.message || 'Failed to add leave type');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Leave Type">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Leave Type Name</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Maximum Days</label>
          <input
            type="number"
            required
            value={formData.maxDays}
            onChange={(e) => setFormData({ ...formData, maxDays: e.target.value })}
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.isPaid}
              onChange={(e) => setFormData({ ...formData, isPaid: e.target.checked })}
              className="mr-2"
            />
            <span className="text-sm font-medium text-gray-700">Paid Leave</span>
          </label>
        </div>
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Add Leave Type
          </button>
        </div>
      </form>
    </Modal>
  );
};

const HolidayModal: React.FC<DepartmentModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    type: 'public',
    description: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/staff-categories/holidays', {
        name: formData.name,
        date: formData.date,
        description: formData.description,
        isRecurring: formData.type === 'public'
      });
      toast.success('Holiday added successfully');
      onSuccess();
      onClose();
      setFormData({ name: '', date: '', type: 'public', description: '' });
    } catch (error: any) {
      console.error('Failed to add holiday:', error);
      toast.error(error.response?.data?.message || 'Failed to add holiday');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Holiday">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Holiday Name</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Date</label>
          <input
            type="date"
            required
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Type</label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="public">Public Holiday</option>
            <option value="hospital">Hospital Holiday</option>
            <option value="religious">Religious Holiday</option>
          </select>
        </div>
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Add Holiday
          </button>
        </div>
      </form>
    </Modal>
  );
};

export {
  DepartmentModal,
  DesignationModal,
  DesignationTypeModal,
  ShiftModal,
  LeaveTypeModal,
  HolidayModal
};
