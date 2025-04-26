'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';

export default function ApplicationSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const justSubmitted = searchParams?.get('submitted') === 'true';
  // Removed authentication logic - assume user is always in pending state
  const isPending = true;

  return (
    <div className="container max-w-4xl mx-auto px-4 py-12">
      <Card className="border-gray-200 shadow-md">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center p-4">
            <div className="bg-green-100 p-3 rounded-full mb-4">
              <CheckCircle2 className="h-12 w-12 text-green-600" />
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {justSubmitted ? 'Application Submitted Successfully!' : 'Application Status'}
            </h1>
            
            <p className="text-gray-600 mb-6 max-w-md">
              {justSubmitted 
                ? 'Thank you for submitting your volunteer application! We will review your information and get back to you soon.' 
                : 'Your application is currently being reviewed by our volunteer coordinator.'}
            </p>

            <div className="bg-blue-50 w-full p-4 rounded-lg mb-6">
              <h2 className="font-semibold text-blue-800 mb-2">What happens next?</h2>
              <ol className="text-left text-blue-700 list-decimal pl-5 space-y-1">
                <li>Our volunteer coordinator will review your application (typically within 3-5 business days)</li>
                <li>You may receive an email with additional questions or requesting an interview</li>
                <li>Once approved, you&apos;ll receive access to volunteer shifts and opportunities</li>
              </ol>
            </div>

            <Separator className="my-4" />

            <div className="flex flex-col sm:flex-row gap-3 mt-2">
              <Button asChild variant="outline">
                <Link href="/">Return to Home</Link>
              </Button>
              <Button asChild>
                <Link href="/dashboard">Go to Dashboard</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}