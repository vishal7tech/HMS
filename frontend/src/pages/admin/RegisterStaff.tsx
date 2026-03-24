import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

const staffSchema = z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.string().email('Invalid email address'),
    phoneNumber: z.string().min(10, 'Phone number must be at least 10 digits'),
    dateOfBirth: z.string().min(1, 'Date of birth is required'),
    gender: z.string().min(1, 'Gender is required'),
    role: z.enum(['RECEPTIONIST', 'BILLING', 'ADMIN']),
    department: z.string().min(1, 'Department is required'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Confirm password must be at least 6 characters'),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

type StaffFormData = z.infer<typeof staffSchema>;

export default function RegisterStaff() {
    // WINDSURF-ADDED: Registration for RECEPTIONIST, BILLING, ADMIN
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const typeParam = searchParams.get('type')?.toUpperCase();

    const getInitialRole = (): 'RECEPTIONIST' | 'BILLING' | 'ADMIN' => {
        if (typeParam === 'RECEPTIONIST') return 'RECEPTIONIST';
        if (typeParam === 'BILLING') return 'BILLING';
        if (typeParam === 'ADMIN') return 'ADMIN';
        return 'RECEPTIONIST';
    };

    const getInitialDept = (): string => {
        if (typeParam === 'RECEPTIONIST') return 'Reception';
        if (typeParam === 'BILLING') return 'Billing';
        if (typeParam === 'ADMIN') return 'Administration';
        return '';
    };

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<StaffFormData>({
        resolver: zodResolver(staffSchema),
        defaultValues: {
            role: getInitialRole(),
            department: getInitialDept(),
        }
    });

    const onSubmit = async (data: StaffFormData) => {
        try {
            await api.post('/auth/register/staff', data);
            toast.success(`${data.role} registered successfully!`);
            navigate('/staff');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Registration failed. Please try again.');
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                <div className="bg-green-600 px-6 py-4">
                    <h2 className="text-xl font-bold text-white">Add New Staff Member</h2>
                </div>

                <form className="p-6 space-y-8" onSubmit={handleSubmit(onSubmit)}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Personal Info */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">First Name</label>
                            <input
                                {...register('firstName')}
                                type="text"
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-green-500 focus:border-green-500 sm:text-sm"
                            />
                            {errors.firstName && <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Last Name</label>
                            <input
                                {...register('lastName')}
                                type="text"
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-green-500 focus:border-green-500 sm:text-sm"
                            />
                            {errors.lastName && <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Email (Login)</label>
                            <input
                                {...register('email')}
                                type="email"
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-green-500 focus:border-green-500 sm:text-sm"
                            />
                            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                            <input
                                {...register('phoneNumber')}
                                type="tel"
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-green-500 focus:border-green-500 sm:text-sm"
                            />
                            {errors.phoneNumber && <p className="mt-1 text-sm text-red-600">{errors.phoneNumber.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                            <input
                                {...register('dateOfBirth')}
                                type="date"
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-green-500 focus:border-green-500 sm:text-sm"
                            />
                            {errors.dateOfBirth && <p className="mt-1 text-sm text-red-600">{errors.dateOfBirth.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Gender</label>
                            <select
                                {...register('gender')}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-green-500 focus:border-green-500 sm:text-sm"
                            >
                                <option value="">Select Gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                            {errors.gender && <p className="mt-1 text-sm text-red-600">{errors.gender.message}</p>}
                        </div>

                        {/* Role & Dept */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Role</label>
                            <select
                                {...register('role')}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-green-500 focus:border-green-500 sm:text-sm"
                            >
                                <option value="RECEPTIONIST">Receptionist</option>
                                <option value="BILLING">Billing</option>
                                <option value="ADMIN">Admin</option>
                            </select>
                            {errors.role && <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Department</label>
                            <input
                                {...register('department')}
                                type="text"
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-green-500 focus:border-green-500 sm:text-sm"
                            />
                            {errors.department && <p className="mt-1 text-sm text-red-600">{errors.department.message}</p>}
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Temporary Password</label>
                            <input
                                {...register('password')}
                                type="password"
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-green-500 focus:border-green-500 sm:text-sm"
                            />
                            {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
                            <input
                                {...register('confirmPassword')}
                                type="password"
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-green-500 focus:border-green-500 sm:text-sm"
                            />
                            {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>}
                        </div>
                    </div>

                    <div className="flex justify-end space-x-4 pt-4 border-t">
                        <button
                            type="button"
                            onClick={() => navigate('/staff')}
                            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-green-400"
                        >
                            {isSubmitting ? 'Registering...' : 'Register Staff'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
