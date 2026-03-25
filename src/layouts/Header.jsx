import React, { useContext } from 'react';
import { useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useDarkMode } from '../hooks/useDarkMode';
import { Menu, Moon, Sun, User, Bell } from 'lucide-react';

const Header = ({ setSidebarOpen }) => {
    const { currentUser } = useContext(AuthContext);
    const { theme, toggleTheme } = useDarkMode();
    const location = useLocation();

    const getPageTitle = () => {
        const path = location.pathname.split('/').pop();
        if (path === 'customer' || path === 'labourer' || path === 'admin') return 'Dashboard';
        if (!path) return 'LabourLink';
        return path.charAt(0).toUpperCase() + path.slice(1).replace('-', ' ');
    };

    return (
        <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 lg:px-6 transition-colors sticky top-0 z-10 w-full">
            <div className="flex items-center gap-3">
                <button
                    onClick={() => setSidebarOpen(true)}
                    className="lg:hidden p-2 -ml-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
                >
                    <Menu className="w-6 h-6" />
                </button>
                <h1 className="text-xl font-bold text-gray-800 dark:text-white truncate">
                    {getPageTitle()}
                </h1>
            </div>

            <div className="flex items-center gap-4">
                {/* Dark Mode Toggle */}
                <button
                    onClick={toggleTheme}
                    className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
                    aria-label="Toggle dark mode"
                >
                    {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>

                {/* Notifications Dummy */}
                <button className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors relative">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>

                {/* User Profile */}
                <div className="flex items-center gap-2 pl-4 border-l border-gray-200 dark:border-gray-800">
                    {currentUser?.photoURL ? (
                        <img 
                            src={currentUser.photoURL} 
                            alt={currentUser?.name || 'Profile'} 
                            className="w-8 h-8 rounded-full object-cover border border-gray-200 dark:border-gray-700"
                            referrerPolicy="no-referrer"
                        />
                    ) : (
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-semibold shadow-sm">
                            {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                        </div>
                    )}
                    <div className="hidden md:block text-sm">
                        <p className="font-medium text-gray-700 dark:text-gray-200">{currentUser?.name || 'User'}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{currentUser?.role || ''}</p>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
