import React from 'react';
import { Loader2 } from 'lucide-react';

const Button = ({
    children,
    onClick,
    type = 'button',
    variant = 'primary', // primary, secondary, danger, outline
    size = 'md', // sm, md, lg
    className = '',
    isLoading = false,
    disabled = false,
    fullWidth = false,
    ...props
}) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900';

    const variants = {
        primary: 'bg-primary text-white hover:bg-primary-dark focus:ring-primary shadow-sm',
        secondary: 'bg-secondary text-white hover:bg-secondary-dark focus:ring-secondary shadow-sm',
        danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-sm',
        outline: 'border-2 border-primary text-primary hover:bg-primary-light/10 dark:hover:bg-primary/20 focus:ring-primary',
    };

    const sizes = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-base',
        lg: 'px-6 py-3 text-lg',
    };

    const fullWidthClass = fullWidth ? 'w-full' : '';
    const opacityClass = disabled || isLoading ? 'opacity-70 cursor-not-allowed' : '';

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled || isLoading}
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${fullWidthClass} ${opacityClass} ${className}`}
            {...props}
        >
            {isLoading ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                </>
            ) : (
                children
            )}
        </button>
    );
};

export default Button;
