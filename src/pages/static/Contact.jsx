import React from 'react';

const Contact = () => {
  return (
    <div className="min-h-[calc(100vh-64px)] bg-white">
      <div className="container-custom py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Contact</h1>
        <p className="text-gray-600 mb-6">
          We'd love to hear from you. For general inquiries, support, or feedback, reach out using
          the details below.
        </p>
        <div className="grid sm:grid-cols-3 gap-6">
          <div className="card">
            <div className="card-body">
              <h2 className="text-lg font-semibold mb-1">Email</h2>
              <p className="text-gray-600">support@studyhub.com</p>
            </div>
          </div>
          <div className="card">
            <div className="card-body">
              <h2 className="text-lg font-semibold mb-1">Phone</h2>
              <p className="text-gray-600">+1 (555) 123-4567</p>
            </div>
          </div>
          <div className="card">
            <div className="card-body">
              <h2 className="text-lg font-semibold mb-1">Address</h2>
              <p className="text-gray-600">123 Education Ave, Learning City</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
