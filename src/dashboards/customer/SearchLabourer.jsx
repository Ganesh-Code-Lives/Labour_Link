import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { db } from '../../firebase/config';
import { subscribeToLabourers, getCategories, sendJobRequest } from '../../firebase/services';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';
import { Search, Star, Loader2, MapPin, X } from 'lucide-react';

const SearchLabourer = () => {
    const { currentUser } = useContext(AuthContext);
    const [labourers, setLabourers] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCat, setSelectedCat] = useState('');
    const [requestingId, setRequestingId] = useState(null);
    const [selectedLabourer, setSelectedLabourer] = useState(null);
    const [jobDetails, setJobDetails] = useState({ title: '', description: '', date: '', location: '' });

    useEffect(() => {
        let unsubscribeLabs = () => {};

        const fetchData = async () => {
            try {
                setLoading(true);
                const cats = await getCategories();
                setCategories(cats);

                // Start subscription
                unsubscribeLabs = subscribeToLabourers((labs) => {
                    setLabourers(labs);
                    setLoading(false);
                });
            } catch (error) {
                console.error("Error setting up data:", error);
                toast.error("Failed to load data.");
                setLoading(false);
            }
        };

        fetchData();
        return () => unsubscribeLabs();
    }, []);

    const handleOpenModal = (lab) => {
        setSelectedLabourer(lab);
        setJobDetails({ title: '', description: '', date: '', location: currentUser?.address || '' });
    };

    const handleCloseModal = () => {
        setSelectedLabourer(null);
        setJobDetails({ title: '', description: '', date: '', location: '' });
    };

    const handleRequestSubmit = async (e) => {
        e.preventDefault();
        if (!currentUser?.uid || !selectedLabourer) return;

        try {
            setRequestingId(selectedLabourer.id);
            await sendJobRequest(currentUser.uid, selectedLabourer.id, jobDetails);
            toast.success('Job request sent successfully!');
            handleCloseModal();
        } catch (error) {
            toast.error('Failed to send request');
            console.error(error);
        } finally {
            setRequestingId(null);
        }
    };

    const filteredLabourers = labourers.filter(l => {
        const matchesSearch = l.user?.name?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCat = selectedCat ? l.categoryRef?.id === selectedCat : true;
        const isAvailable = l.availabilityStatus === 'available'; // Only show available
        return matchesSearch && matchesCat && isAvailable;
    });

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Search Header */}
            <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1 w-full">
                    <Input
                        id="search"
                        placeholder="Search professionals by name..."
                        label="Search"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="mb-0"
                    />
                </div>

                <div className="w-full md:w-64">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Filter by Category
                    </label>
                    <select
                        value={selectedCat}
                        onChange={(e) => setSelectedCat(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
                    >
                        <option value="">All Categories</option>
                        {categories.map(c => (
                            <option key={c.id} value={c.id}>{c.categoryName}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Results Grid */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="w-10 h-10 animate-spin text-primary" />
                </div>
            ) : filteredLabourers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredLabourers.map(lab => (
                        <div key={lab.id} className="bg-white dark:bg-gray-900 rounded-xl overflow-hidden shadow-sm hover:shadow-md border border-gray-200 dark:border-gray-800 transition-all">
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">{lab.user?.name || 'Unknown'}</h3>
                                        <p className="text-primary font-medium text-sm">{lab.category?.categoryName || 'Uncategorized'}</p>
                                    </div>
                                    <div className="flex items-center bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-500 px-2 py-1 rounded-md text-sm font-semibold border border-yellow-200 dark:border-yellow-800/50">
                                        <Star className="w-3.5 h-3.5 fill-current mr-1" />
                                        {lab.ratingAvg > 0 ? lab.ratingAvg.toFixed(1) : 'New'}
                                    </div>
                                </div>

                                <div className="space-y-2 mb-6">
                                    <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm">
                                        <MapPin className="w-4 h-4 mr-2" />
                                        {lab.user?.address || 'Not specified'}
                                    </div>
                                    <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm">
                                        <span className="w-4 h-4 font-bold text-center mr-2">₹</span>
                                        {lab.pricing || '0'}/hr
                                    </div>
                                    <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm">
                                        <span className="w-4 h-4 text-center mr-2">⏱</span>
                                        {lab.experience || '0'} Yrs Exp
                                    </div>
                                </div>

                                <Button
                                    fullWidth
                                    onClick={() => handleOpenModal(lab)}
                                    isLoading={requestingId === lab.id}
                                    disabled={requestingId !== null && requestingId !== lab.id}
                                >
                                    Send Request
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Search className="w-8 h-8 text-gray-400" />
                    </div>
                    <h4 className="text-gray-900 dark:text-white font-medium">No professionals found</h4>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Try adjusting your filters or search term.</p>
                </div>
            )}

            {/* Modal */}
            {selectedLabourer && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fade-in">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-800">
                        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Request to {selectedLabourer.user?.name}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{selectedLabourer.category?.categoryName || 'Service'}</p>
                            </div>
                            <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <form onSubmit={handleRequestSubmit} className="p-6 space-y-4">
                            <Input
                                id="title" required
                                label="Job Title" placeholder="e.g. Broken Pipe Repair"
                                value={jobDetails.title} onChange={e => setJobDetails({...jobDetails, title: e.target.value})}
                                className="mb-0"
                            />
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Description
                                </label>
                                <textarea
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary transition-colors resize-none"
                                    rows="3" required placeholder="Describe what you need..."
                                    value={jobDetails.description} onChange={e => setJobDetails({...jobDetails, description: e.target.value})}
                                />
                            </div>
                            <Input
                                id="date" required type="date"
                                label="Requested Date"
                                value={jobDetails.date} onChange={e => setJobDetails({...jobDetails, date: e.target.value})}
                                className="mb-0"
                            />
                            <Input
                                id="location" required
                                label="Location / Address" placeholder="123 Main St"
                                value={jobDetails.location} onChange={e => setJobDetails({...jobDetails, location: e.target.value})}
                                className="mb-0"
                            />
                            <div className="pt-4 flex gap-3">
                                <Button type="button" variant="outline" className="flex-1" onClick={handleCloseModal}>Cancel</Button>
                                <Button type="submit" className="flex-1" isLoading={requestingId === selectedLabourer.id}>Confirm Request</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SearchLabourer;
