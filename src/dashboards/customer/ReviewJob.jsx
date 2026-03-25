import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { submitReview } from '../../firebase/services';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';
import { Star, Loader2 } from 'lucide-react';

const ReviewJob = () => {
    const { id } = useParams(); // Job Request ID
    const { currentUser } = useContext(AuthContext);
    const navigate = useNavigate();

    const [job, setJob] = useState(null);
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchJob = async () => {
            try {
                const jobRef = doc(db, 'jobRequests', id);
                const jobSnap = await getDoc(jobRef);

                if (jobSnap.exists()) {
                    const jobData = jobSnap.data();

                    // Verify authority to review: Only if completed and the current user is the customer
                    if (jobData.status !== 'completed') {
                        toast.error('You can only review completed jobs.');
                        navigate('/customer');
                        return;
                    }
                    if (jobData.customerRef.id !== currentUser?.uid) {
                        toast.error('Unauthorized to review this job.');
                        navigate('/customer');
                        return;
                    }
                    if (jobData.reviewed) {
                        toast.error('You have already reviewed this job.');
                        navigate('/customer');
                        return;
                    }

                    setJob({ id: jobSnap.id, ...jobData });
                } else {
                    toast.error('Job not found.');
                    navigate('/customer');
                }
            } catch (error) {
                console.error("Error fetching job:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchJob();
    }, [id, currentUser, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rating === 0) {
            toast.error('Please select a rating');
            return;
        }

        try {
            setSubmitting(true);
            
            await submitReview(job.id, currentUser.uid, job.labourerRef.id, rating, comment);

            toast.success('Review submitted! Thank you.');
            navigate('/customer');
        } catch (error) {
            console.error(error);
            toast.error('Failed to submit review');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return <div className="flex justify-center py-12"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>;
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Leave a Review</h2>

                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Star Rating System */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Overall Rating
                        </label>
                        <div className="flex items-center gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    type="button"
                                    key={star}
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHoverRating(star)}
                                    onMouseLeave={() => setHoverRating(0)}
                                    className="focus:outline-none transition-transform hover:scale-110"
                                >
                                    <Star
                                        className={`w-8 h-8 ${star <= (hoverRating || rating)
                                                ? 'fill-yellow-400 text-yellow-400'
                                                : 'text-gray-300 dark:text-gray-600'
                                            }`}
                                    />
                                </button>
                            ))}
                            <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                                {rating > 0 && `You rated ${rating} out of 5 stars`}
                            </span>
                        </div>
                    </div>

                    {/* Comment */}
                    <div>
                        <label htmlFor="comment" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Share your experience (Optional)
                        </label>
                        <textarea
                            id="comment"
                            rows="4"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="How was the service? Would you recommend them?"
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white dark:focus:bg-gray-900 transition-colors resize-none"
                        />
                    </div>

                    <div className="flex gap-4 pt-4 border-t border-gray-200 dark:border-gray-800">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => navigate('/customer')}
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="flex-1"
                            isLoading={submitting}
                        >
                            Submit Review
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ReviewJob;
