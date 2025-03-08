import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';

export default function Navbar() {
  const { isAuthenticated, isAdmin, dbUser, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/">
                <img
                  className="h-8 w-auto"
                  src="/logo.svg"
                  alt="Virginia Discovery Museum"
                />
              </Link>
              <span className="ml-2 text-xl font-bold text-vadm-blue">Volunteer Volume</span>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                href="/"
                className={`${
                  router.pathname === '/'
                    ? 'border-vadm-blue text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
              >
                Home
              </Link>
              
              {isAuthenticated && (
                <>
                  <Link
                    href="/dashboard"
                    className={`${
                      router.pathname === '/dashboard'
                        ? 'border-vadm-blue text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                  >
                    Dashboard
                  </Link>
                  
                  <Link
                    href="/shifts"
                    className={`${
                      router.pathname.startsWith('/shifts')
                        ? 'border-vadm-blue text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                  >
                    Shifts
                  </Link>
                  
                  <Link
                    href="/groups"
                    className={`${
                      router.pathname.startsWith('/groups')
                        ? 'border-vadm-blue text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                  >
                    Organizations
                  </Link>
                  
                  {isAdmin && (
                    <>
                      <Link
                        href="/admin"
                        className={`${
                          router.pathname.startsWith('/admin')
                            ? 'border-vadm-blue text-gray-900'
                            : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                        } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                      >
                        Admin
                      </Link>
                      <Link
                        href="/admin/reports"
                        className={`${
                          router.pathname === '/admin/reports'
                            ? 'border-vadm-blue text-gray-900'
                            : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                        } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                      >
                        Reports
                      </Link>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
          
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {isAuthenticated ? (
              <div className="ml-3 relative">
                <div className="flex items-center">
                  <Link
                    href="/volunteers/profile"
                    className="text-sm font-medium text-gray-700 mr-4 hover:text-vadm-blue"
                  >
                    {dbUser?.name || 'My Profile'}
                  </Link>
                  
                  <button
                    onClick={handleLogout}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-vadm-blue hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-vadm-blue"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex space-x-4">
                <Link
                  href="/login"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-vadm-blue bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-vadm-blue"
                >
                  Sign in
                </Link>
                
                <Link
                  href="/register"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-vadm-blue hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-vadm-blue"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="-mr-2 flex items-center sm:hidden">
            <button
              onClick={toggleMobileMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-vadm-blue"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {/* Icon when menu is closed */}
              <svg
                className={`${isMobileMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              {/* Icon when menu is open */}
              <svg
                className={`${isMobileMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      <div className={`${isMobileMenuOpen ? 'block' : 'hidden'} sm:hidden`}>
        <div className="pt-2 pb-3 space-y-1">
          <Link
            href="/"
            className={`${
              router.pathname === '/'
                ? 'bg-vadm-blue text-white'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            } block pl-3 pr-4 py-2 border-l-4 ${
              router.pathname === '/' ? 'border-vadm-blue' : 'border-transparent'
            } text-base font-medium`}
          >
            Home
          </Link>
          
          {isAuthenticated && (
            <>
              <Link
                href="/dashboard"
                className={`${
                  router.pathname === '/dashboard'
                    ? 'bg-vadm-blue text-white'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                } block pl-3 pr-4 py-2 border-l-4 ${
                  router.pathname === '/dashboard' ? 'border-vadm-blue' : 'border-transparent'
                } text-base font-medium`}
              >
                Dashboard
              </Link>
              
              <Link
                href="/shifts"
                className={`${
                  router.pathname.startsWith('/shifts')
                    ? 'bg-vadm-blue text-white'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                } block pl-3 pr-4 py-2 border-l-4 ${
                  router.pathname.startsWith('/shifts') ? 'border-vadm-blue' : 'border-transparent'
                } text-base font-medium`}
              >
                Shifts
              </Link>
              
              {isAdmin && (
                <Link
                  href="/admin"
                  className={`${
                    router.pathname.startsWith('/admin')
                      ? 'bg-vadm-blue text-white'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  } block pl-3 pr-4 py-2 border-l-4 ${
                    router.pathname.startsWith('/admin') ? 'border-vadm-blue' : 'border-transparent'
                  } text-base font-medium`}
                >
                  Admin
                </Link>
              )}
            </>
          )}
        </div>
        
        <div className="pt-4 pb-3 border-t border-gray-200">
          {isAuthenticated ? (
            <>
              <div className="flex items-center px-4">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-vadm-blue flex items-center justify-center text-white font-bold">
                    {dbUser?.name?.charAt(0) || 'U'}
                  </div>
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-gray-800">{dbUser?.name}</div>
                  <div className="text-sm font-medium text-gray-500">{dbUser?.email}</div>
                </div>
              </div>
              <div className="mt-3 space-y-1">
                <Link
                  href="/volunteers/profile"
                  className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                >
                  Your Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                >
                  Sign out
                </button>
              </div>
            </>
          ) : (
            <div className="mt-3 space-y-1 px-4">
              <Link
                href="/login"
                className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
              >
                Sign up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}