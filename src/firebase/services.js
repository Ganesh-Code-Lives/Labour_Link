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
 * CUSTOMER FUNCTIONS
 */
export const subscribeToLabourers = (callback) => {
  const q = collection(db, 'labourers');
  
  return onSnapshot(q, async (snapshot) => {
    const labourers = [];
    
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
          labourers.push({
            id: docSnapshot.id,
            ...data,
            category: categoryDoc.data(),
            user: userDoc.data()
          });
        }
      } catch (err) {
        console.error("Error joining labourer data:", err);
      }
    }
    callback(labourers);
  }, (error) => {
    console.error("Error subscribing to labourers:", error);
  });
};

export const getLabourers = async (categoryFilter = null) => {
  try {
    let q = collection(db, 'labourers');
    const snapshot = await getDocs(q);
    
    // We need to fetch the associated user details and category details
    const labourers = [];
    for (const docSnapshot of snapshot.docs) {
      const data = docSnapshot.data();
      
      // Filter out unavailable labourers based on the requirement
      if (data.availabilityStatus !== 'available') continue;

      // Handle category filtering
      const categoryDoc = await getDoc(data.categoryRef);
      if (!categoryDoc.exists()) continue;
      const categoryData = categoryDoc.data();
      
      if (categoryFilter && categoryData.categoryName !== categoryFilter) continue;

      const userDoc = await getDoc(data.userRef);
      if (!userDoc.exists()) continue;

      labourers.push({
        id: docSnapshot.id,
        ...data,
        category: categoryData,
        user: userDoc.data()
      });
    }
    
    return labourers;
  } catch (error) {
    console.error("Error getting labourers:", error);
    throw error;
  }
};

export const sendJobRequest = async (customerId, labourerId, jobDetails = {}) => {
  try {
    const requestData = {
      customerRef: doc(db, 'users', customerId),
      labourerRef: doc(db, 'users', labourerId),
      status: 'pending',
      reviewed: false,
      createdAt: serverTimestamp(),
      jobTitle: jobDetails.title || 'General Service Request',
      jobDescription: jobDetails.description || 'No description provided.',
      serviceDate: jobDetails.date || '',
      serviceLocation: jobDetails.location || ''
    };
    
    const requestRef = await addDoc(collection(db, 'jobRequests'), requestData);
    return requestRef.id;
  } catch (error) {
    console.error("Error sending job request:", error);
    throw error;
  }
};

export const getCustomerRequests = async (customerId) => {
  try {
    const q = query(
      collection(db, 'jobRequests'), 
      where('customerRef', '==', doc(db, 'users', customerId))
    );
    const snapshot = await getDocs(q);
    
    const requests = [];
    for (const docSnapshot of snapshot.docs) {
      const data = docSnapshot.data();
      
      const labourerUserDoc = await getDoc(data.labourerRef);
      // Fetch labourer doc to get pricing/category
      const labourerQuery = query(collection(db, 'labourers'), where('userRef', '==', data.labourerRef));
      const labourerSnapshot = await getDocs(labourerQuery);
      
      let labourerData = {};
      if (!labourerSnapshot.empty) {
          labourerData = labourerSnapshot.docs[0].data();
      }

      requests.push({
        id: docSnapshot.id,
        ...data,
        labourer: labourerUserDoc.exists() ? labourerUserDoc.data() : null,
        labourerDetails: labourerData
      });
    }
    
    // Sort in memory by createdAt descending since it might be null initially
    return requests.sort((a, b) => {
      const timeA = a.createdAt?.toMillis() || 0;
      const timeB = b.createdAt?.toMillis() || 0;
      return timeB - timeA;
    });
  } catch (error) {
    console.error("Error getting customer requests:", error);
    throw error;
  }
};

export const subscribeToCustomerRequests = (customerId, callback) => {
  const q = query(
    collection(db, 'jobRequests'), 
    where('customerRef', '==', doc(db, 'users', customerId))
  );

  return onSnapshot(q, async (snapshot) => {
    try {
      const fetchPromises = snapshot.docs.map(async (docSnapshot) => {
        const data = docSnapshot.data();
        
        const labourerUserDoc = await getDoc(data.labourerRef);
        const labourerQuery = query(collection(db, 'labourers'), where('userRef', '==', data.labourerRef));
        const labourerSnapshot = await getDocs(labourerQuery);
        
        let labourerData = {};
        if (!labourerSnapshot.empty) {
            labourerData = labourerSnapshot.docs[0].data();
        }

        return {
          id: docSnapshot.id,
          ...data,
          labourer: labourerUserDoc.exists() ? labourerUserDoc.data() : null,
          labourerDetails: labourerData
        };
      });

      const resolvedRequests = await Promise.all(fetchPromises);
      
      resolvedRequests.sort((a, b) => {
        const timeA = a.createdAt?.toMillis() || 0;
        const timeB = b.createdAt?.toMillis() || 0;
        return timeB - timeA;
      });

      callback(resolvedRequests);
    } catch (error) {
      console.error("Error processing customer requests snapshot:", error);
    }
  });
};

/**
 * LABOURER FUNCTIONS
 */
export const getLabourerRequests = async (labourerId) => {
  try {
    const q = query(
      collection(db, 'jobRequests'), 
      where('labourerRef', '==', doc(db, 'users', labourerId))
    );
    const snapshot = await getDocs(q);
    
    const requests = [];
    for (const docSnapshot of snapshot.docs) {
      const data = docSnapshot.data();
      
      const customerDoc = await getDoc(data.customerRef);
      requests.push({
        id: docSnapshot.id,
        ...data,
        customer: customerDoc.exists() ? customerDoc.data() : null
      });
    }
    
    return requests.sort((a, b) => {
      const timeA = a.createdAt?.toMillis() || 0;
      const timeB = b.createdAt?.toMillis() || 0;
      return timeB - timeA;
    });
  } catch (error) {
    console.error("Error getting labourer requests:", error);
    throw error;
  }
};

export const subscribeToLabourerRequests = (labourerId, callback) => {
  const q = query(
    collection(db, 'jobRequests'), 
    where('labourerRef', '==', doc(db, 'users', labourerId))
  );

  return onSnapshot(q, async (snapshot) => {
    try {
      const fetchPromises = snapshot.docs.map(async (docSnapshot) => {
        const data = docSnapshot.data();
        const customerDoc = await getDoc(data.customerRef);
        
        return {
          id: docSnapshot.id,
          ...data,
          customer: customerDoc.exists() ? customerDoc.data() : null
        };
      });

      const resolvedRequests = await Promise.all(fetchPromises);
      
      resolvedRequests.sort((a, b) => {
        const timeA = a.createdAt?.toMillis() || 0;
        const timeB = b.createdAt?.toMillis() || 0;
        return timeB - timeA;
      });

      callback(resolvedRequests);
    } catch (error) {
      console.error("Error processing labourer requests snapshot:", error);
    }
  });
};

export const cancelJobRequest = async (requestId) => {
  try {
    const requestRef = doc(db, 'jobRequests', requestId);
    await deleteDoc(requestRef);
  } catch (error) {
    console.error("Error cancelling request:", error);
    throw error;
  }
};

export const updateJobStatus = async (requestId, newStatus) => {
  try {
    const requestRef = doc(db, 'jobRequests', requestId);
    await updateDoc(requestRef, {
      status: newStatus
    });
  } catch (error) {
    console.error(`Error updating job request ${requestId} to ${newStatus}:`, error);
    throw error;
  }
};

export const submitReview = async (requestId, customerId, labourerId, rating, comment) => {
  try {
    // 1. Create review
    const reviewData = {
      requestRef: doc(db, 'jobRequests', requestId),
      customerRef: doc(db, 'users', customerId),
      labourerRef: doc(db, 'users', labourerId),
      rating: Number(rating),
      comment: comment || "",
      createdAt: serverTimestamp()
    };
    await addDoc(collection(db, 'reviews'), reviewData);

    // 2. Update job request as reviewed
    await updateDoc(doc(db, 'jobRequests', requestId), {
      reviewed: true
    });

    // 3. Update labourer rating
    const labourerQuery = query(collection(db, 'labourers'), where('userRef', '==', doc(db, 'users', labourerId)));
    const labourerSnapshot = await getDocs(labourerQuery);
    
    if (!labourerSnapshot.empty) {
      const labourerDoc = labourerSnapshot.docs[0];
      const data = labourerDoc.data();
      const oldAvg = data.ratingAvg || 0;
      const reviewCount = data.reviewCount || 0;
      
      const newAvg = ((oldAvg * reviewCount) + Number(rating)) / (reviewCount + 1);
      
      await updateDoc(labourerDoc.ref, {
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
        const labSnap = await getDocs(collection(db, 'labourers'));
        const jobsSnap = await getDocs(collection(db, 'jobRequests'));
        
        let pending = 0, accepted = 0, completed = 0, rejected = 0;
        jobsSnap.forEach(doc => {
            const status = doc.data().status;
            if (status === 'pending') pending++;
            else if (status === 'accepted') accepted++;
            else if (status === 'completed') completed++;
            else if (status === 'rejected') rejected++;
        });

        const chartData = [
            { name: 'Pending', count: pending, fill: '#eab308' },
            { name: 'Accepted', count: accepted, fill: '#3b82f6' },
            { name: 'Completed', count: completed, fill: '#22c55e' },
            { name: 'Rejected', count: rejected, fill: '#ef4444' }
        ];

        return {
            totalUsers: usersSnap.empty ? 0 : usersSnap.size,
            totalLabourers: labSnap.empty ? 0 : labSnap.size,
            totalRequests: jobsSnap.empty ? 0 : jobsSnap.size,
            completedJobs: completed,
            chartData
        };
    } catch (error) {
        console.error("Error getting stats:", error);
        throw error;
    }
}

export const seedDatabase = async () => {
    try {
        const usersCollection = collection(db, 'users');
        const categoriesCollection = collection(db, 'categories');
        const labourersCollection = collection(db, 'labourers');

        // Check if categories already exist
        const catsRef = await getDocs(categoriesCollection);
        if (!catsRef.empty) {
            console.log("Database seems to be seeded already (categories exist). Skipping seeding.");
            return;
        }

        console.log("Seeding database...");

        // 1. Add categories
        const catNames = ['Plumber', 'Electrician', 'Carpenter', 'Painter'];
        const catRefs = [];
        for (const name of catNames) {
            const cRef = await addDoc(categoriesCollection, { categoryName: name });
            catRefs.push(cRef);
        }

        // 2. Add some users (customers)
        const customerRefs = [];
        for (let i = 1; i <= 3; i++) {
            const uRef = await addDoc(usersCollection, {
                uid: `customer_uid_${i}`,
                name: `Customer User ${i}`,
                email: `customer${i}@example.com`,
                role: 'customer',
                phone: `555-010${i}`,
                address: `Customer Address block ${i}`,
                createdAt: serverTimestamp()
            });
            customerRefs.push(uRef);
        }

        // 3. Add users (labourers) and link to labourers collection
        for (let i = 1; i <= 5; i++) {
            const uRef = await addDoc(usersCollection, {
                uid: `labourer_uid_${i}`,
                name: `Pro Labourer ${i}`,
                email: `labourer${i}@example.com`,
                role: 'labourer',
                phone: `555-020${i}`,
                address: `Labourer Address path ${i}`,
                createdAt: serverTimestamp()
            });

            // Make them an actual labourer doc
            // Random category
            const randomCategoryRef = catRefs[Math.floor(Math.random() * catRefs.length)];
            
            await addDoc(labourersCollection, {
                uid: `labourer_uid_${i}`,
                userRef: uRef,
                categoryRef: randomCategoryRef,
                experience: `${Math.floor(Math.random() * 10) + 1} years`,
                pricing: `$${Math.floor(Math.random() * 50) + 20}/hr`,
                availabilityStatus: 'available',
                ratingAvg: Math.floor(Math.random() * 2) + 3, // 3-4
                reviewCount: Math.floor(Math.random() * 10)
            });
        }
        
        console.log("Seeding complete!");

    } catch (error) {
        console.error("Error seeding database: ", error);
        throw error;
    }
};
