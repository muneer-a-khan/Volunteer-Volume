'use client';
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

const faqs = [
  {
    question: "How do I create an account?",
    answer:
      "To create an account, simply click on the 'Register' button located at the top right corner of the homepage. Once you input your name, email, and password, you will need to fill out the volunteer registration form.",
  },
  {
    question: "Do I need to provide my real name to sign up?",
    answer:
      "You are required to use your real name as a volunteer to ensure clarity and ease of administration. However, your account will remain secure. Be sure to remember the information you provide for account recovery purposes.",
  },
  {
    question: "What should I do if I forget my password?",
    answer:
      "If you've forgotten your password, click on the 'Forgot Password?' link on the sign in page. Enter your registered email address, and we'll send you a password reset link to help you regain access to your account.",
  },
  {
    question: "Is my personal information safe?",
    answer:
      "Yes! We take your privacy seriously and use advanced encryption to protect your personal information. We will never share your information without your consent. Please refer to our Privacy Policy for more details on how we protect your data.",
  },
  {
    question: "Can I sign up using my Google account?",
    answer:
      "No, unfortunately. To register for an account, you will need to input your name, email, and password.",
  },
  {
    question: "Can I delete my account?",
    answer:
      "Yes, to do so, please contact our support team through the 'Contact' page, and we'll assist you in closing your account. Please note that once your account is deleted, it cannot be recovered.",
  },
  {
    question: "I'm having trouble signing up. What should I do?",
    answer:
      "If you're having trouble signing up, please double-check the information you've entered for any errors, especially your email address and password. If the issue persists, try refreshing the page or clearing your browser's cache. For further assistance, feel free to reach out to our support team at vadmvolunteersystem@gmail.com.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white text-purple-900 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-center mb-4">Frequently Asked Questions (FAQs)</h2>
      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div key={index} className="border border-purple-300 rounded-lg">
            <button
              className="w-full flex justify-between items-center p-4 text-left bg-purple-100 hover:bg-purple-200 focus:outline-none"
              onClick={() => toggleFAQ(index)}
            >
              <span className="font-semibold">{faq.question}</span>
              {openIndex === index ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            {openIndex === index && (
              <div className="p-4 bg-white text-gray-700 border-t border-purple-300">
                {faq.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}