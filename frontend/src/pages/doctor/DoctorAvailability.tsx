import React, { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import api from '../../services/api';

interface TimeSlot {
    time: string;
    available: boolean;
    slotId?: number;
}

interface BlockedDate {
    date: string;
    reason: string;
}

const DoctorAvailability: React.FC = () => {
    const [profile, setProfile] = useState<any>(null);
    const [selectedDate, setSelectedDate] = useState<string>(
        new Date().toISOString().split('T')[0]
    );
    const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
    const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    const [holidayMode, setHolidayMode] = useState(false);
    const [holidayReason, setHolidayReason] = useState('');

    // Generate time slots from 00:00 to 23:30 with 30-minute intervals (24 hours)
    const generateTimeSlots = useCallback((): TimeSlot[] => {
        const slots: TimeSlot[] = [];
        for (let hour = 0; hour <= 23; hour++) {
            slots.push({ time: `${hour.toString().padStart(2, '0')}:00`, available: false });
            slots.push({ time: `${hour.toString().padStart(2, '0')}:30`, available: false });
        }
        return slots;
    }, []);

    const fetchAvailability = async (doctorId: number, date: string) => {
        try {
            const res = await api.get(`/availability/doctor/${doctorId}?date=${date}`);
            const slots = generateTimeSlots();
            
            // Mark slots as available based on API response
            res.data.forEach((apiSlot: any) => {
                const timeString = apiSlot.startTime.slice(0, 5); // Extract HH:MM from LocalTime
                const slotIndex = slots.findIndex(s => s.time === timeString);
                if (slotIndex !== -1) {
                    slots[slotIndex] = {
                        ...slots[slotIndex],
                        available: apiSlot.isAvailable,
                        slotId: apiSlot.id
                    };
                }
            });
            
            setTimeSlots(slots);
            setHasChanges(false);
        } catch (err) {
            console.error('Failed to load availability', err);
            toast.error('Failed to load availability');
            // Set default slots on error
            setTimeSlots(generateTimeSlots());
        }
    };

    const fetchBlockedDates = async () => {
        try {
            // For now, we'll handle blocked dates locally since there's no specific endpoint
            // This can be extended when the backend provides blocked dates functionality
            setBlockedDates([]);
        } catch (err) {
            console.error('Failed to load blocked dates', err);
            setBlockedDates([]);
        }
    };

    useEffect(() => {
        const init = async () => {
            try {
                const res = await api.get('/doctors/me');
                setProfile(res.data);
                await fetchAvailability(res.data.id, selectedDate);
                await fetchBlockedDates();
            } catch (err) {
                console.error('Failed to load profile', err);
                toast.error('Failed to load profile');
            } finally {
                setLoading(false);
            }
        };
        init();
    }, [selectedDate, generateTimeSlots]);

    const toggleSlot = (time: string) => {
        if (holidayMode) return;
        
        setTimeSlots(prev => 
            prev.map(slot => 
                slot.time === time 
                    ? { ...slot, available: !slot.available }
                    : slot
            )
        );
        setHasChanges(true);
    };

    const saveAvailability = async () => {
        if (!profile) return;
        
        setSaving(true);
        try {
            // First, delete all existing slots for this date
            const existingSlots = await api.get(`/availability/doctor/${profile.id}?date=${selectedDate}`);
            for (const slot of existingSlots.data) {
                await api.delete(`/availability/${slot.id}`);
            }

            // Then create new slots for available times
            const availableSlots = timeSlots.filter(slot => slot.available);
            
            for (const slot of availableSlots) {
                const [hours, minutes] = slot.time.split(':').map(Number);
                const startTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
                const endMinutes = minutes + 30;
                const endHours = endMinutes >= 60 ? hours + 1 : hours;
                const endMinutesFinal = endMinutes >= 60 ? endMinutes - 60 : endMinutes;
                const endTime = `${endHours.toString().padStart(2, '0')}:${endMinutesFinal.toString().padStart(2, '0')}`;

                await api.post('/availability', {
                    doctorId: profile.id,
                    date: selectedDate,
                    startTime,
                    endTime,
                    recurrence: 'NONE'
                });
            }

            setHasChanges(false);
            toast.success('Availability saved successfully!');
            await fetchAvailability(profile.id, selectedDate);
        } catch (err: any) {
            console.error('Failed to save availability', err);
            toast.error(err.response?.data?.message || 'Failed to save availability');
        } finally {
            setSaving(false);
        }
    };

    const toggleHolidayMode = () => {
        if (holidayMode) {
            setHolidayMode(false);
            setHolidayReason('');
        } else {
            setHolidayMode(true);
            // Clear all slots when entering holiday mode
            setTimeSlots(prev => prev.map(slot => ({ ...slot, available: false })));
            setHasChanges(true);
        }
    };

    const blockDate = async () => {
        if (!profile || !holidayReason.trim()) {
            toast.error('Please provide a reason for blocking this date');
            return;
        }

        try {
            // Delete all existing slots for this date to effectively block it
            const existingSlots = await api.get(`/availability/doctor/${profile.id}?date=${selectedDate}`);
            for (const slot of existingSlots.data) {
                await api.delete(`/availability/${slot.id}`);
            }

            // Add to local blocked dates for UI feedback
            setBlockedDates(prev => [...prev, { date: selectedDate, reason: holidayReason }]);

            toast.success('Date blocked successfully!');
            setHolidayMode(false);
            setHolidayReason('');
            setHasChanges(false);
            setTimeSlots(generateTimeSlots()); // Reset all slots to unavailable
        } catch (err: any) {
            console.error('Failed to block date', err);
            toast.error(err.response?.data?.message || 'Failed to block date');
        }
    };

    const isDateBlocked = (date: string): boolean => {
        return blockedDates.some(blocked => blocked.date === date);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">My Availability</h1>
                        <p className="text-gray-600 mt-2">Manage your available time slots for appointments</p>
                    </div>
                    <div className="flex space-x-3">
                        {hasChanges && (
                            <button
                                onClick={saveAvailability}
                                disabled={saving}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        )}
                        <button
                            onClick={toggleHolidayMode}
                            className={`px-6 py-2 rounded-lg transition-colors ${
                                holidayMode 
                                    ? 'bg-red-600 text-white hover:bg-red-700' 
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                        >
                            {holidayMode ? 'Cancel Holiday Mode' : 'Block Date (Holiday)'}
                        </button>
                    </div>
                </div>

                {/* Date Selection */}
                <div className="mb-8">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Select Date
                    </label>
                    <div className="flex items-center space-x-4">
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                            min={new Date().toISOString().split('T')[0]}
                        />
                        {isDateBlocked(selectedDate) && (
                            <div className="flex items-center space-x-2 text-red-600">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                <span className="font-medium">This date is blocked</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Holiday Mode */}
                {holidayMode && (
                    <div className="mb-8 p-6 bg-red-50 border border-red-200 rounded-lg">
                        <h3 className="text-lg font-semibold text-red-800 mb-4">Holiday Mode</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-red-700 mb-2">
                                    Reason for blocking {selectedDate}
                                </label>
                                <textarea
                                    value={holidayReason}
                                    onChange={(e) => setHolidayReason(e.target.value)}
                                    placeholder="e.g., Public holiday, Personal leave, Conference..."
                                    className="w-full px-4 py-3 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                    rows={3}
                                />
                            </div>
                            <button
                                onClick={blockDate}
                                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            >
                                Block This Date
                            </button>
                        </div>
                    </div>
                )}

                {/* Time Slots Grid */}
                <div className="mb-8">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-semibold text-gray-800">
                            Time Slots - {selectedDate}
                        </h3>
                        <div className="flex items-center space-x-6 text-sm">
                            <div className="flex items-center space-x-2">
                                <div className="w-4 h-4 bg-green-500 rounded"></div>
                                <span className="text-gray-600">Available</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <div className="w-4 h-4 bg-gray-200 border border-gray-300 rounded"></div>
                                <span className="text-gray-600">Unavailable</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
                        {timeSlots.map((slot) => (
                            <button
                                key={slot.time}
                                onClick={() => toggleSlot(slot.time)}
                                disabled={holidayMode || isDateBlocked(selectedDate)}
                                className={`
                                    py-3 px-2 rounded-lg text-sm font-medium transition-all transform hover:scale-105
                                    ${slot.available 
                                        ? 'bg-green-500 text-white shadow-md hover:bg-green-600 hover:shadow-lg' 
                                        : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                                    }
                                    ${(holidayMode || isDateBlocked(selectedDate)) 
                                        ? 'opacity-50 cursor-not-allowed hover:scale-100' 
                                        : 'cursor-pointer'
                                    }
                                `}
                            >
                                {slot.time}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Instructions */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 mb-2">How to use:</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                        <li>• Click on time slots to toggle them between available and unavailable</li>
                        <li>• Green slots indicate you are available for appointments</li>
                        <li>• Use "Block Date" mode to mark entire days as holidays</li>
                        <li>• Click "Save Changes" to update your availability</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default DoctorAvailability;
