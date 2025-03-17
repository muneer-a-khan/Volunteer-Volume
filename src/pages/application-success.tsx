import { useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function ApplicationSuccess() {
  const router = useRouter();

  // Redirect users if they come to this page directly without submitting an application
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!router.query.submitted) {
        router.push('/apply');
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <>
      <Head>
        <title>Application Submitted | Volunteer Volume</title>
        <meta name="description" content="Your volunteer application has been submitted successfully" />
      </Head>
      
      <div className="min-h-screen flex flex-col justify-center py-12 px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center">
            <svg
              className="h-16 w-16 text-green-500"
              fill="none"
              strokeWidth="1.5"
              viewBox="0 0 24 24"
              stroke="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Application Submitted!
          </h2>
          <p className="mt-2 text-center text-md text-gray-600">
            Thank you for your interest in volunteering with us.
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-6 shadow rounded-lg sm:px-10">
            <div className="space-y-6">
              <div>
                <p className="text-sm text-gray-700">
                  Your application has been successfully submitted and is now being reviewed by our volunteer coordinator. 
                  You will receive an email notification within 5-7 business days regarding the status of your application.
                </p>
              </div>
              
              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-lg font-medium text-gray-900">What happens next?</h3>
                <ul className="mt-3 space-y-3 text-sm text-gray-600 list-disc pl-5">
                  <li>Our team will review your information</li>
                  <li>We'll check your references</li>
                  <li>If approved, you'll be invited to a volunteer orientation</li>
                  <li>After orientation, you can begin signing up for volunteer shifts</li>
                </ul>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <p className="text-sm text-gray-700">
                  If you have any questions or need to update your application, please contact our volunteer coordinator at <a href="mailto:volunteer@example.org" className="text-indigo-600 hover:text-indigo-500">volunteer@example.org</a> or call us at (555) 123-4567.
                </p>
              </div>

              <div className="flex flex-col items-center space-y-4">
                <Link
                  href="/"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Return to Home Page
                </Link>
                
                <Link
                  href="/login"
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                >
                  Login to your account
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 