import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { db } from '../../firebase/config';
import { subscribeToCustomerRequests, getCategories, cancelJobRequest } from '../../firebase/services';
import StatusBadge from '../../components/ui/StatusBadge';
import Button from '../../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { Search, Loader2 } from 'lucide-react';

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
                            categoryName: catId ? catMap[catId] || 'Service' : 'Service',
                            date: req.createdAt ? req.createdAt.toDate().toLocaleDateString() : 'N/A'
                        };
                    });
                    setActiveJobs(formattedRequests);
                    setLoading(false);
                });
            } catch (error) {
                console.error("Error setting up job subscription:", error);
                setLoading(false);
            }
        };

        setupSubscription();

        return () => unsubscribe();
    }, [currentUser]);

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Welcome Banner */}
            <div className="bg-gradient-to-r from-primary to-primary-dark dark:from-gray-800 dark:to-gray-900 border dark:border-gray-800 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
                {/* Decorative background circle for dark mode flair */}
                <div className="hidden dark:block absolute -right-20 -top-20 w-64 h-64 bg-primary/20 rounded-full blur-3xl"></div>

                <div className="relative z-10">
                    <h2 className="text-3xl font-bold mb-2 text-white">Welcome back, {currentUser?.name?.split(' ')[0]}!</h2>
                    <p className="text-primary-light dark:text-gray-300 mb-6">Find the right local professional for your next project.</p>
                    <Button
                        className="!bg-white !text-primary dark:!bg-primary dark:!text-white hover:!bg-gray-50 dark:hover:!bg-primary-dark border-none shadow-md transition-all"
                        onClick={() => navigate('/customer/search')}
                    >
                        <Search className="w-4 h-4 mr-2" />
                        Find Work
                    </Button>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Recent Job Requests</h3>

                {loading ? (
                    <div className="flex justify-center py-8">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : activeJobs.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-200 dark:border-gray-800 text-sm string text-gray-500 dark:text-gray-400">
                                    <th className="pb-3 font-medium">Date</th>
                                    <th className="pb-3 font-medium">Job Title</th>
                                    <th className="pb-3 font-medium">Service</th>
                                    <th className="pb-3 font-medium">Labourer</th>
                                    <th className="pb-3 font-medium">Status</th>
                                    <th className="pb-3 font-medium text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm divide-y divide-gray-100 dark:divide-gray-800">
                                {activeJobs.map(job => (
                                    <tr key={job.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                        <td className="py-4 text-gray-900 dark:text-gray-300">{job.date}</td>
                                        <td className="py-4 font-bold text-primary">{job.jobTitle || 'General'}</td>
                                        <td className="py-4 font-medium text-gray-900 dark:text-white">{job.categoryName}</td>
                                        <td className="py-4 text-gray-600 dark:text-gray-400">{job.labourerName}</td>
                                        <td className="py-4"><StatusBadge status={job.status} /></td>
                                        <td className="py-4 text-right flex justify-end gap-2">
                                            {job.status === 'pending' && (
                                                <Button 
                                                    size="sm" 
                                                    variant="outline" 
                                                    className="text-red-500 border-red-200 hover:bg-red-50"
                                                    onClick={async () => {
                                                        if(window.confirm('Cancel this request?')) {
                                                            try {
                                                                await cancelJobRequest(job.id);
                                                                toast.success('Request cancelled');
                                                            } catch(e) {
                                                                toast.error('Failed to cancel');
                                                            }
                                                        }
                                                    }}
                                                >
                                                    Cancel
                                                </Button>
                                            )}
                                            {job.status === 'completed' && !job.reviewed ? (
                                                <Button size="sm" variant="outline" onClick={() => navigate(`/customer/review/${job.id}`)}>
                                                    Leave Review
                                                </Button>
                                            ) : (
                                                job.status !== 'pending' && (
                                                    <span className="text-gray-400 text-xs italic">
                                                        {job.reviewed ? 'Reviewed' : 'Active / Completed'}
                                                    </span>
                                                )
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search className="w-8 h-8 text-gray-400" />
                        </div>
                        <h4 className="text-gray-900 dark:text-white font-medium">No job requests yet</h4>
                        <p className="text-gray-500 dark:text-gray-400 mt-1 max-w-sm mx-auto">
                            You haven't hired anyone yet. Start by searching for a professional in your area.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CustomerDashboard;
