import React from 'react';
import { CheckIcon, StarIcon } from '@heroicons/react/24/solid';
import { SparklesIcon } from '@heroicons/react/24/outline';

const Pricing = () => {
  const plans = [
    {
      name: 'Free',
      price: '₹0',
      period: 'Forever',
      description: 'Perfect for getting started with DUXE',
      features: [
        'Limited preview of notes',
        'AI access (only summarization)',
        'Basic search functionality',
        'Community support'
      ],
      popular: false,
      buttonText: 'Get Started Free',
      buttonClass: 'btn btn-secondary btn-md w-full'
    },
    {
      name: 'Standard',
      price: '₹100',
      period: 'per month',
      description: 'Unlock the full power of AI-driven learning',
      features: [
        'All features of Free plan',
        'AI MCQ generation',
        'AI mapping notes',
        'OpenAI GPT-4o mini access',
        'Text-to-speech (reading voice aloud)',
        'AI question generation',
        'Unlimited note uploads',
        'Priority email support'
      ],
      popular: true,
      buttonText: 'Choose Standard',
      buttonClass: 'btn btn-primary btn-md w-full'
    },
    {
      name: 'Premium',
      price: '₹400',
      period: 'per month',
      description: 'Complete learning ecosystem with premium features',
      features: [
        'All features of Standard plan',
        'Internship access',
        'Video lectures library',
        'Advanced AI analytics',
        'Personalized learning paths',
        'Premium content access',
        'Live doubt sessions',
        '24/7 priority support'
      ],
      popular: false,
      buttonText: 'Choose Premium',
      buttonClass: 'btn btn-primary btn-md w-full bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700'
    }
  ];

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-br from-gray-50 to-white">
      <div className="container-custom py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-4">
            <SparklesIcon className="h-8 w-8 text-accent-500 mr-2" />
            <h1 className="text-4xl md:text-5xl font-bold text-gradient">Choose Your Plan</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Unlock your learning potential with DUXE's powerful AI-driven platform. 
            Start free or upgrade for advanced features.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {plans.map((plan, index) => (
            <div 
              key={plan.name} 
              className={`relative bg-white rounded-3xl shadow-card hover:shadow-card-hover transition-all duration-300 transform hover:-translate-y-2 ${
                plan.popular ? 'border-2 border-accent-500 scale-105' : 'border border-gray-200'
              }`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-accent-500 to-accent-600 text-white px-6 py-2 rounded-full text-sm font-medium flex items-center">
                    <StarIcon className="h-4 w-4 mr-1" />
                    Most Popular
                  </div>
                </div>
              )}

              <div className="p-8">
                {/* Plan Header */}
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-600 mb-6">{plan.description}</p>
                  
                  <div className="mb-6">
                    <div className="flex items-baseline justify-center">
                      <span className="text-5xl font-extrabold text-navy-600">{plan.price}</span>
                      {plan.period !== 'Forever' && (
                        <span className="text-gray-500 ml-2">/{plan.period.split(' ')[1]}</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{plan.period}</p>
                  </div>
                </div>

                {/* Features List */}
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <CheckIcon className="h-5 w-5 text-accent-500 mt-0.5 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <button className={plan.buttonClass}>
                  {plan.buttonText}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16 p-8 bg-gradient-to-r from-navy-50 to-accent-50 rounded-3xl">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Need a custom plan?
          </h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Looking for enterprise features or have specific requirements? 
            Let's discuss a plan that fits your institution's needs.
          </p>
          <button className="btn btn-secondary btn-lg">
            Contact Sales
          </button>
        </div>

        {/* FAQ Teaser */}
        <div className="text-center mt-12">
          <p className="text-gray-600">
            Have questions? Check out our{' '}
            <a href="/faq" className="text-accent-500 hover:text-accent-600 font-medium">
              Frequently Asked Questions
            </a>
            {' '}or{' '}
            <a href="/contact" className="text-accent-500 hover:text-accent-600 font-medium">
              contact us
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
};

export default Pricing;

