'use client';

import React from 'react';
import Image from 'next/image';
import { Mail, Phone, MapPin } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';


export default function AboutPage() {
  return (
    
      <div className="container mx-auto py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-4">About Volunteer Volume</h1>
            <p className="text-xl text-muted-foreground mb-6">
              Connecting passionate volunteers with meaningful opportunities to make a difference.
            </p>
            
            <div className="space-y-4">
              <p>
                Volunteer Volume was founded in 2025 by a group of UVA first and second year engineering students in order to ease
                the volunteer managing process for the Virginia Discovery Museum in Charlottesville VA. 
              </p>
              
              <p>
                Our platform allows volunteers to find opportunities that match their skills and interests,
                while helping organizations manage their volunteer programs efficiently.
              </p>
              
              <p>
                Whether you&apos;re looking to make a difference in your community, gain experience, or meet 
                like-minded individuals, Volunteer Volume is your gateway to meaningful engagement.
              </p>
            </div>
            
            <Separator className="my-8" />
            
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Our Mission</h2>
              <p>
                To empower communities by connecting volunteers with meaningful opportunities and providing 
                organizations with tools to effectively manage volunteer programs.
              </p>
            </div>
          </div>
          
          <div className="flex flex-col items-center space-y-6 pt-20">
          <div className="relative aspect-square w-full max-w-md overflow-hidden rounded-xl">
            <Image 
              src="/eng_cent_rgb.png" 
              alt="Volunteer Volume"
              width={500}
              height={500}
              className="rounded-xl object-cover"
            />
          </div>
            
            <Card className="w-full">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-4">Contact Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <span>vadmvolunteersystem@gmail.com</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <span>(434) 977-1025</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    <span>524 East Main Street Charlottesville, Virginia 22902</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        <div className="mt-16">
          <h2 className="text-3xl font-bold mb-8 text-center">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-3">Community Impact</h3>
                <p>
                  We believe in the power of community service to transform both individuals and neighborhoods. 
                  Every volunteer hour contributes to building stronger, more connected communities.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-3">Accessibility</h3>
                <p>
                  Volunteering should be accessible to everyone. We strive to remove barriers and create 
                  inclusive opportunities that welcome volunteers from all backgrounds and abilities.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-3">Innovation</h3>
                <p>
                  We continuously evolve our platform to better serve volunteers and organizations, 
                  embracing technology to solve challenges and improve the volunteering experience.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
        
        <div className="mt-16 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Make a Difference?</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join our community of volunteers and start making an impact today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <a href="/register">Join as Volunteer</a>
            </Button>
          </div>
        </div>
      </div>
    
  );
} 