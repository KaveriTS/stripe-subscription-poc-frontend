import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import Header from './components/Header';
import ProductsPage from './pages/ProductsPage';
import SubscriptionPage from './pages/SubscriptionPage';
import StatusPage from './pages/StatusPage';

// Initialize Stripe with Account B publishable key
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY).then((stripe) => {
  if (!stripe) {
    console.error(' Failed to load Stripe. Check your publishable key.');
  } else {
    console.log('Stripe loaded successfully');
  }
  return stripe;
}).catch((error) => {
  console.error('Error loading Stripe:', error);
  return null;
});

function App() {
  return (
    <Elements stripe={stripePromise}>
      <div className="app">
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<ProductsPage />} />
            <Route path="/subscription" element={<SubscriptionPage />} />
            <Route path="/status" element={<StatusPage />} />
          </Routes>
        </main>
      </div>
    </Elements>
  );
}

export default App; 