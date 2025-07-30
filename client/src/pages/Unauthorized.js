import React from 'react';

const Unauthorized = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 p-4">
            <h1 className="text-4xl font-bold mb-4">403 - Unauthorized Access</h1>
            <p className="text-lg text-center">You do not have permission to view this page.</p>
            <a href="/login" className="mt-6 text-blue-600 hover:underline">Go to Login</a>
        </div>
    );
};

export default Unauthorized;