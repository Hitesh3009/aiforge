import React, { useEffect } from 'react';

function Notification({ email, message, onClose, statusCode,isLogin,userName }) {
    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => {
                onClose();
            }, 5000);

            return () => clearTimeout(timer); // cleanup on unmount or if message changes
        }
    }, [message, onClose]);
    if (!message) return null;
    const isError = statusCode;
    const textColor = isError === 409 || isError === 404 || isError === 401 || isError === 500 ? 'text-red-700' : 'text-green-700';
    const bgColor = isError === 409 || isError === 404 || isError === 401 || isError === 500 ? 'bg-red-100 border-red-400' : 'bg-green-100 border-green-400';
    return (
        <div className="fixed top-4 right-4 z-50">
            <div className={`border ${bgColor} ${textColor} px-4 py-3 rounded shadow-lg flex items-center justify-between gap-4`}>
                {! isLogin ?<span>{message}</span>:<span>{message} <b>{userName}</b></span>}
                <button onClick={onClose} className={`${textColor} font-bold`}>✖</button>
            </div>
        </div>
    );
}

export default Notification;
