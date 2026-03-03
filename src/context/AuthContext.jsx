import React, { createContext, useState, useEffect } from 'react';
import { auth, db } from '../firebase/config';
import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, async (user) => {
            if (user) {
                try {
                    // Fetch custom user document metadata
                    const docRef = doc(db, 'users', user.uid);
                    const docSnap = await getDoc(docRef);

                    if (docSnap.exists()) {
                        setUserRole(docSnap.data().role);
                        setCurrentUser({ ...user, ...docSnap.data() });
                    } else {
                        setCurrentUser(user);
                    }
                } catch (error) {
                    console.error("Error fetching user role: ", error);
                    setCurrentUser(user);
                }
            } else {
                setCurrentUser(null);
                setUserRole(null);
            }
            setLoading(false);
        });

        return unsub;
    }, []);

    const login = (email, password) => {
        return signInWithEmailAndPassword(auth, email, password);
    };

    const signup = async (email, password, userData) => {
        const res = await createUserWithEmailAndPassword(auth, email, password);
        const user = res.user;

        // Save basic user info in `users` collection to store Role
        await setDoc(doc(db, 'users', user.uid), {
            uid: user.uid,
            email: user.email,
            name: userData.name,
            role: userData.role,
            phone: userData.phone || '',
            address: userData.address || '',
            createdAt: serverTimestamp()
        });

        // If role is labourer, initialize their profile in `labourers` collection
        if (userData.role === 'labourer') {
            await setDoc(doc(db, 'labourers', user.uid), {
                userRef: doc(db, 'users', user.uid),
                categoryRef: doc(db, 'categories', userData.categoryId), // Will need a default/selected category
                experience: userData.experience || 0,
                pricing: userData.pricing || 0,
                availabilityStatus: 'available',
                ratingAvg: 0
            });
        }

        return res;
    };

    const logout = () => {
        return signOut(auth);
    };

    const value = {
        currentUser,
        userRole,
        login,
        signup,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
