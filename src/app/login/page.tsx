'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import axios from 'axios';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import AuthErrorHandler from '@/components/auth/AuthErrorHandler';

// Schema for form validation
const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 8 characters long and include uppercase, lowercase, a number, and a special character' }),
  rememberMe: z.boolean().optional(),
  isAdminLogin: z.boolean().optional(),
});

export default function Login() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isAdminLogin, setIsAdminLogin] = useState<boolean>(
    searchParams?.get('admin') === 'true'
  );

  // Initialize form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: true,
      isAdminLogin: isAdminLogin,
    },
  });

  // Update form value when isAdminLogin changes
  useEffect(() => {
    form.setValue('isAdminLogin', isAdminLogin);
  }, [isAdminLogin, form]);

  // Form submission handler
  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    setError(null);

    try {
      // Track additional login context for debugging
      const loginContext = {
        isAdminLogin: data.isAdminLogin,
        timestamp: new Date().toISOString(),
      };

      // Store the context temporarily to help with debugging
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('loginAttemptContext', JSON.stringify(loginContext));
      }

      const result = await signIn('credentials', {
        redirect: false,
        email: data.email,
        password: data.password,
        callbackUrl: searchParams?.get('callbackUrl') || '/dashboard',
      });

      if (result?.error) {
        // Add more detailed error logging
        console.error('Login error details:', {
          error: result.error,
          status: result.status,
          ok: result.ok,
          url: result.url,
        });

        setError(result.error);
        return;
      }

      // Check if user is pending
      try {
        const userResponse = await axios.get('/api/profile');

        // If admin login was attempted, but user is not an admin
        if (data.isAdminLogin && userResponse.data.role !== 'ADMIN') {
          setError('You do not have administrator access. Please use the standard login.');
          setIsLoading(false);
          return;
        }

        if (userResponse.data.role === 'PENDING') {
          toast.success('Successfully logged in!');
          router.push('/my-applications');
          return;
        }

        // For admin users, redirect to admin dashboard
        if (userResponse.data.role === 'ADMIN') {
          toast.success('Successfully logged in as administrator!');
          router.push('/admin/dashboard');
          return;
        }

        // Handle successful login for non-pending users
        const callbackUrl = searchParams?.get('callbackUrl') || '/dashboard';
        toast.success('Successfully logged in!');
        router.push(callbackUrl);
      } catch (profileError: any) {
        console.error('Error fetching profile:', profileError?.response?.data || profileError);
        // If we can't get the profile, show an error with more detail
        setError('Unable to retrieve your user profile. Please try again later.');
        setIsLoading(false);
      }
    } catch (error: any) {
      console.error('Login error details:', error?.response?.data || error);
      setError(error.response?.data?.message || 'Failed to login. Please check your credentials and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen py-12 flex flex-col justify-center">
      <div className="mx-auto w-full max-w-md px-4 sm:px-0">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Sign in to your account</h1>
          <p className="mt-2 text-sm text-gray-600">
            Or{' '}
            <Link href="/register" className="font-medium text-primary hover:text-primary/90">
              apply to become a volunteer
            </Link>
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center">Welcome back</CardTitle>
            <CardDescription className="text-center">Enter your credentials to sign in</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Use the new AuthErrorHandler for URL-based errors */}
            <AuthErrorHandler />

            {/* Keep the existing error state for form/API errors */}
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            type="email"
                            placeholder="you@example.com"
                            className="pl-10"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            className="pl-10 pr-10"
                            {...field}
                          />
                          <button
                            type="button"
                            onClick={togglePasswordVisibility}
                            className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                          >
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex items-center justify-between">
                  <FormField
                    control={form.control}
                    name="rememberMe"
                    render={({ field }) => (
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="rememberMe"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <label
                          htmlFor="rememberMe"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Remember me
                        </label>
                      </div>
                    )}
                  />

                  <Link
                    href="/forgot-password"
                    className="text-sm font-medium text-primary hover:text-primary/90"
                  >
                    Forgot password?
                  </Link>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? "Signing in..." : isAdminLogin ? "Sign in as Administrator" : "Sign in"}
                </Button>
              </form>
            </Form>

            <div className="mt-4 text-center">
              {isAdminLogin ? (
                <Button
                  variant="link"
                  className="text-sm text-primary"
                  onClick={() => {
                    setIsAdminLogin(false);
                    router.push('/login');
                  }}
                >
                  Switch to standard login
                </Button>
              ) : (
                <Button
                  variant="outline"
                  className="w-full mt-2 text-sm"
                  onClick={() => {
                    setIsAdminLogin(true);
                    router.push('/login?admin=true');
                  }}
                >
                  Admin Login
                </Button>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-center text-muted-foreground">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="font-medium text-primary hover:text-primary/90">
                Sign up
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
} 