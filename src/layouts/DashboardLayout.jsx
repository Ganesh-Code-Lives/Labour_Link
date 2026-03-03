import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const DashboardLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex transition-colors">
            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-20 bg-gray-900/50 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

            <div className="flex-1 flex flex-col lg:ml-64 w-full transition-all duration-300 min-w-0">
                <Header setSidebarOpen={setSidebarOpen} />
                <main className="flex-1 p-4 lg:p-6 overflow-y-auto w-full max-w-7xl mx-auto">
                    {/* Outlet renders the matched child route component */}
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
