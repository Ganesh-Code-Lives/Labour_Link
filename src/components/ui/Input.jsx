import React from 'react';

const Input = ({
    label,
    id,
    type = 'text',
    placeholder,
    value,
    onChange,
    error,
    required = false,
    className = '',
    ...props
}) => {
    return (
        <div className={`mb-4 w-full ${className}`}>
            {label && (
                <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}
            <input
                id={id}
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                className={`w-full px-4 py-2 border rounded-lg shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white 
          focus:outline-none focus:ring-2 focus:border-transparent transition-colors
          ${error
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-300 dark:border-gray-700 focus:ring-primary'
                    }`}
                {...props}
            />
            {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
        </div>
    );
};

export default Input;
