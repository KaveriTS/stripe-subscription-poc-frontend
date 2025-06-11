import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { subscriptionAPI, handleAPIError } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import PaymentForm from '../components/PaymentForm';
import './SubscriptionPage.css';

const SubscriptionPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const stripe = useStripe();
  const elements = useElements();

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedPriceId, setSelectedPriceId] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    const productFromState = location.state?.selectedProduct;
    if (productFromState) {
      setSelectedProduct(productFromState);
      if (productFromState.prices && productFromState.prices.length > 0) {
        setSelectedPriceId(productFromState.prices[0].id);
      }
    } else {
      // Redirect to products page if no product selected
      navigate('/');
    }
  }, [location.state, navigate]);

  const formatPrice = (amount, currency = 'usd') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  const getIntervalLabel = (interval) => {
    switch (interval) {
      case 'day': return 'Daily';
      case 'week': return 'Weekly';
      case 'month': return 'Monthly';
      case 'quarter': return 'Quarterly';
      case 'year': return 'Yearly';
      default: return interval;
    }
  };

  const getSelectedPrice = () => {
    return selectedProduct?.prices?.find(p => p.id === selectedPriceId);
  };

  const handleEmailChange = (e) => {
    setCustomerEmail(e.target.value);
    setPaymentError(null);
  };

  const handlePriceChange = (priceId) => {
    setSelectedPriceId(priceId);
    setPaymentError(null);
  };

  const validateForm = () => {
    if (!customerEmail || !customerEmail.includes('@')) {
      setPaymentError('Please enter a valid email address');
      return false;
    }

    if (!selectedPriceId) {
      setPaymentError('Please select a pricing plan');
      return false;
    }

    if (!stripe || !elements) {
      setPaymentError('Payment system not loaded. Please refresh the page.');
      return false;
    }

    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsProcessing(true);
    setPaymentError(null);

    try {
      const cardElement = elements.getElement(CardElement);

      // Create payment method using Stripe Account B
      const { error: paymentMethodError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: {
          email: customerEmail,
        },
      });

      if (paymentMethodError) {
        throw new Error(paymentMethodError.message);
      }

      const subscriptionData = {
        email: customerEmail,
        priceId: selectedPriceId,
        paymentMethodId: paymentMethod.id,
        productId: selectedProduct.id,
      };

      const result = await subscriptionAPI.createSubscription(subscriptionData);
      
      console.log('Subscription created successfully:', result);
      setPaymentSuccess(true);

      // Redirect to status page after a delay
      setTimeout(() => {
        navigate('/status', { 
          state: { 
            email: customerEmail,
            subscriptionId: result.subscriptionId 
          } 
        });
      }, 2000);

    } catch (error) {
      console.error('Payment processing error:', error);
      setPaymentError(handleAPIError(error));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBackToProducts = () => {
    navigate('/');
  };

  if (!selectedProduct) {
    return (
      <div className="subscription-page">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-2">Loading subscription details...</p>
        </div>
      </div>
    );
  }

  if (paymentSuccess) {
    return (
      <div className="subscription-page">
        <div className="success-container">
          <div className="success-icon">✅</div>
          <h2>Subscription Created Successfully!</h2>
          <p>Thank you for subscribing to {selectedProduct.name}.</p>
          <p>Redirecting to your subscription status...</p>
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className="subscription-page">
      <div className="subscription-container">
        <div className="subscription-header">
          <button 
            onClick={handleBackToProducts}
            className="back-button"
          >
            ← Back to Plans
          </button>
          <h1>Complete Your Subscription</h1>
          <p>You're subscribing to <strong>{selectedProduct.name}</strong></p>
        </div>

        <div className="subscription-content">
          <div className="plan-summary">
            <h3>Plan Summary</h3>
            <div className="selected-product">
              <h4>{selectedProduct.name}</h4>
              <p>{selectedProduct.description}</p>
            </div>

            {selectedProduct.prices && selectedProduct.prices.length > 1 ? (
              <div className="pricing-options">
                <h4>Choose Billing Frequency</h4>
                {selectedProduct.prices?.map((price) => (
                  <label key={price.id} className="price-option-label">
                    <input
                      type="radio"
                      name="pricing"
                      value={price.id}
                      checked={selectedPriceId === price.id}
                      onChange={() => handlePriceChange(price.id)}
                    />
                    <div className="price-option-content">
                      <span className="price-interval">{getIntervalLabel(price.interval)}</span>
                      <span className="price-amount">{formatPrice(price.amount, price.currency)}</span>
                    </div>
                  </label>
                ))}
              </div>
            ) : (
              <div className="selected-plan-info">
                <h4>Selected Plan</h4>
                {getSelectedPrice() && (
                  <div className="selected-plan-display">
                    <span className="plan-interval">{getIntervalLabel(getSelectedPrice().interval)}</span>
                    <span className="plan-price">{formatPrice(getSelectedPrice().amount, getSelectedPrice().currency)}</span>
                  </div>
                )}
              </div>
            )}

            {getSelectedPrice() && (
              <div className="total-summary">
                <div className="summary-row">
                  <span>Plan:</span>
                  <span>{selectedProduct.name}</span>
                </div>
                <div className="summary-row">
                  <span>Billing:</span>
                  <span>{getIntervalLabel(getSelectedPrice().interval)}</span>
                </div>
                <div className="summary-row total">
                  <span>Total:</span>
                  <span>{formatPrice(getSelectedPrice().amount, getSelectedPrice().currency)}</span>
                </div>
              </div>
            )}
          </div>

          <div className="payment-section">
            <h3>Payment Information</h3>
            
            {paymentError && (
              <div className="alert alert-error">
                {paymentError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="payment-form">
              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={customerEmail}
                  onChange={handleEmailChange}
                  className="form-input"
                  placeholder="your@email.com"
                  required
                  disabled={isProcessing}
                />
              </div>

              <PaymentForm />



              <button
                type="submit"
                disabled={!stripe || isProcessing || !customerEmail || !selectedPriceId}
                className="btn btn-primary btn-large w-full"
              >
                {isProcessing ? (
                  <>
                    <LoadingSpinner size="small" />
                    <span className="ml-2">Processing...</span>
                  </>
                ) : (
                  `Subscribe for ${getSelectedPrice() ? formatPrice(getSelectedPrice().amount, getSelectedPrice().currency) : ''}`
                )}
              </button>

              <div className="payment-security">
                <p>Your payment information is secure and encrypted</p>
                <p>Powered by Stripe</p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPage; 