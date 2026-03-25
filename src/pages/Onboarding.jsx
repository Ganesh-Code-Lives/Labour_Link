import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { db } from '../firebase/config';
import { collection, getDocs, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import toast from 'react-hot-toast';
import { ClipboardList } from 'lucide-react';

const Onboarding = () => {
    const { currentUser } = useContext(AuthContext);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: currentUser?.displayName || '',
        phone: currentUser?.phoneNumber || '',
        address: '',
        role: 'customer',
        categoryId: '', 
        experience: 0,
        pricing: 0
    });

    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [fetchingCats, setFetchingCats] = useState(true);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, 'categories'));
                const catData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setCategories(catData);
            } catch (error) {
                console.warn('Could not load categories yet:', error);
            } finally {
                setFetchingCats(false);
            }
        };

        fetchCategories();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleComplete = async (e) => {
        e.preventDefault();

        if (formData.role === 'labourer' && !formData.categoryId) {
            toast.error('Please select a service category');
            return;
        }
        if (!formData.name || !formData.phone || !formData.address) {
            toast.error('Please fill in all personal details');
            return;
        }

        try {
            setIsLoading(true);
            
            // Create user document inside Firestore
            await setDoc(doc(db, 'users', currentUser.uid), {
                uid: currentUser.uid,
                email: currentUser.email,
                name: formData.name,
                role: formData.role,
                phone: formData.phone,
                address: formData.address,
                createdAt: serverTimestamp()
            });

            if (formData.role === 'labourer') {
                await setDoc(doc(db, 'labourers', currentUser.uid), {
                    userRef: doc(db, 'users', currentUser.uid),
                    categoryRef: doc(db, 'categories', formData.categoryId),
                    experience: Number(formData.experience) || 0,
                    pricing: Number(formData.pricing) || 0,
                    availabilityStatus: 'available',
                    ratingAvg: 0
                });
            }

            toast.success('Account setup complete!');
            navigate('/');
        } catch (error) {
            console.error("Onboarding Error: ", error);
            toast.error(error.message || 'Failed to complete setup');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4 py-12 transition-colors">
            <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-800">
                <div className="p-8">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-light/10 text-primary mb-4">
                            <ClipboardList className="w-8 h-8" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Complete Your Profile</h2>
                        <p className="text-gray-500 dark:text-gray-400 mt-2">Just a few more details needed!</p>
                    </div>

                    <form onSubmit={handleComplete} className="space-y-4">
                        <Input
                            id="name" name="name" type="text" label="Full Name"
                            value={formData.name} onChange={handleChange} placeholder="John Doe" required
                        />

                        <Input
                            id="phone" name="phone" type="tel" label="Phone Number"
                            value={formData.phone} onChange={handleChange} placeholder="123-456-7890" required
                        />

                        <Input
                            id="address" name="address" type="text" label="Home Address"
                            value={formData.address} onChange={handleChange} placeholder="Main St, City" required
                        />

                        {/* Role Selection */}
                        <div className="pt-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                I want to:
                            </label>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, role: 'customer' })}
                                    className={`p-3 border rounded-lg text-sm font-medium transition-colors ${formData.role === 'customer'
                                        ? 'bg-primary-light/10 border-primary text-primary dark:bg-primary/20'
                                        : 'border-gray-200 text-gray-500 hover:border-primary/50 dark:border-gray-700 dark:text-gray-400'
                                        }`}
                                >
                                    Hire Workers
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, role: 'labourer' })}
                                    className={`p-3 border rounded-lg text-sm font-medium transition-colors ${formData.role === 'labourer'
                                        ? 'bg-primary-light/10 border-primary text-primary dark:bg-primary/20'
                                        : 'border-gray-200 text-gray-500 hover:border-primary/50 dark:border-gray-700 dark:text-gray-400'
                                        }`}
                                >
                                    Find Work
                                </button>
                            </div>
                        </div>

                        {/* Labourer specifics */}
                        {formData.role === 'labourer' && (
                            <div className="pt-2 animate-fade-in space-y-4">
                                <div>
                                    <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Service Category <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        id="categoryId"
                                        name="categoryId"
                                        value={formData.categoryId}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
                                        required={formData.role === 'labourer'}
                                        disabled={fetchingCats}
                                    >
                                        <option value="" disabled>Select your primary skill</option>
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.categoryName}</option>
                                        ))}
                                    </select>
                                </div>
                                <Input
                                    id="experience" name="experience" type="number" label="Years of Experience"
                                    value={formData.experience} onChange={handleChange} placeholder="e.g. 5" min="0" required={formData.role === 'labourer'}
                                />
                                <Input
                                    id="pricing" name="pricing" type="number" label="Hourly Rate ($)"
                                    value={formData.pricing} onChange={handleChange} placeholder="e.g. 20" min="0" required={formData.role === 'labourer'}
                                />
                            </div>
                        )}

                        <div className="pt-4">
                            <Button type="submit" fullWidth isLoading={isLoading}>
                                Finish Setup
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Onboarding;
