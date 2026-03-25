import React, { useState, useEffect } from 'react';
import { getDashboardStats, getCategories, addCategory, deleteCategory, seedDatabase } from '../../firebase/services';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, Briefcase, List as ListIcon, Loader2, Trash2 } from 'lucide-react';

const AdminDashboard = () => {
    const [stats, setStats] = useState({ users: 0, labourers: 0, jobs: 0, completedJobs: 0 });
    const [chartData, setChartData] = useState([]);
    const [categories, setCategories] = useState([]);
    const [newCategory, setNewCategory] = useState('');

    const [loading, setLoading] = useState(true);
    const [addingCat, setAddingCat] = useState(false);
    const [seeding, setSeeding] = useState(false);

    const handleSeed = async () => {
        try {
            setSeeding(true);
            await seedDatabase();
            toast.success("Database seeded! Please refresh.");
        } catch (error) {
            toast.error("Failed to seed database.");
        } finally {
            setSeeding(false);
        }
    };

    useEffect(() => {
        const fetchAdminData = async () => {
            try {
                const statsData = await getDashboardStats();
                setStats({
                    users: statsData.totalUsers,
                    labourers: statsData.totalLabourers,
                    jobs: statsData.totalRequests,
                    completedJobs: statsData.completedJobs
                });
                setChartData(statsData.chartData);

                const cats = await getCategories();
                setCategories(cats);
            } catch (error) {
                console.error("Admin fetch error:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAdminData();
    }, []);

    const handleAddCategory = async (e) => {
        e.preventDefault();
        if (!newCategory.trim()) return;

        try {
            setAddingCat(true);
            
            const categoryId = await addCategory(newCategory.trim());

            setCategories([...categories, { id: categoryId, categoryName: newCategory.trim() }]);
            setNewCategory('');
            toast.success('Category added successfully');
        } catch (error) {
            toast.error('Failed to add category');
            console.error(error);
        } finally {
            setAddingCat(false);
        }
    };

    const handleDeleteCategory = async (categoryId) => {
        if (!window.confirm('Delete this category?')) return;
        try {
            await deleteCategory(categoryId);
            setCategories(categories.filter(c => c.id !== categoryId));
            toast.success('Category deleted');
        } catch (error) {
            toast.error('Failed to delete category');
        }
    };

    if (loading) {
        return <div className="flex justify-center py-12"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>;
    }

    return (
        <div className="space-y-8 animate-fade-in">

            <div className="flex justify-end mb-4">
                <Button variant="outline" onClick={handleSeed} isLoading={seeding}>
                    Seed Dummy Data
                </Button>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard icon={Users} title="Total Customers" value={stats.users} color="text-blue-600" bg="bg-blue-100 dark:bg-blue-900/30" />
                <MetricCard icon={Briefcase} title="Total Labourers" value={stats.labourers} color="text-emerald-600" bg="bg-emerald-100 dark:bg-emerald-900/30" />
                <MetricCard icon={ListIcon} title="Total Job Requests" value={stats.jobs} color="text-purple-600" bg="bg-purple-100 dark:bg-purple-900/30" />
                <MetricCard icon={ListIcon} title="Completed Jobs" value={stats.completedJobs} color="text-yellow-600" bg="bg-yellow-100 dark:bg-yellow-900/30" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Charting Status */}
                <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-800">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Job Requests by Status</h3>
                    <div className="h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" className="dark:stroke-gray-800" />
                                <XAxis dataKey="name" tick={{ fill: '#6b7280' }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: '#6b7280' }} axisLine={false} tickLine={false} />
                                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={60} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Category Management */}
                <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-800">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Manage Categories</h3>

                    <form onSubmit={handleAddCategory} className="flex gap-2 mb-6">
                        <Input
                            id="newCat"
                            placeholder="New Category..."
                            value={newCategory}
                            onChange={(e) => setNewCategory(e.target.value)}
                            className="mb-0 flex-1"
                            required
                        />
                        <Button type="submit" isLoading={addingCat}>Add</Button>
                    </form>

                    <div className="space-y-3">
                        {categories.map(cat => (
                            <div key={cat.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-800">
                                <span className="font-medium text-gray-700 dark:text-gray-200">{cat.categoryName}</span>
                                <button
                                    onClick={() => handleDeleteCategory(cat.id)}
                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                        {categories.length === 0 && (
                            <p className="text-center text-sm text-gray-500 dark:text-gray-400">No categories found. Start adding some!</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const MetricCard = ({ title, value, icon: Icon, color, bg }) => (
    <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-800 flex items-center gap-4">
        <div className={`p-4 rounded-xl ${bg} ${color}`}>
            <Icon className="w-8 h-8" />
        </div>
        <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</h3>
        </div>
    </div>
);

export default AdminDashboard;
