import { useEffect, useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

interface Document {
    id: string;
    fileName: string;
    documentType: string;
    uploadDate: string;
    fileSize: number;
}

interface Prescription {
    id: string;
    doctorName: string;
    prescriptionDate: string;
    diagnosis: string;
    medications: string[];
    notes: string;
    status: 'ACTIVE' | 'COMPLETED' | 'EXPIRED';
}

const PatientHistory = () => {
    const [profile, setProfile] = useState<any>(null);
    const [documents, setDocuments] = useState<Document[]>([]);
    const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [profileRes, docsRes, prescriptionsRes] = await Promise.all([
                    api.get('/patients/me'),
                    api.get('/patient/documents'),
                    api.get('/patient/prescriptions')
                ]);
                setProfile(profileRes.data);
                setDocuments(docsRes.data || []);
                setPrescriptions(prescriptionsRes.data || []);
            } catch (err) {
                console.error('Failed to load patient history', err);
                // Continue with empty state if API fails
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validate file type and size
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
        const maxSize = 5 * 1024 * 1024; // 5MB

        if (!allowedTypes.includes(file.type)) {
            toast.error('Only PDF, JPEG, and PNG files are allowed');
            return;
        }

        if (file.size > maxSize) {
            toast.error('File size must be less than 5MB');
            return;
        }

        await uploadFile(file);
    };

    const uploadFile = async (file: File) => {
        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('documentType', 'MEDICAL_HISTORY');

        try {
            const response = await api.post('/patient/documents', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            
            const newDoc = response.data;
            setDocuments(prev => [newDoc, ...prev]);
            toast.success('Medical history uploaded successfully');
            
            // Reset file input
            const fileInput = document.getElementById('file-upload') as HTMLInputElement;
            if (fileInput) fileInput.value = '';
        } catch (error) {
            console.error('Upload failed:', error);
            toast.error('Failed to upload medical history');
        } finally {
            setUploading(false);
        }
    };

    const downloadDocument = async (documentId: string, fileName: string) => {
        try {
            const response = await api.get(`/patient/documents/${documentId}/download`, {
                responseType: 'blob',
            });
            
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            
            toast.success('Document downloaded successfully');
        } catch (error) {
            console.error('Download failed:', error);
            toast.error('Failed to download document');
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ACTIVE': return 'bg-green-100 text-green-800';
            case 'COMPLETED': return 'bg-blue-100 text-blue-800';
            case 'EXPIRED': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) return <div className="p-4">Loading history...</div>;

    return (
        <div className="bg-white shadow rounded-lg p-6 max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Medical History & Prescriptions</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Upload Medical History Section */}
                <div className="space-y-4">
                    <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg">
                        <h3 className="font-semibold text-blue-800 mb-4">Upload Medical History</h3>
                        
                        <div className="border-2 border-dashed border-blue-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                            <svg className="mx-auto h-12 w-12 text-blue-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            
                            <label htmlFor="file-upload" className="cursor-pointer">
                                <span className="text-blue-600 font-medium hover:text-blue-700">
                                    Click to upload
                                </span>
                                <span className="text-gray-500"> or drag and drop</span>
                                <p className="text-xs text-gray-400 mt-1">PDF, JPEG, PNG up to 5MB</p>
                                <input
                                    id="file-upload"
                                    type="file"
                                    className="hidden"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    onChange={handleFileUpload}
                                    disabled={uploading}
                                />
                            </label>
                        </div>

                        {uploading && (
                            <div className="text-center py-2">
                                <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                <span className="ml-2 text-sm text-blue-600">Uploading...</span>
                            </div>
                        )}
                    </div>

                    {/* Reported Medical History */}
                    <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg">
                        <h3 className="font-semibold text-blue-800 mb-2">Reported Medical History</h3>
                        <p className="text-gray-700 whitespace-pre-wrap text-sm">
                            {profile?.medicalHistory || "No patient-reported medical history available."}
                        </p>
                    </div>

                    {/* Uploaded Documents */}
                    {documents.length > 0 && (
                        <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
                            <h3 className="font-semibold text-gray-800 mb-3">Uploaded Documents</h3>
                            <div className="space-y-2">
                                {documents.map((doc) => (
                                    <div key={doc.id} className="flex items-center justify-between p-2 bg-white rounded border">
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-800 truncate">{doc.fileName}</p>
                                            <p className="text-xs text-gray-500">
                                                {formatDate(doc.uploadDate)} • {formatFileSize(doc.fileSize)}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => downloadDocument(doc.id, doc.fileName)}
                                            className="ml-2 px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                                        >
                                            Download
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Recent Prescriptions Section */}
                <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-800 border-b pb-2 mb-4">Recent Prescriptions</h3>
                    
                    {prescriptions.length === 0 ? (
                        <div className="text-center py-8">
                            <svg className="mx-auto h-12 w-12 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <p className="text-sm text-gray-500 italic">No recent prescriptions found.</p>
                        </div>
                    ) : (
                        <div className="space-y-4 max-h-96 overflow-y-auto">
                            {prescriptions.map((prescription) => (
                                <div key={prescription.id} className="bg-white p-4 rounded-lg border border-gray-200">
                                    <div className="flex items-start justify-between mb-2">
                                        <div>
                                            <h4 className="font-medium text-gray-800">Dr. {prescription.doctorName}</h4>
                                            <p className="text-xs text-gray-500">{formatDate(prescription.prescriptionDate)}</p>
                                        </div>
                                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusColor(prescription.status)}`}>
                                            {prescription.status}
                                        </span>
                                    </div>
                                    
                                    <div className="mb-2">
                                        <p className="text-sm font-medium text-gray-700">Diagnosis:</p>
                                        <p className="text-sm text-gray-600">{prescription.diagnosis}</p>
                                    </div>
                                    
                                    <div className="mb-2">
                                        <p className="text-sm font-medium text-gray-700">Medications:</p>
                                        <ul className="text-sm text-gray-600 list-disc list-inside">
                                            {prescription.medications.map((med, index) => (
                                                <li key={index}>{med}</li>
                                            ))}
                                        </ul>
                                    </div>
                                    
                                    {prescription.notes && (
                                        <div>
                                            <p className="text-sm font-medium text-gray-700">Notes:</p>
                                            <p className="text-sm text-gray-600">{prescription.notes}</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PatientHistory;
