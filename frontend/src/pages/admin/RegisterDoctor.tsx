import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

const doctorSchema = z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.string().email('Invalid email address'),
    phoneNumber: z.string().min(10, 'Phone number must be at least 10 digits'),
    dateOfBirth: z.string().min(1, 'Date of birth is required'),
    gender: z.string().min(1, 'Gender is required'),
    specializations: z.array(z.string()).min(1, 'At least one specialization is required'),
    qualifications: z.string().min(1, 'Qualifications are required'),
    experienceYears: z.number().min(0, 'Experience years cannot be negative'),
    licenseNumber: z.string().optional(),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Confirm password must be at least 6 characters'),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

type DoctorFormData = z.infer<typeof doctorSchema>;

const SPECIALIZATION_OPTIONS = [
    'Cardiology', 'Neurology', 'Orthopedics', 'General Medicine',
    'Pediatrics', 'Dermatology', 'Oncology', 'Gastroenterology'
];

export default function RegisterDoctor() {
    // WINDSURF-ADDED: Registration for DOCTOR
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors, isSubmitting },
    } = useForm<DoctorFormData>({
        resolver: zodResolver(doctorSchema),
        defaultValues: {
            specializations: [],
        }
    });

    const selectedSpecs = watch('specializations');

    const onSubmit = async (data: DoctorFormData) => {
        try {
            await api.post('/auth/register/doctor', data);
            toast.success('Doctor registered successfully!');
            navigate('/doctors');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Registration failed. Please try again.');
        }
    };

    const handleSpecToggle = (spec: string) => {
        const current = selectedSpecs || [];
        if (current.includes(spec)) {
            setValue('specializations', current.filter(s => s !== spec));
        } else {
            setValue('specializations', [...current, spec]);
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                <div className="bg-blue-600 px-6 py-4">
                    <h2 className="text-xl font-bold text-white">Add New Doctor</h2>
                </div>

                <form className="p-6 space-y-8" onSubmit={handleSubmit(onSubmit)}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Personal Info */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">First Name</label>
                            <input
                                {...register('firstName')}
                                type="text"
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                            {errors.firstName && <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Last Name</label>
                            <input
                                {...register('lastName')}
                                type="text"
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                            {errors.lastName && <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Email (Login)</label>
                            <input
                                {...register('email')}
                                type="email"
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                            <input
                                {...register('phoneNumber')}
                                type="tel"
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                            {errors.phoneNumber && <p className="mt-1 text-sm text-red-600">{errors.phoneNumber.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                            <input
                                {...register('dateOfBirth')}
                                type="date"
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                            {errors.dateOfBirth && <p className="mt-1 text-sm text-red-600">{errors.dateOfBirth.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Gender</label>
                            <select
                                {...register('gender')}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            >
                                <option value="">Select Gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                            {errors.gender && <p className="mt-1 text-sm text-red-600">{errors.gender.message}</p>}
                        </div>

                        {/* Specialization & Qualifications */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Specializations</label>
                            <div className="flex flex-wrap gap-2">
                                {SPECIALIZATION_OPTIONS.map(spec => (
                                    <button
                                        key={spec}
                                        type="button"
                                        onClick={() => handleSpecToggle(spec)}
                                        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${selectedSpecs?.includes(spec)
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                    >
                                        {spec}
                                    </button>
                                ))}
                            </div>
                            {errors.specializations && <p className="mt-1 text-sm text-red-600">{errors.specializations.message}</p>}
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700">Qualifications / Degrees</label>
                            <textarea
                                {...register('qualifications')}
                                rows={3}
                                placeholder="e.g. MD, Cardiology Specialist from XYZ University"
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                            {errors.qualifications && <p className="mt-1 text-sm text-red-600">{errors.qualifications.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Experience Years</label>
                            <input
                                {...register('experienceYears', { valueAsNumber: true })}
                                type="number"
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                            {errors.experienceYears && <p className="mt-1 text-sm text-red-600">{errors.experienceYears.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Registration/License Number (Optional)</label>
                            <input
                                {...register('licenseNumber')}
                                type="text"
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Temporary Password</label>
                            <input
                                {...register('password')}
                                type="password"
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                            {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
                            <input
                                {...register('confirmPassword')}
                                type="password"
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                            {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>}
                        </div>
                    </div>

                    <div className="flex justify-end space-x-4 pt-4 border-t">
                        <button
                            type="button"
                            onClick={() => navigate('/doctors')}
                            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400"
                        >
                            {isSubmitting ? 'Registering...' : 'Register Doctor'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
