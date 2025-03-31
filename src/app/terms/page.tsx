'use client';
import Head from 'next/head';
import { useState } from "react";


const TermsOfService: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Terms of Service</h1>
        
        <p className="text-gray-700 mb-4">
          Welcome to Volunteer Volume. By accessing or using our services, you agree to be bound by these terms.
        </p>
        
        <h2 className="text-2xl font-semibold text-gray-800 mt-6">1. Acceptance of Terms</h2>
        <p className="text-gray-700 mb-4">
          By using Volunteer Volume, you acknowledge that you have read, understood, and agree to these Terms of Service.
        </p>
        
        <h2 className="text-2xl font-semibold text-gray-800 mt-6">2. User Responsibilities</h2>
        <p className="text-gray-700 mb-4">
          You agree not to misuse our services or help others do so. You are responsible for ensuring that your use of the service complies with all applicable laws and regulations.
        </p>
        
        <h2 className="text-2xl font-semibold text-gray-800 mt-6">3. Changes to Terms</h2>
        <p className="text-gray-700 mb-4">
          We may update these terms at any time. Continued use of Volunteer Volume constitutes acceptance of the new terms. It is your responsibility to review these terms periodically.
        </p>

        <h2 className="text-2xl font-semibold text-gray-800 mt-6">4. Privacy Policy</h2>
        <p className="text-gray-700 mb-4">
          Your use of our services is also governed by our Privacy Policy, which outlines how we collect, use, and protect your information.
        </p>
        
        <h2 className="text-2xl font-semibold text-gray-800 mt-6">5. Limitation of Liability</h2>
        <p className="text-gray-700 mb-4">
          Volunteer Volume shall not be held liable for any indirect, incidental, or consequential damages arising out of the use of our services.
        </p>

        <h2 className="text-2xl font-semibold text-gray-800 mt-6">6. Termination</h2>
        <p className="text-gray-700 mb-4">
          We reserve the right to suspend or terminate your access to our services at our discretion, without prior notice, if you violate these terms or engage in prohibited activities.
        </p>
      </div>
    </div>
  );
};

export default TermsOfService;
