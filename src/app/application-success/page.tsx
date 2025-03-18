'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle2, ArrowRight, Info } from 'lucide-react';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import ShadcnLayout from '@/components/layout/ShadcnLayout';

export default function ApplicationSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const submitted = searchParams?.get('submitted');

  // Redirect users if they come to this page directly without submitting an application
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!submitted) {
        router.push('/apply');
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [router, submitted]);

  return (
    <ShadcnLayout>
      <div className="container max-w-md mx-auto py-12 px-4">
        <div className="flex flex-col items-center justify-center mb-8">
          <div className="bg-green-100 p-4 rounded-full mb-4">
            <CheckCircle2 className="h-12 w-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-center">Application Submitted!</h1>
          <p className="text-muted-foreground text-center mt-2">
            Thank you for your interest in volunteering with us.
          </p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-6">
              <p className="text-sm">
                Your application has been successfully submitted and is now being reviewed by our volunteer coordinator. 
                You will receive an email notification within 5-7 business days regarding the status of your application.
              </p>
              
              <Separator />
              
              <div>
                <h3 className="font-medium text-lg mb-2">What happens next?</h3>
                <ul className="space-y-2 text-sm list-disc pl-5">
                  <li>Our team will review your information</li>
                  <li>We'll check your references</li>
                  <li>If approved, you'll be invited to a volunteer orientation</li>
                  <li>After orientation, you can begin signing up for volunteer shifts</li>
                </ul>
              </div>
              
              <Separator />
              
              <div className="bg-blue-50 border border-blue-100 rounded-md p-4 flex gap-3">
                <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-blue-800">
                  If you have any questions or need to update your application, please contact our volunteer coordinator at <a href="mailto:volunteer@example.org" className="font-medium underline underline-offset-4">volunteer@example.org</a> or call us at (555) 123-4567.
                </p>
              </div>
              
              <div className="flex flex-col gap-4 pt-2">
                <Button asChild>
                  <Link href="/">
                    Return to Home Page
                  </Link>
                </Button>
                
                <Button variant="outline" asChild className="gap-2">
                  <Link href="/login">
                    Login to your account
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ShadcnLayout>
  );
}