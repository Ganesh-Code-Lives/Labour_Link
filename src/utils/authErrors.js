export const getAuthErrorMessage = (error) => {
    const errorCode = error.code || error.message;

    // Check if the string itself contains the error code
    if (typeof errorCode === 'string') {
        if (errorCode.includes('auth/invalid-credential') || errorCode.includes('auth/user-not-found') || errorCode.includes('auth/wrong-password')) {
            return 'Invalid email or password. Please try again.';
        }
        if (errorCode.includes('auth/email-already-in-use')) {
            return 'An account with this email already exists.';
        }
        if (errorCode.includes('auth/weak-password')) {
            return 'Password should be at least 6 characters.';
        }
        if (errorCode.includes('auth/invalid-email')) {
            return 'Please enter a valid email address.';
        }
        if (errorCode.includes('auth/too-many-requests')) {
            return 'Too many failed attempts. Please try again later.';
        }
        if (errorCode.includes('auth/network-request-failed')) {
            return 'Network error. Please check your internet connection.';
        }
        if (errorCode.includes('auth/popup-closed-by-user')) {
            return 'Sign-in popup was closed before completing.';
        }
    }

    return error.message || 'An unexpected authentication error occurred.';
};
