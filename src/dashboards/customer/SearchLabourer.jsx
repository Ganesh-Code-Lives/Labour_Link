import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { db } from '../../firebase/config';
import { collection, getDocs, doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';
import { Search, Star, Loader2, MapPin } from 'lucide-react';

const SearchLabourer = () => {
    const { currentUser } = useContext(AuthContext);
    const [labourers, setLabourers] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCat, setSelectedCat] = useState('');
    const [requestingId, setRequestingId] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // Fetch Categories
                const catSnap = await getDocs(collection(db, 'categories'));
                const cats = catSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setCategories(cats);

                // Fetch Labourers
                const labSnap = await getDocs(collection(db, 'labourers'));
                const labs = await Promise.all(labSnap.docs.map(async (labDoc) => {
                    const lData = labDoc.data();
                    let name = 'Unknown';
                    let location = 'Unknown';
                    let catName = 'Uncategorized';
                    let catId = '';

                    if (lData.userRef) {
                        const uSnap = await getDoc(lData.userRef);
                        if (uSnap.exists()) {
                            name = uSnap.data().name;
                            location = uSnap.data().address || 'Not specified';
                        }
                    }

                    if (lData.categoryRef) {
                        const cSnap = await getDoc(lData.categoryRef);
                        if (cSnap.exists()) {
                            catName = cSnap.data().categoryName;
                            catId = cSnap.id;
                        }
                    }

                    return {
                        id: labDoc.id,
                        ...lData,
                        name,
                        location,
                        catName,
                        categoryId: catId
                    };
                }));

                setLabourers(labs);
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleRequest = async (labourerId) => {
        if (!currentUser?.uid) return;

        try {
            setRequestingId(labourerId);

            const newRequestId = doc(collection(db, 'jobRequests')).id; // Generate unique ID

            await setDoc(doc(db, 'jobRequests', newRequestId), {
                customerRef: doc(db, 'users', currentUser.uid),
                labourerRef: doc(db, 'labourers', labourerId), // ER diagram Reference
                requestDate: serverTimestamp(),
                status: 'pending',
                reviewed: false
            });

            toast.success('Job request sent successfully!');
        } catch (error) {
            toast.error('Failed to send request');
            console.error(error);
        } finally {
            setRequestingId(null);
        }
    };

    const filteredLabourers = labourers.filter(l => {
        const matchesSearch = l.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCat = selectedCat ? l.categoryId === selectedCat : true;
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
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">{lab.name}</h3>
                                        <p className="text-primary font-medium text-sm">{lab.catName}</p>
                                    </div>
                                    <div className="flex items-center bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-500 px-2 py-1 rounded-md text-sm font-semibold border border-yellow-200 dark:border-yellow-800/50">
                                        <Star className="w-3.5 h-3.5 fill-current mr-1" />
                                        {lab.ratingAvg > 0 ? lab.ratingAvg.toFixed(1) : 'New'}
                                    </div>
                                </div>

                                <div className="space-y-2 mb-6">
                                    <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm">
                                        <MapPin className="w-4 h-4 mr-2" />
                                        {lab.location}
                                    </div>
                                    <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm">
                                        <span className="w-4 h-4 font-bold text-center mr-2">₹</span>
                                        {lab.pricing}/hr
                                    </div>
                                    <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm">
                                        <span className="w-4 h-4 text-center mr-2">⏱</span>
                                        {lab.experience} Yrs Exp
                                    </div>
                                </div>

                                <Button
                                    fullWidth
                                    onClick={() => handleRequest(lab.id)}
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
        </div>
    );
};

export default SearchLabourer;
