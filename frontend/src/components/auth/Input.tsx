import React, { forwardRef } from 'react';
import { FieldError } from 'react-hook-form';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: FieldError;
  className?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label 
            htmlFor={props.id || props.name} 
            className="block text-sm font-medium text-[#0D1C17] mb-2"
          >
            {label}
          </label>
        )}
        
        <input
          ref={ref}
          className={`
            w-full h-14 px-4 
            bg-[#E5F5F0] 
            border-0 
            rounded-xl 
            text-base 
            text-[#45A180] 
            placeholder-[#45A180]/70
            focus:outline-none 
            focus:ring-2 
            focus:ring-[#009963] 
            focus:bg-white
            transition-all duration-200
            ${error ? 'ring-1 ring-red-500 bg-red-50' : ''}
            ${className}
          `}
          {...props}
        />
        
        {error && (
          <p className="mt-2 text-sm text-red-600">
            {error.message}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
