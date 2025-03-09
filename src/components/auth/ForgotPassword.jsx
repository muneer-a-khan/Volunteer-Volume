import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../common/Button';
import Alert from '../common/Alert';

export default function ForgotPassword() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { forgotPassword } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });

  const onSubmit = async (data) => {
    setIsLoading(true);
    setStatus({ type: '', message: '' });
    
    try {
      await forgotPassword(data.email);
      setStatus({
        type: 'success',
        message: 'Password reset instructions have been sent to your email. Please check your inbox.'
      });
    } catch (error) {
      console.error('Forgot password error:', error);
      setStatus({
        type: 'error',
        message: error.message || 'Failed to send password reset instructions. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-8 max-w-md w-full">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Reset Your Password
        </h2>
        <p className="text-gray-600 mt-2">
          Enter your email and we'll send you instructions to reset your password.
        </p>
      </div>
      
      {status.message && (
        <Alert 
          type={status.type} 
          message={status.message} 
          className="mb-6"
        />
      )}
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email address
          </label>
          <input
            id="email"
            type="email"
            {...register('email', { 
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address'
              }
            })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-vadm-blue focus:ring-vadm-blue"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>
        
        <div>
          <Button
            type="submit"
            loading={isLoading}
            loadingText="Sending..."
            fullWidth
            variant="primary"
          >
            Send Reset Instructions
          </Button>
        </div>
        
        <div className="text-center mt-4">
          <a href="/login" className="text-sm text-vadm-blue hover:text-blue-700">
            Back to login
          </a>
        </div>
      </form>
    </div>
  );
}