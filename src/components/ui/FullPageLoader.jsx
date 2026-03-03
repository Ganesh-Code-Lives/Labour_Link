import React from 'react';
import { Loader2 } from 'lucide-react';

const FullPageLoader = ({ message = "Loading..." }) => {
    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="mt-4 text-lg font-medium text-gray-700 dark:text-gray-200">{message}</p>
        </div>
    );
};

export default FullPageLoader;
