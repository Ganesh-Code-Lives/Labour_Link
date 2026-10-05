import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Briefcase, Users, Star, Shield, Zap, CheckCircle,
    ArrowRight, Search, ClipboardList, Award,
    TrendingUp, MapPin, Clock, Menu, X, Moon, Sun, GraduationCap
} from 'lucide-react';
import { useDarkMode } from '../hooks/useDarkMode';



const FeatureCard = ({ icon: Icon, title, description, delay = 0, color }) => (
    <div
        className="group relative bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 hover:border-primary/30 dark:hover:border-primary/40 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1 overflow-hidden"
        style={{ animationDelay: `${delay}ms` }}
    >
        <div className={`absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-500 rounded-2xl bg-gradient-to-br ${color}`} />
        <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4 bg-gradient-to-br ${color} text-white shadow-lg`}>
            <Icon className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{description}</p>
    </div>
);

const StepCard = ({ number, title, description, icon: Icon, colorTheme = 'primary' }) => {
    const bgGradient = colorTheme === 'primary' 
        ? 'from-blue-500 to-blue-700 shadow-blue-500/30' 
        : 'from-violet-500 to-violet-700 shadow-violet-500/30';
    const badgeBg = colorTheme === 'primary' ? 'bg-blue-600' : 'bg-violet-600';

    return (
        <div className="relative flex flex-col items-center text-center group">
            <div className="relative mb-6">
                <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${bgGradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-9 h-9 text-white" />
                </div>
                <div className={`absolute -top-2 -right-2 w-7 h-7 rounded-full ${badgeBg} text-white text-xs font-bold flex items-center justify-center shadow-md`}>
                    {number}
                </div>
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed max-w-xs">{description}</p>
        </div>
    );
};



const LandingPage = () => {
    const { theme, toggleTheme } = useDarkMode();
    const [menuOpen, setMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 overflow-x-hidden">
            <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/90 dark:bg-gray-950/90 backdrop-blur-xl border-b border-gray-200/60 dark:border-gray-800/60 shadow-sm' : 'bg-transparent'}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-md">
                                <Briefcase className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-extrabold tracking-tight">
                                Task<span className="text-primary">Earn</span>
                            </span>
                        </div>
                        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600 dark:text-gray-400">
                            <a href="#features" className="hover:text-primary transition-colors">Features</a>
                            <a href="#how-it-works" className="hover:text-primary transition-colors">How It Works</a>
                        </div>
                        <div className="hidden md:flex items-center gap-3">
                            <button onClick={toggleTheme} className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors">
                                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                            </button>
                            <Link to="/login" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary transition-colors px-3 py-2">
                                Sign In
                            </Link>
                            <Link to="/register" className="bg-primary hover:bg-primary-dark text-white text-sm font-semibold px-5 py-2 rounded-xl shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all duration-200 hover:-translate-y-0.5">
                                Get Started
                            </Link>
                        </div>
                        <div className="flex md:hidden items-center gap-2">
                            <button onClick={toggleTheme} className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors">
                                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                            </button>
                            <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                                {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>
                </div>
                {menuOpen && (
                    <div className="md:hidden bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-4 space-y-3">
                        <a href="#features" onClick={() => setMenuOpen(false)} className="block text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary py-2">Features</a>
                        <a href="#how-it-works" onClick={() => setMenuOpen(false)} className="block text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary py-2">How It Works</a>
                        <div className="pt-2 flex flex-col gap-2">
                            <Link to="/login" className="text-center text-sm font-medium border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">Sign In</Link>
                            <Link to="/register" className="text-center bg-primary hover:bg-primary-dark text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors">Get Started</Link>
                        </div>
                    </div>
                )}
            </nav>

            <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
                
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
                    <div className="absolute -bottom-20 -right-40 w-96 h-96 bg-violet-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-400/5 rounded-full blur-3xl" />
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-24">
                    <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-semibold px-4 py-1.5 rounded-full border border-blue-200 dark:border-blue-800/50 mb-8">
                        <Zap className="w-4 h-4" />
                        <span>The Ultimate Student Gig Platform</span>
                    </div>

                    <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 leading-[1.1]">
                        Hire talented students for <br className="hidden sm:block" />
                        <span className="bg-gradient-to-r from-blue-600 via-violet-500 to-primary bg-clip-text text-transparent">
                            short-term micro tasks
                        </span>
                    </h1>

                    <p className="text-xl md:text-2xl text-gray-500 dark:text-gray-400 max-w-3xl mx-auto mb-10 leading-relaxed">
                        TaskEarn connects local businesses and individuals with energetic college students.
                        Get help with data entry, deliveries, events, social media, and more.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
                        <Link
                            to="/register"
                            className="group inline-flex items-center gap-2.5 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white text-lg font-bold px-8 py-4 rounded-2xl shadow-xl shadow-blue-500/30 hover:shadow-2xl hover:shadow-violet-500/40 transition-all duration-300 hover:-translate-y-1"
                        >
                            Post a Task Free
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link
                            to="/register"
                            className="inline-flex items-center gap-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-lg font-semibold px-8 py-4 rounded-2xl shadow-sm hover:shadow-md hover:border-violet-500/30 dark:hover:border-violet-500/40 transition-all duration-300 hover:-translate-y-0.5"
                        >
                            <GraduationCap className="w-5 h-5 text-violet-500" />
                            Earn as a Student
                        </Link>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500 dark:text-gray-400">
                        {[
                            { icon: Shield, text: 'Verified College IDs' },
                            { icon: Clock, text: 'Flexible Hours' },
                            { icon: MapPin, text: 'Local & Remote Gigs' },
                            { icon: Star, text: 'Rating System' },
                        ].map(({ icon: Icon, text }) => (
                            <div key={text} className="flex items-center gap-1.5">
                                <Icon className="w-4 h-4 text-primary" />
                                <span>{text}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>



            <section id="features" className="py-24 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <span className="text-violet-500 font-semibold text-sm tracking-wider uppercase">Why TaskEarn</span>
                        <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mt-3 mb-4">
                            The smartest way to get things done
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 text-lg max-w-2xl mx-auto">
                            Whether you need an extra pair of hands for an event, or someone to manage your spreadsheets.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                            { icon: Search, title: 'Smart Search & Filters', description: 'Find students by skill, location, availability, and hourly rate — with real-time results.', color: 'from-blue-500 to-blue-700', delay: 0 },
                            { icon: Shield, title: 'Verified Student Profiles', description: 'Every student profile is reviewed for authenticity, ensuring a safe and reliable workforce.', color: 'from-green-500 to-emerald-700', delay: 50 },
                            { icon: Star, title: 'Review & Rating System', description: 'Transparent two-way reviews help you hire confidently and students build trust.', color: 'from-amber-500 to-orange-600', delay: 100 },
                            { icon: Zap, title: 'Instant Task Matching', description: 'Our smart matching engine connects you to the right student for your gig in real-time.', color: 'from-purple-500 to-violet-700', delay: 150 },
                            { icon: TrendingUp, title: 'Employer Dashboard', description: 'Track applications, active tasks, and performance metrics all from one clean dashboard.', color: 'from-pink-500 to-rose-600', delay: 200 },
                            { icon: Award, title: 'Earn & Grow', description: 'Students earn money, build a strong resume, and grow their reputation for future jobs.', color: 'from-teal-500 to-cyan-700', delay: 250 },
                        ].map((feat) => (
                            <FeatureCard key={feat.title} {...feat} />
                        ))}
                    </div>
                </div>
            </section>

            <section id="how-it-works" className="py-24 bg-white dark:bg-gray-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <span className="text-primary font-semibold text-sm tracking-wider uppercase">Simple Process</span>
                        <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mt-3 mb-4">
                            Get started in 3 easy steps
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 text-lg max-w-2xl mx-auto">
                            Built from the ground up for quick turnarounds and zero friction.
                        </p>
                    </div>

                    <div className="mb-20">
                        <h3 className="text-center text-2xl font-bold text-gray-800 dark:text-gray-200 mb-12 flex items-center justify-center gap-3">
                            <Briefcase className="w-6 h-6 text-blue-500" /> If you are an Employer
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative">
                            <div className="hidden md:block absolute top-10 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-blue-500/20 via-blue-500 to-blue-500/20" />
                            <StepCard colorTheme="primary" number="1" icon={Users} title="Create Your Account" description="Sign up as an Employer in under 2 minutes using your email or Google." />
                            <StepCard colorTheme="primary" number="2" icon={Search} title="Browse Students" description="Search for talented students by skill category, location, and hourly rate." />
                            <StepCard colorTheme="primary" number="3" icon={CheckCircle} title="Hire & Review" description="Send a task request, get the job done, and leave a review to build their profile." />
                        </div>
                    </div>

                    <div>
                        <h3 className="text-center text-2xl font-bold text-gray-800 dark:text-gray-200 mb-12 flex items-center justify-center gap-3">
                            <GraduationCap className="w-6 h-6 text-violet-500" /> If you are a Student
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative">
                            <div className="hidden md:block absolute top-10 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-violet-500/20 via-violet-500 to-violet-500/20" />
                            <StepCard colorTheme="violet" number="1" icon={ClipboardList} title="Register Your Skills" description="Create a profile showcasing your skills, college, and expected hourly pay." />
                            <StepCard colorTheme="violet" number="2" icon={Award} title="Get Discovered" description="Get found by employers looking for extra help with micro-tasks in your area." />
                            <StepCard colorTheme="violet" number="3" icon={TrendingUp} title="Earn Money" description="Complete gigs around your class schedule, get paid, and collect reviews." />
                        </div>
                    </div>
                </div>
            </section>



            <section className="py-24 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    <div className="relative bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 rounded-3xl p-12 text-center overflow-hidden shadow-2xl shadow-blue-500/30">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
                        <div className="relative">
                            <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
                                Ready to join TaskEarn?
                            </h2>
                            <p className="text-blue-100 text-lg mb-10 max-w-2xl mx-auto">
                                Join thousands of employers and students. It's free to create an account and takes less than 2 minutes.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link
                                    to="/register"
                                    className="group inline-flex items-center justify-center gap-2.5 bg-white text-blue-600 font-bold text-lg px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl hover:bg-gray-50 transition-all duration-300 hover:-translate-y-1"
                                >
                                    Get Started Free
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </Link>
                                <Link
                                    to="/login"
                                    className="inline-flex items-center justify-center gap-2 border-2 border-white/40 text-white font-semibold text-lg px-8 py-4 rounded-2xl hover:bg-white/10 transition-all duration-300 hover:-translate-y-0.5"
                                >
                                    Sign In
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center">
                                <Briefcase className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-lg font-extrabold">Task<span className="text-primary">Earn</span></span>
                        </div>
                        <p className="text-sm text-gray-400 text-center">
                            © {new Date().getFullYear()} TaskEarn. Built with ❤️ for college students.
                        </p>
                        <div className="flex gap-6 text-sm text-gray-500 dark:text-gray-400">
                            <Link to="/login" className="hover:text-primary transition-colors">Sign In</Link>
                            <Link to="/register" className="hover:text-primary transition-colors">Register</Link>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
