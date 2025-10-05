import React from 'react';
import { Link } from 'react-router-dom';
import { 
  AcademicCapIcon,
  BookOpenIcon,
  BeakerIcon,
  VideoCameraIcon,
  BriefcaseIcon,
  ArrowRightIcon,
  SparklesIcon,
  UserGroupIcon,
  DocumentTextIcon,
  ChartBarIcon,
  StarIcon,
  BuildingLibraryIcon,
  TagIcon,
  FireIcon,
  ArrowUpTrayIcon
} from '@heroicons/react/24/outline';
import { 
  LightBulbIcon,
  CpuChipIcon,
  DocumentDuplicateIcon
} from '@heroicons/react/24/solid';

const Home = () => {
  // For now, we'll assume user is not logged in
  // This will be properly implemented when Firebase auth is set up
  const currentUser = null;

  const quickLinks = [
    {
      title: 'Universities',
      description: 'Browse notes from top universities',
      icon: BuildingLibraryIcon,
      href: '/notes?filter=university',
      color: 'bg-blue-100 text-blue-600'
    },
    {
      title: 'Departments',
      description: 'Find notes by department and subject',
      icon: TagIcon,
      href: '/notes?filter=department',
      color: 'bg-green-100 text-green-600'
    },
    {
      title: 'Trending',
      description: 'Most popular notes this week',
      icon: FireIcon,
      href: '/notes?filter=trending',
      color: 'bg-red-100 text-red-600'
    },
    {
      title: 'Upload',
      description: 'Share your notes and earn rewards',
      icon: ArrowUpTrayIcon,
      href: '/upload',
      color: 'bg-purple-100 text-purple-600'
    }
  ];

  const features = [
    {
      title: 'AI-Powered Summaries',
      description: 'Get instant, intelligent summaries of complex study materials',
      icon: LightBulbIcon,
      color: 'text-yellow-500'
    },
    {
      title: 'Smart MCQ Generator',
      description: 'Practice with AI-generated questions tailored to your notes',
      icon: CpuChipIcon,
      color: 'text-blue-500'
    },
    {
      title: 'Interactive Flashcards',
      description: 'Create and study with smart flashcards for better retention',
      icon: DocumentDuplicateIcon,
      color: 'text-green-500'
    }
  ];

  const stats = [
    { label: 'Active Students', value: '50K+', icon: UserGroupIcon },
    { label: 'Study Materials', value: '100K+', icon: DocumentTextIcon },
    { label: 'Universities', value: '500+', icon: BuildingLibraryIcon },
    { label: 'Success Rate', value: '95%', icon: ChartBarIcon }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Computer Science Student',
      university: 'MIT',
      content: 'StudyHub has been a game-changer for my studies. The AI tools help me understand complex topics quickly.',
      rating: 5
    },
    {
      name: 'Michael Chen',
      role: 'Medical Student',
      university: 'Harvard Medical School',
      content: 'The quality of notes and the AI-generated MCQs have significantly improved my exam preparation.',
      rating: 5
    },
    {
      name: 'Emily Davis',
      role: 'Business Student',
      university: 'Wharton School',
      content: 'I love how easy it is to find relevant study materials and the internship matching feature is brilliant!',
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-navy-600 via-navy-500 to-accent-600 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-accent-400/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-navy-400/20 rounded-full blur-3xl"></div>
        </div>
        
        <div className="container-custom relative z-10 py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
                <SparklesIcon className="h-5 w-5 text-accent-400 mr-2" />
                <span className="text-sm font-medium">AI-Powered Learning Platform</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight">
                Study Smarter,
                <span className="text-accent-400"> Not Harder</span>
              </h1>
              
              <p className="text-lg md:text-xl text-gray-200 mb-8 leading-relaxed">
                Access premium university notes, AI-powered study tools, video lectures, 
                and internship opportunities all in one platform.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link
                  to="/notes"
                  className="btn btn-primary btn-lg flex items-center justify-center"
                >
                  Explore Notes
                  <ArrowRightIcon className="ml-2 h-5 w-5" />
                </Link>
                <Link
                  to="/tools"
                  className="btn btn-subtle btn-lg"
                >
                  Try AI Tools
                </Link>
              </div>
            </div>
            
            <div className="hidden lg:block">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-accent-400/20 to-navy-400/20 rounded-3xl blur-2xl"></div>
                <img
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600"
                  alt="Students studying"
                  className="relative rounded-3xl shadow-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Links Section */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Quick Access</h2>
            <p className="text-lg text-gray-600">Start exploring our vast collection of study materials</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickLinks.map((link, index) => (
              <Link
                key={index}
                to={link.href}
                className="card hover:scale-105 transition-transform duration-300"
              >
                <div className="card-body">
                  <div className={`w-12 h-12 rounded-xl ${link.color} flex items-center justify-center mb-4`}>
                    <link.icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{link.title}</h3>
                  <p className="text-sm text-gray-600">{link.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* AI Tools Teaser */}
      <section className="py-16 bg-gradient-to-br from-accent-50 to-navy-50">
        <div className="container-custom">
          <div className="text-center mb-12">
            <div className="inline-flex items-center bg-accent-100 rounded-full px-4 py-2 mb-4">
              <BeakerIcon className="h-5 w-5 text-accent-600 mr-2" />
              <span className="text-sm font-medium text-accent-700">Powered by Advanced AI</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              AI Study Tools That Actually Help
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Transform your study materials into powerful learning resources with our suite of AI-powered tools
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-lg mb-4">
                  <feature.icon className={`h-8 w-8 ${feature.color}`} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Link
              to={currentUser ? "/tools" : "/signup"}
              className="btn btn-primary btn-lg inline-flex items-center"
            >
              Try AI Tools Now
              <SparklesIcon className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-navy-600 text-white">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <stat.icon className="h-8 w-8 text-accent-400 mx-auto mb-2" />
                <div className="text-3xl font-bold mb-1">{stat.value}</div>
                <div className="text-sm text-gray-300">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">What Students Say</h2>
            <p className="text-lg text-gray-600">Join thousands of successful students</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="card">
                <div className="card-body">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <StarIcon key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-4 italic">"{testimonial.content}"</p>
                  <div className="border-t pt-4">
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                    <p className="text-sm text-accent-600">{testimonial.university}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-accent-500 to-accent-600 text-white">
        <div className="container-custom text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Transform Your Learning?
          </h2>
          <p className="text-xl mb-8 text-white/90">
            Join StudyHub today and get instant access to all features
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {currentUser ? (
              <Link
                to="/dashboard"
                className="btn bg-white text-accent-600 hover:bg-gray-100 btn-lg"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/signup"
                  className="btn bg-white text-accent-600 hover:bg-gray-100 btn-lg"
                >
                  Start Free Trial
                </Link>
                <Link
                  to="/notes"
                  className="btn btn-subtle btn-lg"
                >
                  Browse Notes First
                </Link>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
