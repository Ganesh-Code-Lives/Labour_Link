import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { db } from '../../firebase/config';
import { collection, query, where, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';
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
        const fetchRequests = async () => {
            try {
                if (!currentUser?.uid) return;

                // Query jobs referencing this Labourer
                const labourerRef = doc(db, 'labourers', currentUser.uid);
                const q = query(
                    collection(db, 'jobRequests'),
                    where('labourerRef', '==', labourerRef)
                );

                const querySnapshot = await getDocs(q);

                const jobs = await Promise.all(querySnapshot.docs.map(async (jobDoc) => {
                    const jobData = jobDoc.data();
                    let customerName = 'Unknown User';
                    let customerPhone = 'N/A';
                    let customerAddress = 'N/A';

                    if (jobData.customerRef) {
                        const cSnap = await getDoc(jobData.customerRef);
                        if (cSnap.exists()) {
                            const cData = cSnap.data();
                            customerName = cData.name;
                            customerPhone = cData.phone || 'N/A';
                            customerAddress = cData.address || 'N/A';
                        }
                    }

                    return {
                        id: jobDoc.id,
                        ...jobData,
                        customerName,
                        customerPhone,
                        customerAddress,
                        date: jobData.requestDate ? jobData.requestDate.toDate().toLocaleDateString() : 'N/A'
                    };
                }));

                setRequests(jobs.sort((a, b) => new Date(b.date) - new Date(a.date)));
            } catch (error) {
                console.error("Error fetching requests:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchRequests();
    }, [currentUser]);

    const handleUpdateStatus = async (jobId, newStatus) => {
        try {
            setActionLoading(jobId);

            const jobRef = doc(db, 'jobRequests', jobId);
            await updateDoc(jobRef, {
                status: newStatus
            });

            // Update local state directly to respond quickly
            setRequests(prev => prev.map(job =>
                job.id === jobId ? { ...job, status: newStatus } : job
            ));

            toast.success(`Job request ${newStatus}!`);
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
                                    <div className="flex items-center gap-3 mb-1">
                                        <h4 className="font-bold text-lg text-gray-900 dark:text-white">{job.customerName}</h4>
                                        <StatusBadge status={job.status} />
                                    </div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Requested: {job.date}</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 font-medium">Contact: {job.customerPhone}</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-300">Address: {job.customerAddress}</p>
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
                                    <div className="flex items-center gap-3 mb-1">
                                        <h4 className="font-bold text-lg text-gray-900 dark:text-white">{job.customerName}</h4>
                                        <span className="text-xs text-gray-500">{job.date}</span>
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 max-w-lg mb-2">
                                        Client is located at {job.customerAddress}. (Contact number will be revealed after accepting)
                                    </p>
                                    <StatusBadge status={job.status} />
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
