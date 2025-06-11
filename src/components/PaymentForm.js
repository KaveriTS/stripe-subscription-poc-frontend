import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import './PaymentForm.css';

const PaymentForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [cardError, setCardError] = useState(null);
  const [cardComplete, setCardComplete] = useState(false);

  // Check if Stripe is properly loaded
  React.useEffect(() => {
    console.log('🔄 PaymentForm Debug Info:');
    console.log('Stripe loaded:', !!stripe);
    console.log('Elements loaded:', !!elements);
    console.log('Stripe publishable key:', process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY ? 'Set ✅' : 'NOT SET ❌');
    console.log('Full key preview:', process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY ? 
      process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY.substring(0, 12) + '...' : 'undefined');
    
    if (stripe && elements) {
      console.log('Stripe Elements should be interactive now');
    } else {
      console.log('Stripe Elements not ready - card field will not be interactive');
    }
  }, [stripe, elements]);

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#1f2937',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif',
        '::placeholder': {
          color: '#9ca3af',
        },
        iconColor: '#6b7280',
      },
      invalid: {
        color: '#ef4444',
        iconColor: '#ef4444',
      },
      complete: {
        color: '#10b981',
        iconColor: '#10b981',
      },
    },
    hidePostalCode: false,
  };

  const handleCardChange = (event) => {
    console.log('Card change event:', event);
    setCardError(event.error ? event.error.message : null);
    setCardComplete(event.complete);
  };

  const handleCardReady = (element) => {
    console.log('Card Element is ready and should accept input');
    // Try to focus the element
    if (element) {
      element.focus();
    }
  };

  const handleCardFocus = () => {
    console.log('Card Element focused');
  };

  const handleCardBlur = () => {
    console.log('Card Element blurred');
  };

  // Show error message if Stripe is not loaded
  if (!stripe || !elements) {
    return (
      <div className="payment-form-component">
        <div className="form-group">
          <label className="form-label">
            Card Information
          </label>
          <div className="stripe-loading-error">
            <div className="alert alert-error">
              <h4>Payment System Loading...</h4>
              <p>
                {!process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY 
                  ? 'Stripe publishable key is not configured. Please set REACT_APP_STRIPE_PUBLISHABLE_KEY in your .env file.'
                  : 'Loading payment system, please wait...'
                }
              </p>
              {!process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY && (
                <div className="setup-instructions">
                  <p><strong>To fix this:</strong></p>
                  <ol>
                    <li>Create a <code>.env</code> file in your project root</li>
                    <li>Add: <code>REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here</code></li>
                    <li>Restart your development server</li>
                  </ol>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-form-component">
      <div className="form-group">
        <label className="form-label">
          Card Information
        </label>
        <div className={`card-element-container ${cardError ? 'error' : ''} ${cardComplete ? 'complete' : ''}`}>
          <CardElement
            options={cardElementOptions}
            onChange={handleCardChange}
            onReady={handleCardReady}
            onFocus={handleCardFocus}
            onBlur={handleCardBlur}
          />
        </div>
        {cardError && (
          <div className="card-error">
            {cardError}
          </div>
        )}
      </div>



      <div className="accepted-cards">
        <span className="accepted-cards-label">We accept:</span>
        <div className="card-icons">
          <span className="card-icon">💳</span>
          <span className="card-brand">Visa</span>
          <span className="card-brand">Mastercard</span>
          <span className="card-brand">American Express</span>
          <span className="card-brand">Discover</span>
        </div>
      </div>
    </div>
  );
};

export default PaymentForm; 