import React from 'react';
import { useForm } from 'react-hook-form';
import Input from './Input';
import Button from './Button';
import { LoginRequest } from '../../types/auth';
import { useAuth } from '../../hooks/useAuth';
import { yupResolver } from '@hookform/resolvers/yup';
import { loginSchema } from '../../schemas/authSchemas';

export const LoginForm = () => {
  const { login, isLoading } = useAuth();
  const { register, handleSubmit, formState: { errors } } = useForm<LoginRequest>({
    resolver: yupResolver(loginSchema)
  });

  const onSubmit = async (data: LoginRequest) => {
    try {
      await login(data);
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      {/* Username Field */}
      <div className="space-y-2">
        <Input
          id="username"
          type="text"
          placeholder="Username"
          autoComplete="username"          error={errors.username as any}
          {...register('username')}
          className={errors.username ? 'ring-2 ring-red-500' : ''}
        />
        {errors.username?.message && (
          <p className="text-red-500 text-sm">{errors.username.message}</p>
        )}
      </div>

      {/* Password Field */}
      <div className="space-y-2">
        <Input
          id="password"
          type="password"
          placeholder="Password"
          autoComplete="current-password"          error={errors.password as any}
          {...register('password')}
          className={errors.password ? 'ring-2 ring-red-500' : ''}
        />
        {errors.password?.message && (
          <p className="text-red-500 text-sm">{errors.password.message}</p>
        )}
      </div>

      {/* Submit Button */}
      <div className="pt-2">
        <Button
          type="submit"
          size="lg"
          isLoading={isLoading}
          disabled={isLoading}
          className="font-inter"
        >
          {isLoading ? 'Signing in...' : 'Log in'}
        </Button>
      </div>
    </form>
  );
};

export default LoginForm;
