'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';

export default function ApplicationSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const [isPending, setIsPending] = useState(false);
  const justSubmitted = searchParams?.get('submitted') === 'true';

  useEffect(() => {
    // Check if user is in pending state
    if (session?.user?.role === 'PENDING') {
      setIsPending(true);
    }
  }, [session]);

  return (
    <div className="container max-w-md mx-auto py-12 px-4">
      <div className="flex flex-col items-center justify-center mb-8">
        <div className="bg-green-100 p-4 rounded-full mb-4">
          <CheckCircle2 className="h-12 w-12 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-center">
          {justSubmitted ? "Application Submitted!" : "Application Pending Approval"}
        </h1>
        <p className="text-muted-foreground text-center mt-2">
          Thank you for your interest in volunteering with us.
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-6">
            {justSubmitted ? (
              <p className="text-sm">
                Your application has been successfully submitted and is now being reviewed by our volunteer coordinator. 
                You will receive an email notification regarding the status of your application.
              </p>
            ) : (
              <p className="text-sm">
                Your volunteer application is currently under review by our administrator. 
                Once approved, you will gain access to volunteer features and opportunities.
                This process typically takes 5-7 business days.
              </p>
            )}
            
            <Separator />
            
            <div>
              <h3 className="font-medium text-lg mb-2">What happens next?</h3>
              <ul className="space-y-2 text-sm list-disc pl-5">
                <li>Our team is reviewing your information</li>
                <li>We'll check your references</li>
                <li>If approved, you'll be invited to a volunteer orientation</li>
                <li>After orientation, you can begin signing up for volunteer shifts</li>
              </ul>
            </div>
            
            <Separator />
            
            <div className="text-center">
              <p className="text-sm mb-4">
                Have questions about your application status? Feel free to contact us.
              </p>
              <Link href="/contact">
                <Button variant="outline">Contact Us</Button>
              </Link>
            </div>
            
            <div className="text-center">
              <Link href="/">
                <Button variant="link">Return to Home Page</Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}