import React from 'react';

const FAQ = () => {
  const faqs = [
    { q: 'What is StudyHub?', a: 'A platform offering premium notes, AI tools, and learning resources.' },
    { q: 'Is there a free plan?', a: 'Yes, you can browse notes and try basic tools for free.' },
    { q: 'How do I upload notes?', a: 'Create an account, verify your email, and use the Upload page.' },
  ];

  return (
    <div className="min-h-[calc(100vh-64px)] bg-white">
      <div className="container-custom py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h1>
        <div className="space-y-4">
          {faqs.map((item, idx) => (
            <div key={idx} className="card">
              <div className="card-body">
                <h3 className="font-semibold text-gray-900 mb-2">{item.q}</h3>
                <p className="text-gray-600">{item.a}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FAQ;

