import React from 'react';

const Pricing = () => {
  const plans = [
    { name: 'Free', price: '$0', features: ['Browse notes', 'Basic search', 'Limited AI tools'] },
    { name: 'Pro', price: '$9/mo', features: ['Everything in Free', 'Full AI tools', 'Unlimited uploads'] },
    { name: 'Premium', price: '$19/mo', features: ['Pro features', 'Priority support', 'Advanced analytics'] },
  ];

  return (
    <div className="min-h-[calc(100vh-64px)] bg-white">
      <div className="container-custom py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Pricing</h1>
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div key={plan.name} className="card">
              <div className="card-body">
                <h2 className="text-xl font-semibold mb-2">{plan.name}</h2>
                <p className="text-3xl font-extrabold text-navy-600 mb-4">{plan.price}</p>
                <ul className="text-gray-600 space-y-1">
                  {plan.features.map((f) => (
                    <li key={f}>• {f}</li>
                  ))}
                </ul>
                <button className="btn btn-primary btn-md w-full mt-6">Choose {plan.name}</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Pricing;

