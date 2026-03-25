import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { db } from '../../firebase/config';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { getCategories } from '../../firebase/services';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';
import { User, Settings, Loader2, Save, ToggleLeft, ToggleRight } from 'lucide-react';

const ProfileSettings = () => {
    const { currentUser } = useContext(AuthContext);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [categories, setCategories] = useState([]);
    const [userData, setUserData] = useState({ name: '', email: '', phone: '', address: '' });
    const [formData, setFormData] = useState({
        categoryId: '',
        experience: '',
        pricing: '',
        availabilityStatus: 'available'
    });

    useEffect(() => {
        const fetchProfile = async () => {
            if (!currentUser?.uid) return;
            try {
                setLoading(true);
                // Fetch categories
                const cats = await getCategories();
                setCategories(cats);

                // Fetch labourer doc & user doc
                const [labSnap, userSnap] = await Promise.all([
                    getDoc(doc(db, 'labourers', currentUser.uid)),
                    getDoc(doc(db, 'users', currentUser.uid))
                ]);

                if (userSnap.exists()) {
                    setUserData(userSnap.data());
                }

                if (labSnap.exists()) {
                    const data = labSnap.data();
                    setFormData({
                        categoryId: data.categoryRef?.id || '',
                        experience: data.experience || '',
                        pricing: data.pricing || '',
                        availabilityStatus: data.availabilityStatus || 'available'
                    });
                }
            } catch (error) {
                console.error("Error fetching profile:", error);
                toast.error("Failed to load profile data.");
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [currentUser]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!currentUser?.uid) return;

        // Validation
        if (!formData.categoryId || !formData.experience || !formData.pricing) {
            toast.error("Please fill all fields.");
            return;
        }

        try {
            setUpdating(true);
            const labRef = doc(db, 'labourers', currentUser.uid);
            
            await updateDoc(labRef, {
                categoryRef: doc(db, 'categories', formData.categoryId),
                experience: Number(formData.experience),
                pricing: Number(formData.pricing),
                availabilityStatus: formData.availabilityStatus
            });

            toast.success('Profile Updated Successfully');
        } catch (error) {
            console.error("Error updating profile:", error);
            toast.error('Update failed. Please try again.');
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
                <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <User className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Profile Settings</h2>
                        <p className="text-sm text-gray-500">Manage your professional information and availability.</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Basic Info (Read-only) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800">
                        <div className="space-y-1">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Full Name</p>
                            <p className="text-gray-900 dark:text-white font-medium">{userData.name || 'N/A'}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Email Address</p>
                            <p className="text-gray-900 dark:text-white font-medium">{userData.email || 'N/A'}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Phone Number</p>
                            <p className="text-gray-900 dark:text-white font-medium">{userData.phone || 'N/A'}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Address</p>
                            <p className="text-gray-900 dark:text-white font-medium">{userData.address || 'N/A'}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Category Selection */}
                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Professional Category
                            </label>
                            <select
                                value={formData.categoryId}
                                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
                                required
                            >
                                <option value="">Select Category</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.categoryName}</option>
                                ))}
                            </select>
                        </div>

                        {/* Availability Status (Toggle) */}
                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Current Availability
                            </label>
                            <button
                                type="button"
                                onClick={() => setFormData({ 
                                    ...formData, 
                                    availabilityStatus: formData.availabilityStatus === 'available' ? 'unavailable' : 'available' 
                                })}
                                className={`flex items-center justify-between w-full px-4 py-2 rounded-lg border transition-all ${
                                    formData.availabilityStatus === 'available'
                                        ? 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400'
                                        : 'bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400'
                                }`}
                            >
                                <span className="font-semibold capitalize">
                                    {formData.availabilityStatus}
                                </span>
                                {formData.availabilityStatus === 'available' ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
                            </button>
                        </div>

                        {/* Experience */}
                        <Input
                            id="experience"
                            label="Years of Experience"
                            type="number"
                            placeholder="e.g. 5"
                            value={formData.experience}
                            onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                            required
                        />

                        {/* Pricing */}
                        <Input
                            id="pricing"
                            label="Hourly Rate (₹)"
                            type="number"
                            placeholder="e.g. 500"
                            value={formData.pricing}
                            onChange={(e) => setFormData({ ...formData, pricing: e.target.value })}
                            required
                        />
                    </div>

                    <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                        <Button
                            type="submit"
                            fullWidth
                            isLoading={updating}
                            disabled={updating}
                            className="flex items-center justify-center gap-2"
                        >
                            <Save className="w-4 h-4" />
                            Update Profile
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProfileSettings;
