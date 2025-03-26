'use client';
import Head from 'next/head';
import { useState } from 'react';

const ContactUs: React.FC = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', form);
  };

  return (
    <>
      <Head>
        <title>Contact Us</title>
      </Head>
      <div className="flex flex-col items-center justify-center min-h-screen bg-white p-6">
        <h2 className="text-[#111418] text-3xl font-bold mb-4">Contact Us</h2>
        <form onSubmit={handleSubmit} className="w-full max-w-lg space-y-4">
          <label className="block">
            <span className="text-[#111418] font-medium">Full name</span>
            <input
              name="name"
              type="text"
              placeholder="Your name"
              className="mt-1 block w-full rounded-lg border border-gray-300 p-3"
              value={form.name}
              onChange={handleChange}
            />
          </label>
          <label className="block">
            <span className="text-[#111418] font-medium">Email</span>
            <input
              name="email"
              type="email"
              placeholder="Your email address"
              className="mt-1 block w-full rounded-lg border border-gray-300 p-3"
              value={form.email}
              onChange={handleChange}
            />
          </label>
          <label className="block">
            <span className="text-[#111418] font-medium">Message</span>
            <textarea
              name="message"
              placeholder="How can we help you?"
              className="mt-1 block w-full rounded-lg border border-gray-300 p-3 h-32"
              value={form.message}
              onChange={handleChange}
            />
          </label>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-bold py-2 rounded-lg hover:bg-blue-700"
          >
            Send message
          </button>
        </form>
        <div className="mt-6 text-center">
          <p className="text-[#111418] font-medium">Or reach out directly</p>
          <p className="mt-2 text-gray-600">Email: vadmvolunteersystem@gmail.com</p>
          <p className="text-gray-600">Phone: (434) 977-1025</p>
        </div>
      </div>
    </>
  );
};

export default ContactUs;