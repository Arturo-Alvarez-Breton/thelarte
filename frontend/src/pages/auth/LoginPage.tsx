import React from 'react';
import { Link } from 'react-router-dom';
import LoginForm from '../../components/auth/LoginForm';

const LoginPage: React.FC = () => {
  return (
    <div className="w-full max-w-md mx-auto">
      {/* Banner Image */}
      <div className="mb-8">
        <img
          src="https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=928&h=320&fit=crop&crop=center"
          alt="Arte y creatividad"
          className="w-full h-80 object-cover rounded-xl shadow-lg"
        />
      </div>

      {/* Welcome Title */}
      <h1 className="text-3xl font-bold text-[#0D1C17] text-center mb-8 font-inter">
        Welcome back
      </h1>

      {/* Login Form */}
      <LoginForm />

      {/* Forgot Password Link */}
      <div className="mt-6 text-center">
        <Link
          to="/auth/forgot-password"
          className="text-sm text-[#45A180] hover:text-[#009963] transition-colors duration-200 font-medium"
        >
          Forgot password?
        </Link>
      </div>

      {/* Register Link */}
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-600">
          Don't have an account?{' '}
          <Link
            to="/auth/register"
            className="text-[#45A180] hover:text-[#009963] font-medium transition-colors duration-200"
          >
            Sign up here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
