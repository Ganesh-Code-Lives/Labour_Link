import { db } from './config';
import { 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc,
  query, 
  where, 
  serverTimestamp,
  onSnapshot
} from 'firebase/firestore';

/**
 * HIRING MANAGER (formerly Customer) FUNCTIONS
 */

// Subscribe to live list of available students (formerly labourers)
export const subscribeToStudents = (callback) => {
  const q = collection(db, 'students');
  
  return onSnapshot(q, async (snapshot) => {
    const students = [];
    
    for (const docSnapshot of snapshot.docs) {
      const data = docSnapshot.data();
      
      // Filter available
      if (data.availabilityStatus !== 'available') continue;

      try {
        const [categoryDoc, userDoc] = await Promise.all([
          getDoc(data.categoryRef),
          getDoc(data.userRef)
        ]);

        if (categoryDoc.exists() && userDoc.exists()) {
          students.push({
            id: docSnapshot.id,
            ...data,
            category: categoryDoc.data(),
            user: userDoc.data()
          });
        }
      } catch (err) {
        console.error("Error joining student data:", err);
      }
    }
    callback(students);
  }, (error) => {
    console.error("Error subscribing to students:", error);
  });
};

// Alias kept for backward compatibility with SearchLabourer component
export const subscribeToLabourers = subscribeToStudents;

export const getStudents = async (categoryFilter = null) => {
  try {
    let q = collection(db, 'students');
    const snapshot = await getDocs(q);
    
    const students = [];
    for (const docSnapshot of snapshot.docs) {
      const data = docSnapshot.data();
      
      if (data.availabilityStatus !== 'available') continue;

      const categoryDoc = await getDoc(data.categoryRef);
      if (!categoryDoc.exists()) continue;
      const categoryData = categoryDoc.data();
      
      if (categoryFilter && categoryData.categoryName !== categoryFilter) continue;

      const userDoc = await getDoc(data.userRef);
      if (!userDoc.exists()) continue;

      students.push({
        id: docSnapshot.id,
        ...data,
        category: categoryData,
        user: userDoc.data()
      });
    }
    
    return students;
  } catch (error) {
    console.error("Error getting students:", error);
    throw error;
  }
};

// Alias kept for backward compatibility
export const getLabourers = getStudents;

/**
 * Send a job application (Hiring Manager requests a Student)
 * Maps to: applications collection (formerly jobRequests)
 */
export const sendJobRequest = async (hiringManagerId, studentId, jobDetails = {}) => {
  try {
    const applicationData = {
      customerRef: doc(db, 'users', hiringManagerId),
      labourerRef: doc(db, 'users', studentId),
      status: 'pending',
      reviewed: false,
      createdAt: serverTimestamp(),
      jobTitle: jobDetails.title || 'Short-Term Task',
      jobDescription: jobDetails.description || 'No description provided.',
      duration: jobDetails.duration || '1 day',
      payment: jobDetails.payment || jobDetails.location || '',
      serviceDate: jobDetails.date || '',
      serviceLocation: jobDetails.location || ''
    };
    
    const appRef = await addDoc(collection(db, 'applications'), applicationData);
    return appRef.id;
  } catch (error) {
    console.error("Error sending job application:", error);
    throw error;
  }
};

/**
 * Get all applications for a Hiring Manager (formerly customer)
 */
export const getCustomerRequests = async (hiringManagerId) => {
  try {
    const q = query(
      collection(db, 'applications'), 
      where('customerRef', '==', doc(db, 'users', hiringManagerId))
    );
    const snapshot = await getDocs(q);
    
    const applications = [];
    for (const docSnapshot of snapshot.docs) {
      const data = docSnapshot.data();
      
      const studentUserDoc = await getDoc(data.labourerRef);
      const studentQuery = query(collection(db, 'students'), where('userRef', '==', data.labourerRef));
      const studentSnapshot = await getDocs(studentQuery);
      
      let studentData = {};
      if (!studentSnapshot.empty) {
          studentData = studentSnapshot.docs[0].data();
      }

      applications.push({
        id: docSnapshot.id,
        ...data,
        labourer: studentUserDoc.exists() ? studentUserDoc.data() : null,
        labourerDetails: studentData
      });
    }
    
    return applications.sort((a, b) => {
      const timeA = a.createdAt?.toMillis() || 0;
      const timeB = b.createdAt?.toMillis() || 0;
      return timeB - timeA;
    });
  } catch (error) {
    console.error("Error getting hiring manager applications:", error);
    throw error;
  }
};

/**
 * Subscribe to live applications for a Hiring Manager
 */
export const subscribeToCustomerRequests = (hiringManagerId, callback) => {
  const q = query(
    collection(db, 'applications'), 
    where('customerRef', '==', doc(db, 'users', hiringManagerId))
  );

  return onSnapshot(q, async (snapshot) => {
    try {
      const fetchPromises = snapshot.docs.map(async (docSnapshot) => {
        const data = docSnapshot.data();
        
        const studentUserDoc = await getDoc(data.labourerRef);
        const studentQuery = query(collection(db, 'students'), where('userRef', '==', data.labourerRef));
        const studentSnapshot = await getDocs(studentQuery);
        
        let studentData = {};
        if (!studentSnapshot.empty) {
            studentData = studentSnapshot.docs[0].data();
        }

        return {
          id: docSnapshot.id,
          ...data,
          labourer: studentUserDoc.exists() ? studentUserDoc.data() : null,
          labourerDetails: studentData
        };
      });

      const resolvedApplications = await Promise.all(fetchPromises);
      
      resolvedApplications.sort((a, b) => {
        const timeA = a.createdAt?.toMillis() || 0;
        const timeB = b.createdAt?.toMillis() || 0;
        return timeB - timeA;
      });

      callback(resolvedApplications);
    } catch (error) {
      console.error("Error processing hiring manager applications snapshot:", error);
    }
  });
};

/**
 * STUDENT (formerly Labourer) FUNCTIONS
 */
export const getLabourerRequests = async (studentId) => {
  try {
    const q = query(
      collection(db, 'applications'), 
      where('labourerRef', '==', doc(db, 'users', studentId))
    );
    const snapshot = await getDocs(q);
    
    const applications = [];
    for (const docSnapshot of snapshot.docs) {
      const data = docSnapshot.data();
      
      const hiringManagerDoc = await getDoc(data.customerRef);
      applications.push({
        id: docSnapshot.id,
        ...data,
        customer: hiringManagerDoc.exists() ? hiringManagerDoc.data() : null
      });
    }
    
    return applications.sort((a, b) => {
      const timeA = a.createdAt?.toMillis() || 0;
      const timeB = b.createdAt?.toMillis() || 0;
      return timeB - timeA;
    });
  } catch (error) {
    console.error("Error getting student applications:", error);
    throw error;
  }
};

export const subscribeToLabourerRequests = (studentId, callback) => {
  const q = query(
    collection(db, 'applications'), 
    where('labourerRef', '==', doc(db, 'users', studentId))
  );

  return onSnapshot(q, async (snapshot) => {
    try {
      const fetchPromises = snapshot.docs.map(async (docSnapshot) => {
        const data = docSnapshot.data();
        const hiringManagerDoc = await getDoc(data.customerRef);
        
        return {
          id: docSnapshot.id,
          ...data,
          customer: hiringManagerDoc.exists() ? hiringManagerDoc.data() : null
        };
      });

      const resolvedApplications = await Promise.all(fetchPromises);
      
      resolvedApplications.sort((a, b) => {
        const timeA = a.createdAt?.toMillis() || 0;
        const timeB = b.createdAt?.toMillis() || 0;
        return timeB - timeA;
      });

      callback(resolvedApplications);
    } catch (error) {
      console.error("Error processing student applications snapshot:", error);
    }
  });
};

export const cancelJobRequest = async (applicationId) => {
  try {
    const appRef = doc(db, 'applications', applicationId);
    await deleteDoc(appRef);
  } catch (error) {
    console.error("Error cancelling application:", error);
    throw error;
  }
};

export const updateJobStatus = async (applicationId, newStatus) => {
  try {
    const appRef = doc(db, 'applications', applicationId);
    await updateDoc(appRef, {
      status: newStatus
    });
  } catch (error) {
    console.error(`Error updating application ${applicationId} to ${newStatus}:`, error);
    throw error;
  }
};

export const submitReview = async (applicationId, hiringManagerId, studentId, rating, comment) => {
  try {
    // 1. Create review
    const reviewData = {
      requestRef: doc(db, 'applications', applicationId),
      customerRef: doc(db, 'users', hiringManagerId),
      labourerRef: doc(db, 'users', studentId),
      rating: Number(rating),
      comment: comment || "",
      createdAt: serverTimestamp()
    };
    await addDoc(collection(db, 'reviews'), reviewData);

    // 2. Mark application as reviewed
    await updateDoc(doc(db, 'applications', applicationId), {
      reviewed: true
    });

    // 3. Update student rating
    const studentQuery = query(collection(db, 'students'), where('userRef', '==', doc(db, 'users', studentId)));
    const studentSnapshot = await getDocs(studentQuery);
    
    if (!studentSnapshot.empty) {
      const studentDoc = studentSnapshot.docs[0];
      const data = studentDoc.data();
      const oldAvg = data.ratingAvg || 0;
      const reviewCount = data.reviewCount || 0;
      
      const newAvg = ((oldAvg * reviewCount) + Number(rating)) / (reviewCount + 1);
      
      await updateDoc(studentDoc.ref, {
        ratingAvg: newAvg,
        reviewCount: reviewCount + 1
      });
    }
  } catch (error) {
    console.error("Error submitting review:", error);
    throw error;
  }
};

/**
 * ADMIN FUNCTIONS
 */
export const getCategories = async () => {
    try {
        const snapshot = await getDocs(collection(db, 'categories'));
        return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (error) {
        console.error("Error getting categories:", error);
        throw error;
    }
};

export const addCategory = async (categoryName) => {
    try {
        const docRef = await addDoc(collection(db, 'categories'), { categoryName });
        return docRef.id;
    } catch (error) {
        console.error("Error adding category:", error);
        throw error;
    }
};

export const deleteCategory = async (categoryId) => {
    try {
        await deleteDoc(doc(db, 'categories', categoryId));
    } catch(err) {
        console.error("Error deleting category:", err);
        throw err;
    }
}

export const getDashboardStats = async () => {
    try {
        const usersSnap = await getDocs(collection(db, 'users'));
        const studSnap = await getDocs(collection(db, 'students'));
        const appsSnap = await getDocs(collection(db, 'applications'));
        
        let applied = 0, accepted = 0, completed = 0, rejected = 0;
        appsSnap.forEach(doc => {
            const status = doc.data().status;
            if (status === 'applied' || status === 'pending') applied++;
            else if (status === 'accepted') accepted++;
            else if (status === 'completed') completed++;
            else if (status === 'rejected') rejected++;
        });

        const chartData = [
            { name: 'Applied', count: applied, fill: '#eab308' },
            { name: 'Accepted', count: accepted, fill: '#3b82f6' },
            { name: 'Completed', count: completed, fill: '#22c55e' },
            { name: 'Rejected', count: rejected, fill: '#ef4444' }
        ];

        return {
            totalUsers: usersSnap.empty ? 0 : usersSnap.size,
            totalLabourers: studSnap.empty ? 0 : studSnap.size,
            totalRequests: appsSnap.empty ? 0 : appsSnap.size,
            completedJobs: completed,
            chartData
        };
    } catch (error) {
        console.error("Error getting stats:", error);
        throw error;
    }
}

export const forceResetDatabase = async () => {
    try {
        console.log("Forcing database reset...");
        const cats = await getDocs(collection(db, 'categories'));
        for (const d of cats.docs) await deleteDoc(d.ref);

        const students = await getDocs(collection(db, 'students'));
        for (const d of students.docs) await deleteDoc(d.ref);

        const apps = await getDocs(collection(db, 'applications'));
        for (const d of apps.docs) await deleteDoc(d.ref);
        
        console.log("Old data wiped.");
        
        // Bypassing the catsRef check in seedDatabase since we just deleted them
        await seedDatabase(true); 
    } catch (error) {
        console.error("Reset error:", error);
        throw error;
    }
};

export const seedDatabase = async (force = false) => {
    try {
        const usersCollection = collection(db, 'users');
        const categoriesCollection = collection(db, 'categories');
        const studentsCollection = collection(db, 'students');

        // Check if categories already exist
        if (!force) {
            const catsRef = await getDocs(categoriesCollection);
            if (!catsRef.empty) {
                console.log("Database seems to be seeded already (categories exist). Skipping seeding.");
                return;
            }
        }

        console.log("Seeding database...");

        // 1. Add skill categories (student gig types)
        const catNames = ['Data Entry', 'Delivery', 'Event Helper', 'Content Writing', 'Customer Support'];
        const catRefs = [];
        for (const name of catNames) {
            const cRef = await addDoc(categoriesCollection, { categoryName: name });
            catRefs.push(cRef);
        }

        // 2. Add some users (Hiring Managers)
        const hiringManagerRefs = [];
        for (let i = 1; i <= 3; i++) {
            const uRef = await addDoc(usersCollection, {
                uid: `manager_uid_${i}`,
                name: `Hiring Manager ${i}`,
                email: `manager${i}@example.com`,
                role: 'customer',
                phone: `555-010${i}`,
                address: `Business Address Block ${i}`,
                createdAt: serverTimestamp()
            });
            hiringManagerRefs.push(uRef);
        }

        // 3. Add users (students) and link to students collection
        for (let i = 1; i <= 5; i++) {
            const uRef = await addDoc(usersCollection, {
                uid: `student_uid_${i}`,
                name: `Student ${i}`,
                email: `student${i}@example.com`,
                role: 'labourer',
                phone: `555-020${i}`,
                address: `Student Address path ${i}`,
                createdAt: serverTimestamp()
            });

            const randomCategoryRef = catRefs[Math.floor(Math.random() * catRefs.length)];
            
            await addDoc(studentsCollection, {
                uid: `student_uid_${i}`,
                userRef: uRef,
                categoryRef: randomCategoryRef,
                experience: `${Math.floor(Math.random() * 4) + 1} years`,
                pricing: `₹${Math.floor(Math.random() * 500) + 200}/day`,
                availabilityStatus: 'available',
                ratingAvg: Math.floor(Math.random() * 2) + 3,
                reviewCount: Math.floor(Math.random() * 10)
            });
        }
        
        console.log("Seeding complete!");

    } catch (error) {
        console.error("Error seeding database: ", error);
        throw error;
    }
};
