import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { getCategories } from '../firebase/services';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import toast from 'react-hot-toast';
import { Briefcase, GraduationCap, Shield, ArrowRight, ArrowLeft } from 'lucide-react';
import { getAuthErrorMessage } from '../utils/authErrors';

const ROLES = [
    {
        id: 'customer',
        icon: Briefcase,
        label: 'Hiring Manager',
        description: 'Post micro-tasks & hire students',
        gradient: 'from-blue-500 to-blue-700',
        bg: 'bg-blue-50 dark:bg-blue-950/40',
        border: 'border-blue-200 dark:border-blue-800',
        accent: 'text-blue-600 dark:text-blue-400',
    },
    {
        id: 'labourer',
        icon: GraduationCap,
        label: 'Student Worker',
        description: 'Browse gigs & earn on your schedule',
        gradient: 'from-amber-500 to-orange-600',
        bg: 'bg-amber-50 dark:bg-amber-950/40',
        border: 'border-amber-200 dark:border-amber-800',
        accent: 'text-amber-600 dark:text-amber-400',
    },
    {
        id: 'admin',
        icon: Shield,
        label: 'Admin',
        description: 'Manage the TaskEarn platform',
        gradient: 'from-purple-500 to-violet-700',
        bg: 'bg-purple-50 dark:bg-purple-950/40',
        border: 'border-purple-200 dark:border-purple-800',
        accent: 'text-purple-600 dark:text-purple-400',
    },
];

const GoogleIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        <path d="M1 1h22v22H1z" fill="none" />
    </svg>
);

export default function Register() {
    const [step, setStep] = useState('role');
    const [selectedRole, setSelectedRole] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    
    const [formData, setFormData] = useState({
        name: '', email: '', phone: '', address: '', password: '', 
        categoryId: '', experience: '', pricing: ''
    });

    const [categories, setCategories] = useState([]);
    const [fetchingCats, setFetchingCats] = useState(false);

    const { signup, signInWithGoogle, currentUser } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (currentUser) navigate('/dashboard');
    }, [currentUser, navigate]);

    useEffect(() => {
        if (selectedRole === 'labourer') {
            const fetchCats = async () => {
                setFetchingCats(true);
                try {
                    const cats = await getCategories();
                    setCategories(cats);
                } catch (error) {
                    console.error("Failed to fetch categories:", error);
                } finally {
                    setFetchingCats(false);
                }
            };
            fetchCats();
        }
    }, [selectedRole]);

    const activeRole = ROLES.find(r => r.id === selectedRole);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            setIsLoading(true);
            const dataToSave = { ...formData, role: selectedRole };
            await signup(formData.email, formData.password, dataToSave);
            toast.success('Registration successful!');
            navigate('/dashboard');
        } catch (error) {
            console.error("Registration Error: ", error);
            toast.error(getAuthErrorMessage(error));
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        try {
            setIsLoading(true);
            await signInWithGoogle();
            toast.success('Signed in with Google!');
            navigate('/dashboard');
        } catch (error) {
            console.error("Google Login Error: ", error);
            toast.error(getAuthErrorMessage(error));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4 py-12 transition-colors">
            
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-20 -right-40 w-80 h-80 bg-violet-500/10 rounded-full blur-3xl" />
            </div>

            <div className={`relative w-full ${step === 'form' ? 'max-w-4xl' : 'max-w-lg'}`}>
                {step === 'role' && (
                    <>
                        <div className="text-center mb-8">
                            <Link to="/" className="inline-flex items-center gap-2.5 text-2xl font-extrabold text-gray-900 dark:text-white">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-md">
                                    <Briefcase className="w-5 h-5 text-white" />
                                </div>
                                Task<span className="text-primary">Earn</span>
                            </Link>
                        </div>
                        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 p-8">
                            <div className="text-center mb-8">
                                <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Create an Account</h1>
                                <p className="text-gray-500 dark:text-gray-400 mt-2">How do you want to use TaskEarn?</p>
                            </div>
                            <div className="space-y-4">
                                {ROLES.map(role => {
                                    const Icon = role.icon;
                                    return (
                                        <button
                                            key={role.id}
                                            onClick={() => { setSelectedRole(role.id); setStep('form'); }}
                                            className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md group ${role.bg} ${role.border}`}
                                        >
                                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${role.gradient} flex items-center justify-center shadow-md flex-shrink-0`}>
                                                <Icon className="w-6 h-6 text-white" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className={`font-bold ${role.accent}`}>{role.label}</p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">{role.description}</p>
                                            </div>
                                            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
                                        </button>
                                    );
                                })}
                            </div>
                            <p className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
                                Already have an account?{' '}
                                <Link to="/login" className="font-semibold text-primary hover:text-primary-dark transition-colors">Sign in</Link>
                            </p>
                        </div>
                    </>
                )}

                {step === 'form' && activeRole && (
                    <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col md:flex-row">
                        
                        {/* Premium Left Sidebar / Branding */}
                        <div className={`hidden md:flex md:w-1/3 flex-col justify-between p-10 text-white bg-gradient-to-br ${activeRole.gradient} relative overflow-hidden`}>
                            <div className="absolute inset-0 bg-black/10 mix-blend-multiply" />
                            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
                            
                            <div className="relative z-10">
                                <button onClick={() => setStep('role')} className="flex items-center gap-1.5 text-white/80 hover:text-white text-sm font-medium mb-12 transition-colors">
                                    <ArrowLeft className="w-4 h-4" /> Change role
                                </button>
                                
                                <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-md shadow-inner mb-6 border border-white/20">
                                    <activeRole.icon className="w-8 h-8 text-white" />
                                </div>
                                <h1 className="text-3xl font-extrabold mb-2 leading-tight">Join as a<br/>{activeRole.label}</h1>
                                <p className="text-white/80 text-sm leading-relaxed">{activeRole.description}</p>
                            </div>
                            
                            <div className="relative z-10 text-sm text-white/60">
                                TaskEarn platform
                            </div>
                        </div>

                        {/* Mobile Header */}
                        <div className={`md:hidden p-6 text-white bg-gradient-to-r ${activeRole.gradient}`}>
                             <button onClick={() => setStep('role')} className="flex items-center gap-1.5 text-white/80 hover:text-white text-sm font-medium mb-4 transition-colors">
                                <ArrowLeft className="w-4 h-4" /> Back
                            </button>
                            <h1 className="text-xl font-bold">{activeRole.label} Registration</h1>
                        </div>

                        {/* Registration Form */}
                        <div className="flex-1 p-8 md:p-12">
                            <form onSubmit={handleRegister} className="space-y-6 max-w-lg mx-auto">
                                
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Create your account</h2>
                                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">Fill in the details below to get started.</p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <Input id="name" name="name" type="text" label="Full Name" value={formData.name} onChange={handleChange} placeholder="John Doe" required className="mb-0"/>
                                    <Input id="phone" name="phone" type="tel" label="Phone Number" value={formData.phone} onChange={handleChange} placeholder="123-456-7890" required className="mb-0"/>
                                </div>
                                
                                <Input id="email" name="email" type="email" label="Email Address" value={formData.email} onChange={handleChange} placeholder="you@example.com" required className="mb-0"/>
                                <Input id="password" name="password" type="password" label="Password" value={formData.password} onChange={handleChange} placeholder="••••••••" required className="mb-0"/>
                                
                                <Input id="address" name="address" type="text" label="Location / Campus" value={formData.address} onChange={handleChange} placeholder="e.g. Mumbai University" required className="mb-0"/>

                                {selectedRole === 'labourer' && (
                                    <div className="p-5 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900 rounded-xl space-y-4">
                                        <h3 className="font-semibold text-amber-900 dark:text-amber-400 text-sm flex items-center gap-2">
                                            <GraduationCap className="w-4 h-4" /> Gig Preferences
                                        </h3>
                                        <div>
                                            <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Primary Skill
                                            </label>
                                            <select
                                                id="categoryId" name="categoryId" value={formData.categoryId} onChange={handleChange}
                                                className="w-full px-4 py-2.5 border border-amber-200 dark:border-gray-700 rounded-lg shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
                                                required disabled={fetchingCats}
                                            >
                                                <option value="" disabled>Select your primary skill</option>
                                                {categories.map(cat => (
                                                    <option key={cat.id} value={cat.id}>{cat.categoryName}</option>
                                                ))}
                                                {categories.length === 0 && <option value="placeholder_dataentry">Data Entry (Placeholder)</option>}
                                            </select>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <Input id="experience" name="experience" type="number" label="Experience (Yrs)" value={formData.experience} onChange={handleChange} placeholder="0" min="0" required className="mb-0"/>
                                            <Input id="pricing" name="pricing" type="number" label="Expected Hourly Pay (₹)" value={formData.pricing} onChange={handleChange} placeholder="200" min="0" required className="mb-0"/>
                                        </div>
                                    </div>
                                )}

                                <Button type="submit" fullWidth isLoading={isLoading} className="mt-2 text-lg">Complete Registration</Button>
                                
                                <div className="flex items-center gap-4">
                                    <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800" />
                                    <span className="text-xs text-gray-400 font-medium">OR CONTINUE WITH</span>
                                    <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800" />
                                </div>

                                <Button type="button" variant="outline" fullWidth onClick={handleGoogleLogin} isLoading={isLoading} className="flex justify-center items-center gap-2">
                                    <GoogleIcon /> Google
                                </Button>

                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
