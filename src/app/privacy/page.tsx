'use client';
import Head from 'next/head';
import { useState } from "react";

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
        
        <p className="text-gray-700 mb-4">
          Volunteer Volume is committed to protecting your privacy and ensuring the security of your personal information. By accessing or using our website, you agree to the practices described in this Privacy Policy.
        </p>
        
        <h2 className="text-2xl font-semibold text-gray-800 mt-6">1. Information We Collect</h2>
        <p className="text-gray-700 mb-4">
          We collect personal information that you voluntarily provide to us when you use our services or interact with our website. The types of personal information we collect include:
        </p>
        <ul className="list-disc pl-6 text-gray-700 mb-4">
          <li><strong>Personal Information:</strong> Name, email address, phone number, mailing address, group names, and emergency contact information.</li>
          <li><strong>Interests and Skills:</strong> Information related to your interests and skills, which may be used to tailor your experience with our services.</li>
        </ul>

        <h2 className="text-2xl font-semibold text-gray-800 mt-6">2. How We Use Your Information</h2>
        <p className="text-gray-700 mb-4">
          We use the information we collect for various purposes, including:
        </p>
        <ul className="list-disc pl-6 text-gray-700 mb-4">
          <li>To provide, maintain, and improve our services.</li>
          <li>To communicate with you about your account, respond to inquiries, and provide updates or important information related to our services.</li>
          <li>To tailor our services to your interests and skills.</li>
          <li>To meet legal obligations, including tax reporting requirements for tax-exempt nonprofit organizations.</li>
        </ul>

        <h2 className="text-2xl font-semibold text-gray-800 mt-6">3. Data Security</h2>
        <p className="text-gray-700 mb-4">
          We take the protection of your personal information seriously and implement reasonable administrative, technical, and physical safeguards to protect your data from unauthorized access, use, or disclosure. However, no method of transmission over the internet or electronic storage is completely secure, and while we strive to use commercially acceptable means to protect your personal information, we cannot guarantee absolute security.
        </p>

        <h2 className="text-2xl font-semibold text-gray-800 mt-6">4. Your Rights and Choices</h2>
        <p className="text-gray-700 mb-4">
          Depending on your location and applicable laws, you may have the following rights regarding your personal information:
        </p>
        <ul className="list-disc pl-6 text-gray-700 mb-4">
          <li><strong>Access and Correction:</strong> You have the right to request access to the personal information we hold about you and to request corrections if the information is inaccurate or incomplete.</li>
          <li><strong>Deletion:</strong> You can request that we delete your personal information, subject to any legal obligations we may have to retain it.</li>
          <li><strong>Opt-Out:</strong> If you no longer wish to receive communications from us, you can unsubscribe from our emails or contact us to request that we stop sending you informational materials.</li>
        </ul>

        <h2 className="text-2xl font-semibold text-gray-800 mt-6">5. Children’s Privacy</h2>
        <p className="text-gray-700 mb-4">
          Our website is not intended for children under the age of 12, and we do not knowingly collect personal information from children. If we become aware that we have inadvertently collected personal information from a child under 12, we will take steps to delete that information. If you are a parent or guardian and believe we may have collected such information, please contact us immediately.
        </p>

        <h2 className="text-2xl font-semibold text-gray-800 mt-6">6. Sharing Your Information</h2>
        <p className="text-gray-700 mb-4">
          We do not sell, rent, or trade your personal information to third parties. However, we may share your information in the following situations:
        </p>
        <ul className="list-disc pl-6 text-gray-700 mb-4">
          <li><strong>Legal Compliance:</strong> We may disclose your personal information if required to do so by law or in response to a valid request by governmental authorities (e.g., a subpoena or court order).</li>
        </ul>

        <h2 className="text-2xl font-semibold text-gray-800 mt-6">7. Changes to This Privacy Policy</h2>
        <p className="text-gray-700 mb-4">
          We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. When we make changes, we will post the revised policy on this page and update the "Effective Date" at the top of the policy. We encourage you to review this Privacy Policy periodically to stay informed about how we are protecting your information.
        </p>

        <h2 className="text-2xl font-semibold text-gray-800 mt-6">8. Contact Us</h2>
        <p className="text-gray-700 mb-4">
          If you have any questions or concerns about this Privacy Policy or our privacy practices, please contact us at:
        </p>
        <p className="text-gray-700 mb-4">
          <strong>Volunteer Volume</strong><br />
          Phone: (434) 977-1025<br />
          Email: <a href="mailto:vadmvolunteersystem@gmail.com" className="text-blue-600 hover:underline">vadmvolunteersystem@gmail.com</a>
        </p>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
