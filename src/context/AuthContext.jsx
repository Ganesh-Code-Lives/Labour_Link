import React, { createContext, useState, useEffect } from 'react';
import { auth, db, googleProvider } from '../firebase/config';
import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    signInWithPopup
} from 'firebase/auth';
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';
import FullPageLoader from '../components/ui/FullPageLoader';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    // undefined = Firebase hasn't responded yet
    // null     = confirmed logged out
    // object   = confirmed logged in user
    const [currentUser, setCurrentUser] = useState(undefined);
    const [userRole, setUserRole] = useState(null);

    useEffect(() => {
        let unsubscribeSnapshot = null;

        const unsubAuth = onAuthStateChanged(auth, (user) => {
            if (user) {
                const docRef = doc(db, 'users', user.uid);
                
                unsubscribeSnapshot = onSnapshot(docRef, (docSnap) => {
                    if (docSnap.exists()) {
                        setUserRole(docSnap.data().role);
                        setCurrentUser({ ...user, ...docSnap.data() });
                    } else {
                        setUserRole('pending'); // User signed in, but doc not written yet
                        setCurrentUser(user);
                    }
                }, (error) => {
                    console.error('Error fetching user role: ', error);
                    setUserRole(null);
                    setCurrentUser(user);
                });
            } else {
                if (unsubscribeSnapshot) unsubscribeSnapshot();
                setCurrentUser(null);
                setUserRole(null);
            }
        });

        return () => {
            unsubAuth();
            if (unsubscribeSnapshot) unsubscribeSnapshot();
        };
    }, []);

    const login = (email, password) => {
        return signInWithEmailAndPassword(auth, email, password);
    };

    const signup = async (email, password, userData) => {
        const res = await createUserWithEmailAndPassword(auth, email, password);
        const user = res.user;

        await setDoc(doc(db, 'users', user.uid), {
            uid: user.uid,
            email: user.email,
            name: userData.name,
            role: userData.role,
            phone: userData.phone || '',
            address: userData.address || '',
            createdAt: serverTimestamp()
        });

        if (userData.role === 'labourer') {
            await setDoc(doc(db, 'labourers', user.uid), {
                userRef: doc(db, 'users', user.uid),
                categoryRef: doc(db, 'categories', userData.categoryId),
                experience: Number(userData.experience) || 0,
                pricing: Number(userData.pricing) || 0,
                availabilityStatus: 'available',
                ratingAvg: 0
            });
        }

        return res;
    };

    const logout = () => {
        return signOut(auth);
    };

    const signInWithGoogle = () => {
        return signInWithPopup(auth, googleProvider);
    };

    const loading = currentUser === undefined;

    const value = {
        currentUser,
        userRole,
        loading,
        login,
        signup,
        signInWithGoogle,
        logout
    };

    // Show a stable full-page loader ONLY during the initial Firebase auth check.
    // Once resolved (loading = false), children are always rendered — no flicker.
    if (loading) {
        return <FullPageLoader message="Loading LabourLink..." />;
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
