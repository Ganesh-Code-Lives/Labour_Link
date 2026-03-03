import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Home, User, Briefcase, List, LogOut, Settings, BarChart2, Shield, X } from 'lucide-react';
import toast from 'react-hot-toast';

const Sidebar = ({ isOpen, setIsOpen }) => {
    const { userRole, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
            toast.success('Logged out successfully');
            navigate('/login');
        } catch (error) {
            toast.error('Failed to log out');
        }
    };

    const getLinks = () => {
        switch (userRole) {
            case 'customer':
                return [
                    { name: 'Dashboard', path: '/customer', icon: Home },
                    { name: 'Search Labour', path: '/customer/search', icon: User },
                    { name: 'My Requests', path: '/customer/requests', icon: List },
                ];
            case 'labourer':
                return [
                    { name: 'Dashboard', path: '/labourer', icon: Home },
                    { name: 'Job Requests', path: '/labourer/requests', icon: Briefcase },
                    { name: 'Profile Settings', path: '/labourer/profile', icon: Settings },
                ];
            case 'admin':
                return [
                    { name: 'Dashboard', path: '/admin', icon: BarChart2 },
                    { name: 'Manage Users', path: '/admin/users', icon: User },
                    { name: 'Categories', path: '/admin/categories', icon: List },
                    { name: 'System Logs', path: '/admin/logs', icon: Shield },
                ];
            default:
                return [];
        }
    };

    const links = getLinks();

    return (
        <aside className={`fixed left-0 top-0 h-screen w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col z-30 transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
            {/* Logo Section */}
            <div className="h-16 flex items-center justify-between px-6">
                <div className="flex items-center gap-3 text-primary">
                    <div className="bg-primary/10 p-1.5 rounded-lg">
                        <Briefcase className="w-6 h-6 text-primary dark:text-primary-light" />
                    </div>
                    <span className="text-xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                        Labour<span className="text-primary dark:text-primary-light">Link</span>
                    </span>
                </div>
                {/* Mobile Close Button */}
                <button
                    onClick={() => setIsOpen(false)}
                    className="lg:hidden p-1 -mr-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            <div className="flex-1 px-4 pb-4 overflow-y-auto mt-4 space-y-2">
                {links.map((link) => {
                    const Icon = link.icon;
                    return (
                        <NavLink
                            key={link.name}
                            to={link.path}
                            end={link.path.split('/').length <= 2} // Exact match for base dashboard
                            onClick={() => setIsOpen(false)} // Close sidebar on mobile
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${isActive
                                    ? 'bg-primary-light/10 text-primary dark:bg-primary/20 dark:text-primary-light'
                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                                }`
                            }
                        >
                            <Icon className="w-5 h-5" />
                            {link.name}
                        </NavLink>
                    );
                })}
            </div>

            <div className="p-4 border-t border-gray-200 dark:border-gray-800">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 w-full text-left rounded-lg font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors"
                >
                    <LogOut className="w-5 h-5" />
                    Logout
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
