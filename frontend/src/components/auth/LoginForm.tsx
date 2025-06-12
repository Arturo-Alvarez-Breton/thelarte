import React from 'react';
import Input from './Input';
import Button from './Button';
import { useLogin } from '../../hooks/useLogin';

export const LoginForm = () => {
  const { register, handleSubmit, errors, isLoading } = useLogin();

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {/* Username Field */}
      <div className="space-y-2">
        <Input
          id="username"
          type="text"
          placeholder="Username"
          autoComplete="username"
          {...register('username')}
          error={errors.username}
          className={errors.username ? 'ring-2 ring-red-500' : ''}
        />
      </div>

      {/* Password Field */}
      <div className="space-y-2">
        <Input
          id="password"
          type="password"
          placeholder="Password"
          autoComplete="current-password"
          {...register('password')}
          error={errors.password}
          className={errors.password ? 'ring-2 ring-red-500' : ''}
        />
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
