import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { subscribeToCustomerRequests, getCategories, cancelJobRequest } from '../../firebase/services';
import StatusBadge from '../../components/ui/StatusBadge';
import Button from '../../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { Search, Loader2, ClipboardList, CheckCircle, Clock, UserPlus, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

const StatCard = ({ icon: Icon, label, value, color, bg }) => (
    <div className="bg-white dark:bg-gray-900 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-800 flex items-center gap-4">
        <div className={`p-3 rounded-xl ${bg}`}>
            <Icon className={`w-6 h-6 ${color}`} />
        </div>
        <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{label}</p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{value}</h3>
        </div>
    </div>
);

const CustomerDashboard = () => {
    const { currentUser } = useContext(AuthContext);
    const [activeJobs, setActiveJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        let unsubscribe = () => {};
        const setupSubscription = async () => {
            if (!currentUser?.uid) return;
            setLoading(true);
            try {
                const cats = await getCategories();
                const catMap = cats.reduce((acc, c) => ({ ...acc, [c.id]: c.categoryName }), {});
                unsubscribe = subscribeToCustomerRequests(currentUser.uid, (requests) => {
                    const formattedRequests = requests.map(req => {
                        const catId = req.labourerDetails?.categoryRef?.id;
                        return {
                            id: req.id,
                            ...req,
                            labourerName: req.labourer?.name || 'Unknown',
                            categoryName: catId ? catMap[catId] || 'Task' : 'Task',
                            date: req.createdAt ? req.createdAt.toDate().toLocaleDateString() : 'N/A'
                        };
                    });
                    setActiveJobs(formattedRequests);
                    setLoading(false);
                });
            } catch (error) {
                console.error('Error setting up job subscription:', error);
                setLoading(false);
            }
        };
        setupSubscription();
        return () => unsubscribe();
    }, [currentUser]);

    const pending = activeJobs.filter(j => j.status === 'pending' || j.status === 'applied');
    const active = activeJobs.filter(j => j.status === 'accepted');
    const completed = activeJobs.filter(j => j.status === 'completed');

    return (
        <div className="space-y-6 animate-fade-in">

            {/* Welcome Banner */}
            <div className="relative bg-gradient-to-r from-primary to-primary-dark rounded-2xl p-8 text-white shadow-lg overflow-hidden">
                <div className="absolute -right-16 -top-16 w-64 h-64 bg-white/5 rounded-full blur-2xl" />
                <div className="absolute -left-8 -bottom-8 w-48 h-48 bg-white/5 rounded-full blur-2xl" />
                <div className="relative z-10">
                    <p className="text-blue-200 text-sm font-medium uppercase tracking-wider mb-1">Hiring Manager</p>
                    <h2 className="text-3xl font-bold mb-2">Hello, {currentUser?.name?.split(' ')[0]}! 👋</h2>
                    <p className="text-blue-100 mb-6 max-w-md">Post tasks to students and get your work done quickly and affordably.</p>
                    <Button
                        className="!bg-white !text-primary hover:!bg-blue-50 shadow-md"
                        onClick={() => navigate('/customer/search')}
                    >
                        <Search className="w-4 h-4 mr-2" />
                        Find a Student
                        <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard icon={Clock} label="Pending" value={pending.length} color="text-amber-600" bg="bg-amber-100 dark:bg-amber-900/30" />
                <StatCard icon={UserPlus} label="Active Tasks" value={active.length} color="text-blue-600" bg="bg-blue-100 dark:bg-blue-900/30" />
                <StatCard icon={CheckCircle} label="Completed" value={completed.length} color="text-green-600" bg="bg-green-100 dark:bg-green-900/30" />
            </div>

            {/* Task Table */}
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <ClipboardList className="w-5 h-5 text-primary" />
                        My Task Applications
                    </h3>
                    <Button size="sm" onClick={() => navigate('/customer/search')}>
                        + Post a Task
                    </Button>
                </div>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : activeJobs.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                    <th className="pb-3">Date</th>
                                    <th className="pb-3">Task</th>
                                    <th className="pb-3">Category</th>
                                    <th className="pb-3">Student</th>
                                    <th className="pb-3">Status</th>
                                    <th className="pb-3 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm divide-y divide-gray-100 dark:divide-gray-800">
                                {activeJobs.map(job => (
                                    <tr key={job.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                                        <td className="py-4 text-gray-500 dark:text-gray-400 text-xs">{job.date}</td>
                                        <td className="py-4 font-semibold text-gray-900 dark:text-white">{job.jobTitle || 'General Task'}</td>
                                        <td className="py-4">
                                            <span className="bg-primary/10 text-primary text-xs font-medium px-2 py-1 rounded-full">{job.categoryName}</span>
                                        </td>
                                        <td className="py-4 text-gray-600 dark:text-gray-300">{job.labourerName}</td>
                                        <td className="py-4"><StatusBadge status={job.status} /></td>
                                        <td className="py-4 text-right">
                                            {(job.status === 'applied' || job.status === 'pending') && (
                                                <Button size="sm" variant="outline"
                                                    className="text-red-500 border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-950"
                                                    onClick={async () => {
                                                        if (window.confirm('Cancel this task?')) {
                                                            try { await cancelJobRequest(job.id); toast.success('Task cancelled'); }
                                                            catch { toast.error('Failed to cancel'); }
                                                        }
                                                    }}
                                                >Cancel</Button>
                                            )}
                                            {job.status === 'completed' && !job.reviewed && (
                                                <Button size="sm" variant="outline" onClick={() => navigate(`/customer/review/${job.id}`)}>
                                                    ⭐ Rate Student
                                                </Button>
                                            )}
                                            {job.reviewed && (
                                                <span className="text-xs text-green-500 font-medium">✓ Reviewed</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Search className="w-8 h-8 text-primary" />
                        </div>
                        <h4 className="text-gray-900 dark:text-white font-semibold text-lg mb-1">No tasks posted yet</h4>
                        <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto">
                            Browse available student workers and post your first task today.
                        </p>
                        <Button onClick={() => navigate('/customer/search')}>
                            <Search className="w-4 h-4 mr-2" /> Find Students
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CustomerDashboard;
