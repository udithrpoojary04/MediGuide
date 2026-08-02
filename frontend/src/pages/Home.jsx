import React from 'react';
import { Link } from 'react-router-dom';
import { Stethoscope, Shield, Heart, MapPin, Activity } from 'lucide-react';

const Home = () => {
  return (
    <div className="bg-white">
      {/* Header */}
      <header className="absolute inset-x-0 top-0 z-50">
        <nav className="flex items-center justify-between p-6 lg:px-8" aria-label="Global">
          <div className="flex lg:flex-1">
            <Link to="/" className="-m-1.5 p-1.5 flex items-center">
              <Stethoscope className="h-8 w-8 text-primary-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">MediGuide AI</span>
            </Link>
          </div>
          <div className="flex flex-1 justify-end space-x-4">
            <Link to="/login" className="text-sm font-semibold leading-6 text-gray-900">
              Log in
            </Link>
            <Link
              to="/register"
              className="rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500"
            >
              Get Started
            </Link>
          </div>
        </nav>
      </header>

      <main>
        {/* Hero section */}
        <div className="relative isolate pt-14">
          <div className="py-24 sm:py-32 lg:pb-40">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="mx-auto max-w-2xl text-center">
                <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
                  Understand your symptoms. Find the right care.
                </h1>
                <p className="mt-6 text-lg leading-8 text-gray-600">
                  AI-assisted health information and nearby healthcare discovery in one intelligent platform.
                </p>
                <div className="mt-10 flex items-center justify-center gap-x-6">
                  <Link
                    to="/register"
                    className="rounded-md bg-primary-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
                  >
                    Check Symptoms
                  </Link>
                  <Link to="/healthcare" className="text-sm font-semibold leading-6 text-gray-900">
                    Find Healthcare <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature section */}
        <div className="bg-gray-50 py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl lg:text-center">
              <h2 className="text-base font-semibold leading-7 text-primary-600">Complete Healthcare Companion</h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Everything you need to navigate your health
              </p>
            </div>
            <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
              <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
                <div className="flex flex-col">
                  <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                    <Activity className="h-5 w-5 flex-none text-primary-600" aria-hidden="true" />
                    AI-assisted Information
                  </dt>
                  <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                    <p className="flex-auto">
                      Describe your symptoms using text or voice and receive structured, informative insights about possible causes and urgency levels.
                    </p>
                  </dd>
                </div>
                <div className="flex flex-col">
                  <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                    <MapPin className="h-5 w-5 flex-none text-primary-600" aria-hidden="true" />
                    Healthcare Finder
                  </dt>
                  <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                    <p className="flex-auto">
                      Instantly locate nearby hospitals and clinics based on your current location using OpenStreetMap integration.
                    </p>
                  </dd>
                </div>
                <div className="flex flex-col">
                  <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                    <Shield className="h-5 w-5 flex-none text-primary-600" aria-hidden="true" />
                    Privacy First
                  </dt>
                  <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                    <p className="flex-auto">
                      Your data is yours. We offer complete transparency and the ability to permanently delete your account and all history.
                    </p>
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>

        {/* Disclaimer section */}
        <div className="bg-white py-16">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="rounded-2xl bg-red-50 p-8">
              <h3 className="text-lg font-semibold text-red-800">Medical Disclaimer</h3>
              <p className="mt-2 text-red-700">
                This tool provides general health information and does not provide medical diagnosis. It is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition. If you think you may have a medical emergency, call your doctor, go to the emergency department, or call emergency services immediately.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900" aria-labelledby="footer-heading">
        <h2 id="footer-heading" className="sr-only">
          Footer
        </h2>
        <div className="mx-auto max-w-7xl px-6 pb-8 pt-16 lg:px-8">
          <div className="border-t border-gray-800 pt-8 flex justify-between items-center">
            <p className="text-xs leading-5 text-gray-400">
              &copy; {new Date().getFullYear()} MediGuide AI. All rights reserved.
            </p>
            <div className="flex space-x-6 text-sm text-gray-400">
              <Link to="/about" className="hover:text-white">About</Link>
              <Link to="/privacy" className="hover:text-white">Privacy</Link>
              <Link to="/disclaimer" className="hover:text-white">Disclaimer</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
