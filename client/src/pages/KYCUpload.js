import React, { useState } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';

const KYCUpload = () => {
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleFileChange = (e) => {
        setSelectedFiles(Array.from(e.target.files));
        setMessage('');
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (selectedFiles.length === 0) {
            setError('Please select at least one file.');
            return;
        }

        const formData = new FormData();
        selectedFiles.forEach(file => {
            formData.append('kycDocuments', file);
        });

        try {
            const res = await axios.post('http://localhost:5000/api/upload/kyc', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setMessage(res.data.message);
            setSelectedFiles([]);
        } catch (err) {
            console.error('File upload error:', err.response ? err.response.data.message : err.message);
            setError(err.response ? err.response.data.message : 'Error uploading files.');
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            <Navbar />
            <div className="container mx-auto p-6">
                <h1 className="text-3xl font-bold mb-6">KYC Document Upload</h1>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md max-w-lg mx-auto">
                    <p className="mb-4">Please upload your ID proof (e.g., Passport, Aadhar Card) and Address proof (e.g., Utility Bill).</p>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label htmlFor="kycFiles" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Select Documents (JPEG, PNG, PDF - Max 5)
                            </label>
                            <input
                                type="file"
                                id="kycFiles"
                                multiple
                                accept=".jpg,.jpeg,.png,.pdf"
                                onChange={handleFileChange}
                                className="block w-full text-sm text-gray-900 dark:text-gray-100
                                           file:mr-4 file:py-2 file:px-4
                                           file:rounded-full file:border-0
                                           file:text-sm file:font-semibold
                                           file:bg-blue-50 dark:file:bg-blue-900 file:text-blue-700 dark:file:text-blue-300
                                           hover:file:bg-blue-100 dark:hover:file:bg-blue-800"
                            />
                            {selectedFiles.length > 0 && (
                                <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                    Selected: {selectedFiles.map(file => file.name).join(', ')}
                                </div>
                            )}
                        </div>
                        {message && <p className="text-green-600 mb-4">{message}</p>}
                        {error && <p className="text-red-600 mb-4">{error}</p>}
                        <button
                            type="submit"
                            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
                        >
                            Upload Documents
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default KYCUpload;