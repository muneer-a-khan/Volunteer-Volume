'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';

export default function ApplicationSuccess() {
  const { data: session } = useSession();

  return (
    <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-lg text-center">
        <div className="mb-10">
          <svg
            className="mx-auto h-12 w-12 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
          Application Submitted!
        </h2>
        <p className="mt-4 text-xl text-gray-600">
          Thank you for your interest in volunteering with us!
        </p>
        <div className="mt-8 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-yellow-400"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Your application is currently under review. An administrator will contact you soon.
              </p>
            </div>
          </div>
        </div>
        <div className="mt-8">
          <p className="text-gray-600 mb-6">
            While your application is being reviewed, you can:
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Link
              href="/profile"
              className="flex items-center justify-center rounded-md border border-transparent bg-indigo-100 px-4 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-200"
            >
              Complete Your Profile
            </Link>
            <Link
              href="/about"
              className="flex items-center justify-center rounded-md border border-transparent bg-indigo-100 px-4 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-200"
            >
              Learn More About Us
            </Link>
          </div>
        </div>
        <p className="mt-8 text-sm text-gray-500">
          If you have any questions, please{' '}
          <Link href="/contact" className="font-medium text-indigo-600 hover:text-indigo-500">
            contact us
          </Link>
          .
        </p>
      </div>
    </div>
  );
}