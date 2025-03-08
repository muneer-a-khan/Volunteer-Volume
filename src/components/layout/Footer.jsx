import React from 'react';
import Link from 'next/link';

export default function Footer() {
  const year = new Date().getFullYear();
  
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex justify-center md:justify-start space-x-6 md:order-2">
            <Link href="/about" className="text-gray-600 hover:text-gray-900">
              About
            </Link>
            <Link href="/contact" className="text-gray-600 hover:text-gray-900">
              Contact
            </Link>
            <Link href="/privacy" className="text-gray-600 hover:text-gray-900">
              Privacy
            </Link>
            <Link href="/terms" className="text-gray-600 hover:text-gray-900">
              Terms
            </Link>
          </div>
          <div className="mt-8 md:mt-0 md:order-1">
            <div className="flex items-center justify-center md:justify-start">
              <img
                className="h-8 w-auto"
                src="/logo.svg"
                alt="Virginia Discovery Museum"
              />
              <div className="ml-3">
                <p className="text-base text-gray-600">
                  &copy; {year} Virginia Discovery Museum. All rights reserved.
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Volunteer Volume - A Volunteer Management System
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}