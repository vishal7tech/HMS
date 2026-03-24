// src/pages/Login.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { jwtDecode } from 'jwt-decode';
import { Link } from 'react-router-dom';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await api.post('/auth/login', { username, password });
            login(res.data.token);

            const decoded: any = jwtDecode(res.data.token);
            const role = decoded.role || (decoded.roles && decoded.roles[0]) || '';

            if (role === 'ROLE_PATIENT' || role === 'PATIENT') {
                navigate('/patient');
            } else if (role === 'ROLE_DOCTOR' || role === 'DOCTOR') {
                navigate('/doctor');
            } else if (role === 'ROLE_RECEPTIONIST' || role === 'RECEPTIONIST') {
                navigate('/receptionist');
            } else if (role === 'ROLE_ADMIN' || role === 'ADMIN') {
                navigate('/admin-dashboard');
            } else {
                navigate('/dashboard');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Login failed');
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
                <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Hospital Management System</h2>

                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
                        Email Address
                    </label>
                    <input
                        id="username"
                        type="email"
                        placeholder="admin@hms.com"
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>

                <div className="mb-6">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                        Password
                    </label>
                    <input
                        id="password"
                        type="password"
                        placeholder="********"
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>

                <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-200"
                >
                    Login
                </button>

                <div className="mt-4 text-center">
                    <p className="text-gray-600 text-sm">
                        New patient? <Link to="/register/patient" className="text-blue-600 hover:underline font-semibold">Sign Up Here</Link>
                    </p>
                </div>

                {error && <p className="text-red-500 text-sm mt-4 text-center">{error}</p>}
            </form>
        </div>
    );
}
