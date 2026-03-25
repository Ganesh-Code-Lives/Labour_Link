import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { db } from '../../firebase/config';
import { subscribeToLabourerRequests, updateJobStatus } from '../../firebase/services';
import StatusBadge from '../../components/ui/StatusBadge';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';
import { Loader2, Briefcase, CheckCircle, XCircle } from 'lucide-react';

const LabourerDashboard = () => {
    const { currentUser } = useContext(AuthContext);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null); // specific job ID loading

    useEffect(() => {
        let unsubscribe = () => {};

        const setupSubscription = () => {
            if (!currentUser?.uid) return;
            setLoading(true);

            unsubscribe = subscribeToLabourerRequests(currentUser.uid, (requestsData) => {
                const formattedRequests = requestsData.map(req => ({
                    id: req.id,
                    ...req,
                    customerName: req.customer?.name || 'Unknown User',
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

            if (newStatus === 'accepted') {
                toast.success('Request Accepted');
            } else if (newStatus === 'rejected') {
                toast.success('Request Rejected');
            } else if (newStatus === 'completed') {
                toast.success('Job Completed');
            } else {
                toast.success(`Job request ${newStatus}!`);
            }
        } catch (error) {
            toast.error('Failed to update status');
            console.error(error);
        } finally {
            setActionLoading(null);
        }
    };

    const pendingRequests = requests.filter(r => r.status === 'pending');
    const activeRequests = requests.filter(r => r.status === 'accepted');
    const pastRequests = requests.filter(r => r.status === 'completed' || r.status === 'rejected');

    return (
        <div className="space-y-8 animate-fade-in">

            {/* Top Banner Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-800">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-500 rounded-lg">
                            <Briefcase className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">New Requests</p>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{pendingRequests.length}</h3>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-800">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary-light/20 text-primary rounded-lg dark:bg-primary/20">
                            <CheckCircle className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">In Progress</p>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{activeRequests.length}</h3>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-800">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-500 rounded-lg">
                            <span className="w-6 h-6 flex items-center justify-center font-bold text-lg">₹</span>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Completed Jobs</p>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                                {pastRequests.filter(r => r.status === 'completed').length}
                            </h3>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Jobs Board */}
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Action Needed</h3>

                {loading ? (
                    <div className="flex justify-center py-8"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
                ) : pendingRequests.length > 0 || activeRequests.length > 0 ? (
                    <div className="space-y-4">
                        {/* Render Active Jobs first */}
                        {activeRequests.map(job => (
                            <div key={job.id} className="p-5 border border-primary/30 bg-primary-light/5 dark:bg-primary/5 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <h4 className="font-bold text-lg text-gray-900 dark:text-white">{job.customerName}</h4>
                                        <StatusBadge status={job.status} />
                                    </div>
                                    <h5 className="font-bold text-primary mb-1">{job.jobTitle}</h5>
                                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{job.jobDescription}</p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-xs">
                                        <p className="text-gray-500 dark:text-gray-400"><strong>Requested Date:</strong> {job.serviceDate || job.date}</p>
                                        <p className="text-gray-500 dark:text-gray-400"><strong>Location:</strong> {job.serviceLocation}</p>
                                        <p className="text-gray-500 dark:text-gray-400 font-medium text-primary"><strong>Contact:</strong> {job.customerPhone}</p>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <Button
                                        variant="primary"
                                        onClick={() => handleUpdateStatus(job.id, 'completed')}
                                        isLoading={actionLoading === job.id}
                                        disabled={actionLoading !== null}
                                    >
                                        Mark Completed
                                    </Button>
                                </div>
                            </div>
                        ))}

                        {/* Render Pending Requests */}
                        {pendingRequests.map(job => (
                            <div key={job.id} className="p-5 border border-gray-200 dark:border-gray-800 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <h4 className="font-bold text-lg text-gray-900 dark:text-white">{job.customerName}</h4>
                                        <StatusBadge status={job.status} />
                                    </div>
                                    <h5 className="font-bold text-primary mb-1">{job.jobTitle}</h5>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                                        {job.jobDescription}
                                    </p>
                                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                                        <span><strong>Date:</strong> {job.serviceDate || job.date}</span>
                                        <span><strong>Location:</strong> {job.serviceLocation}</span>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleUpdateStatus(job.id, 'rejected')}
                                        disabled={actionLoading !== null}
                                    >
                                        Reject
                                    </Button>
                                    <Button
                                        variant="primary"
                                        size="sm"
                                        onClick={() => handleUpdateStatus(job.id, 'accepted')}
                                        isLoading={actionLoading === job.id}
                                        disabled={actionLoading !== null}
                                    >
                                        Accept Job
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="w-8 h-8 text-secondary-light" />
                        </div>
                        <h4 className="text-gray-900 dark:text-white font-medium">All caught up</h4>
                        <p className="text-gray-500 dark:text-gray-400 mt-1 max-w-sm mx-auto">
                            You don't have any pending requests or active jobs at the moment.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LabourerDashboard;
