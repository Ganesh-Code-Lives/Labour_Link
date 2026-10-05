import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { subscribeToLabourerRequests, updateJobStatus } from '../../firebase/services';
import StatusBadge from '../../components/ui/StatusBadge';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';
import { Loader2, Briefcase, CheckCircle, Clock, TrendingUp, Star, ArrowRight } from 'lucide-react';

const StatCard = ({ icon: Icon, label, value, color, bg, suffix = '' }) => (
    <div className="bg-white dark:bg-gray-900 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-800 flex items-center gap-4">
        <div className={`p-3 rounded-xl ${bg}`}>
            <Icon className={`w-6 h-6 ${color}`} />
        </div>
        <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{label}</p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{value}{suffix}</h3>
        </div>
    </div>
);

const LabourerDashboard = () => {
    const { currentUser } = useContext(AuthContext);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);

    useEffect(() => {
        let unsubscribe = () => {};
        const setupSubscription = () => {
            if (!currentUser?.uid) return;
            setLoading(true);
            unsubscribe = subscribeToLabourerRequests(currentUser.uid, (requestsData) => {
                const formattedRequests = requestsData.map(req => ({
                    id: req.id,
                    ...req,
                    customerName: req.customer?.name || 'Unknown Business',
                    customerPhone: req.customer?.phone || 'N/A',
                    customerAddress: req.customer?.address || 'N/A',
                    date: req.createdAt ? req.createdAt.toDate().toLocaleDateString() : 'N/A'
                }));
                setRequests(formattedRequests);
                setLoading(false);
            });
        };
        setupSubscription();
        return () => unsubscribe();
    }, [currentUser]);

    const handleUpdateStatus = async (jobId, newStatus) => {
        try {
            setActionLoading(jobId);
            await updateJobStatus(jobId, newStatus);
            const msgs = { accepted: 'Gig accepted! 🎉', rejected: 'Offer declined.', completed: 'Task marked complete! 💰' };
            toast.success(msgs[newStatus] || `Status updated to ${newStatus}`);
        } catch (error) {
            toast.error('Failed to update status');
            console.error(error);
        } finally {
            setActionLoading(null);
        }
    };

    const pendingRequests = requests.filter(r => r.status === 'pending' || r.status === 'applied');
    const activeRequests = requests.filter(r => r.status === 'accepted');
    const completedRequests = requests.filter(r => r.status === 'completed');
    const totalEarnings = completedRequests.reduce((sum, r) => sum + (Number(r.pricing) || 0), 0);

    return (
        <div className="space-y-6 animate-fade-in">

            {/* Welcome Banner */}
            <div className="relative bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl p-8 text-white shadow-lg overflow-hidden">
                <div className="absolute -right-16 -top-16 w-64 h-64 bg-white/5 rounded-full blur-2xl" />
                <div className="absolute -left-8 -bottom-8 w-48 h-48 bg-white/5 rounded-full blur-2xl" />
                <div className="relative z-10">
                    <p className="text-amber-200 text-sm font-medium uppercase tracking-wider mb-1">Student Worker</p>
                    <h2 className="text-3xl font-bold mb-2">Hey, {currentUser?.name?.split(' ')[0]}! 🎓</h2>
                    <p className="text-amber-100 mb-6 max-w-md">
                        You have <strong>{pendingRequests.length}</strong> new job {pendingRequests.length === 1 ? 'offer' : 'offers'} waiting for your response.
                    </p>
                    {pendingRequests.length > 0 && (
                        <div className="inline-flex items-center gap-2 bg-white/20 text-white font-semibold text-sm px-4 py-2 rounded-xl">
                            <Clock className="w-4 h-4" />
                            {pendingRequests.length} offer{pendingRequests.length > 1 ? 's' : ''} need your attention
                            <ArrowRight className="w-4 h-4" />
                        </div>
                    )}
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={Clock} label="Pending Offers" value={pendingRequests.length} color="text-amber-600" bg="bg-amber-100 dark:bg-amber-900/30" />
                <StatCard icon={Briefcase} label="Active Gigs" value={activeRequests.length} color="text-blue-600" bg="bg-blue-100 dark:bg-blue-900/30" />
                <StatCard icon={CheckCircle} label="Completed" value={completedRequests.length} color="text-green-600" bg="bg-green-100 dark:bg-green-900/30" />
                <StatCard icon={TrendingUp} label="Total Earned" value={`₹${totalEarnings.toLocaleString()}`} color="text-purple-600" bg="bg-purple-100 dark:bg-purple-900/30" />
            </div>

            {/* Active Gigs */}
            {activeRequests.length > 0 && (
                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />
                        Active Gigs — In Progress
                    </h3>
                    <div className="space-y-4">
                        {activeRequests.map(job => (
                            <div key={job.id} className="p-5 border-2 border-primary/30 bg-primary/5 dark:bg-primary/10 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h4 className="font-bold text-gray-900 dark:text-white truncate">{job.jobTitle || 'Gig'}</h4>
                                        <StatusBadge status={job.status} />
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-2 line-clamp-2">{job.jobDescription}</p>
                                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
                                        <span className="font-medium text-primary">🏢 {job.customerName}</span>
                                        <span>📅 {job.serviceDate || job.date}</span>
                                        <span>📍 {job.serviceLocation}</span>
                                        <span>📞 {job.customerPhone}</span>
                                    </div>
                                </div>
                                <Button
                                    variant="primary"
                                    onClick={() => handleUpdateStatus(job.id, 'completed')}
                                    isLoading={actionLoading === job.id}
                                    disabled={actionLoading !== null}
                                    className="whitespace-nowrap"
                                >
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Mark Complete
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Pending Offers */}
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-amber-500" />
                    New Job Offers
                    {pendingRequests.length > 0 && (
                        <span className="bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 text-xs font-bold px-2 py-0.5 rounded-full ml-1">
                            {pendingRequests.length} new
                        </span>
                    )}
                </h3>

                {loading ? (
                    <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
                ) : pendingRequests.length > 0 ? (
                    <div className="space-y-4">
                        {pendingRequests.map(job => (
                            <div key={job.id} className="p-5 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-amber-300 dark:hover:border-amber-700 transition-colors hover:bg-amber-50/50 dark:hover:bg-amber-950/20">
                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h4 className="font-bold text-gray-900 dark:text-white">{job.jobTitle || 'Task Offer'}</h4>
                                            <StatusBadge status={job.status} />
                                        </div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">{job.jobDescription}</p>
                                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
                                            <span className="font-semibold text-gray-700 dark:text-gray-200">🏢 {job.customerName}</span>
                                            <span>📅 {job.serviceDate || job.date}</span>
                                            <span>📍 {job.serviceLocation}</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-3 flex-shrink-0">
                                        <Button size="sm" variant="outline"
                                            className="text-red-500 border-red-200 hover:bg-red-50 dark:border-red-800"
                                            onClick={() => handleUpdateStatus(job.id, 'rejected')}
                                            disabled={actionLoading !== null}
                                        >
                                            Decline
                                        </Button>
                                        <Button size="sm"
                                            onClick={() => handleUpdateStatus(job.id, 'accepted')}
                                            isLoading={actionLoading === job.id}
                                            disabled={actionLoading !== null}
                                        >
                                            Accept Gig
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Star className="w-8 h-8 text-amber-500" />
                        </div>
                        <h4 className="text-gray-900 dark:text-white font-semibold mb-1">No pending offers</h4>
                        <p className="text-gray-500 dark:text-gray-400 text-sm max-w-xs mx-auto">
                            Keep your profile updated to attract more hiring managers!
                        </p>
                    </div>
                )}
            </div>

            {/* Completed History */}
            {completedRequests.length > 0 && (
                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        Completed Gigs
                    </h3>
                    <div className="space-y-3">
                        {completedRequests.map(job => (
                            <div key={job.id} className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-xl">
                                <div>
                                    <p className="font-semibold text-gray-900 dark:text-white">{job.jobTitle || 'Task'}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{job.customerName} • {job.date}</p>
                                </div>
                                <div className="text-right">
                                    <StatusBadge status={job.status} />
                                    {job.reviewed && <p className="text-xs text-green-600 dark:text-green-400 mt-1 font-medium">✓ Rated</p>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default LabourerDashboard;
