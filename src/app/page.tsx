'use client';

import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  const { data: session, status } = useSession();
  const isPending = session?.user?.role === "PENDING";
  const isAuthenticated = status === "authenticated";

  return (
    <>
      {/* Hero Section */}
      <div className="relative bg-cover bg-center h-96 flex items-center justify-start px-10 text-white" 
           style={{
             backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.7)), url('https://www.vadm.org/images/uploads/16/02_-_memberships_rose__large.jpg')"
           }}>
        <div className="max-w-7xl mx-auto px-6 md:px-10 w-full">
          <h1 className="text-5xl font-extrabold">Welcome to Our Volunteer Program!</h1>
          <p className="mt-2 text-lg max-w-lg">Volunteers are essential to our mission. Join a passionate community making a difference.</p>
          <div className="mt-5 flex gap-4">
            {isPending ? (
              <Link href="/my-applications">
                <Button size="xl" className="bg-primary hover:bg-primary/90">Apply</Button>
              </Link>
            ) : !isAuthenticated ? (
              <>
                <Link href="/register">
                  <Button size="xl" className="bg-primary hover:bg-primary/90">Sign Up</Button>
                </Link>
                <Link href="/login">
                  <Button variant="outline" size="xl" className="bg-white text-primary border-white hover:bg-white/90">Log In</Button>
                </Link>
              </>
            ) : null}
          </div>
        </div>
      </div>

      {/* Upcoming Events Section */}
      <div className="container mx-auto px-6 py-10">
        <h3 className="text-2xl font-bold text-gray-900">Upcoming Events</h3>
        <div className="mt-6 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <div className="h-48 bg-cover rounded-t-lg" 
                 style={{
                   backgroundImage: "url('https://www.vadm.org/images/uploads/logo_drop-ins_storytime-002.png')"
                 }}>
            </div>
            <CardContent className="pt-4">
              <p className="text-gray-600 text-sm">Thu, March 7, 6:30 p.m.</p>
              <CardTitle className="text-lg mt-1">Story Time Drop In</CardTitle>
              <CardDescription className="mt-1">An evening fantasy story for kids of all ages.</CardDescription>
              <Button className="mt-3 bg-primary hover:bg-primary/90" size="sm">Register</Button>
            </CardContent>
          </Card>

          <Card>
            <div className="h-48 bg-cover rounded-t-lg" 
                 style={{
                   backgroundImage: "url('https://www.vadm.org/images/uploads/logo_spring-break-camp-002.png')"
                 }}>
            </div>
            <CardContent className="pt-4">
              <p className="text-gray-600 text-sm">Thu, March 14, 5:00 p.m.</p>
              <CardTitle className="text-lg mt-1">Spring Break Camp!</CardTitle>
              <CardDescription className="mt-1">An interactive workshop combining environmental education and fun.</CardDescription>
              <Button className="mt-3 bg-primary hover:bg-primary/90" size="sm">Register</Button>
            </CardContent>
          </Card>

          <Card>
            <div className="h-48 bg-cover rounded-t-lg" 
                 style={{
                   backgroundImage: "url('https://www.vadm.org/images/homeslides/18/featured_kidvention_2025__large.png')"
                 }}>
            </div>
            <CardContent className="pt-4">
              <p className="text-gray-600 text-sm">Sat, March 23, 2:00 p.m.</p>
              <CardTitle className="text-lg mt-1">Family Science Day</CardTitle>
              <CardDescription className="mt-1">Engage in fun science experiments and discovery activities for all ages.</CardDescription>
              <Button className="mt-3 bg-primary hover:bg-primary/90" size="sm">Register</Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <div className="text-center mb-12">
            <h2 className="text-base text-primary font-semibold tracking-wide uppercase">Features</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900">
              A better way to manage your volunteer hours
            </p>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
              Our platform makes it easy to find volunteer opportunities, track your hours, and connect with the museum.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex">
              <div className="mr-4 flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-primary text-white">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Shift Scheduling</h3>
                <p className="mt-2 text-gray-600">
                  Browse available shifts and sign up for volunteer opportunities that match your schedule and interests.
                </p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex">
              <div className="mr-4 flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-primary text-white">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Hour Tracking</h3>
                <p className="mt-2 text-gray-600">
                  Automatically track your volunteer hours with our check-in system or log hours manually for other activities.
                </p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex">
              <div className="mr-4 flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-primary text-white">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Reports & Analytics</h3>
                <p className="mt-2 text-gray-600">
                  Generate detailed reports of your volunteer activity and receive certificates for your service.
                </p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex">
              <div className="mr-4 flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-primary text-white">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Community</h3>
                <p className="mt-2 text-gray-600">
                  Connect with various community groups and organizations to find the perfect volunteer opportunities for you.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary">
        <div className="max-w-7xl mx-auto py-12 px-6 md:px-10 lg:py-16 flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-white">
              <span className="block">Ready to start volunteering?</span>
              <span className="block text-primary-foreground opacity-90">Join our community today.</span>
            </h2>
          </div>
          <div className="mt-8 md:mt-0">
            {isPending ? (
              <Link href="/my-applications">
                <Button variant="outline" size="lg" className="bg-white text-primary hover:bg-white/90">
                  View Your Application
                </Button>
              </Link>
            ) : !isAuthenticated ? (
              <Link href="/register">
                <Button variant="outline" size="lg" className="bg-white text-primary hover:bg-white/90">
                  Get Started
                </Button>
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
}