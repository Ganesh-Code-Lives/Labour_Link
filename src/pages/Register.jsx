import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { db } from '../firebase/config';
import { collection, getDocs } from 'firebase/firestore';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import toast from 'react-hot-toast';
import { UserPlus } from 'lucide-react';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        role: 'customer',
        categoryId: '', // Specific to labourer
    });

    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [fetchingCats, setFetchingCats] = useState(true);

    const { signup, currentUser } = useContext(AuthContext);
    const navigate = useNavigate();

    // Redirect if already logged in
    React.useEffect(() => {
        if (currentUser) {
            navigate('/');
        }
    }, [currentUser, navigate]);

    useEffect(() => {
        // Fetch categories for Labourer registration dropdown
        const fetchCategories = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, 'categories'));
                const catData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setCategories(catData);
            } catch (error) {
                // Will throw until Firestore runs
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

    const handleRegister = async (e) => {
        e.preventDefault();

        if (formData.role === 'labourer' && !formData.categoryId) {
            toast.error('Please select a service category');
            return;
        }

        try {
            setIsLoading(true);
            await signup(formData.email, formData.password, formData);
            toast.success('Registration successful!');
            navigate('/');
        } catch (error) {
            console.error("Registration Error: ", error);
            toast.error(error.message || 'Failed to register');
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
                            <UserPlus className="w-8 h-8" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Create an Account</h2>
                        <p className="text-gray-500 dark:text-gray-400 mt-2">Join LabourLink today</p>
                    </div>

                    <form onSubmit={handleRegister} className="space-y-4">
                        <Input
                            id="name" name="name" type="text" label="Full Name"
                            value={formData.name} onChange={handleChange} placeholder="John Doe" required
                        />

                        <Input
                            id="email" name="email" type="email" label="Email Address"
                            value={formData.email} onChange={handleChange} placeholder="you@example.com" required
                        />

                        <Input
                            id="phone" name="phone" type="tel" label="Phone Number"
                            value={formData.phone} onChange={handleChange} placeholder="123-456-7890" required
                        />

                        <Input
                            id="password" name="password" type="password" label="Password"
                            value={formData.password} onChange={handleChange} placeholder="••••••••" required
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
                            <div className="pt-2 animate-fade-in">
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
                                    {categories.length > 0 ? (
                                        categories.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.categoryName}</option>
                                        ))
                                    ) : (
                                        <option value="placeholder_plumber">Plumber (Placeholder)</option>
                                    )}
                                    {categories.length === 0 && <option value="placeholder_electrician">Electrician (Placeholder)</option>}
                                    {categories.length === 0 && <option value="placeholder_painter">Painter (Placeholder)</option>}
                                </select>
                            </div>
                        )}

                        <div className="pt-4">
                            <Button type="submit" fullWidth isLoading={isLoading}>
                                Create Account
                            </Button>
                        </div>
                    </form>

                    <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
                        Already have an account?{' '}
                        <Link to="/login" className="font-medium text-primary hover:text-primary-dark transition-colors">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
