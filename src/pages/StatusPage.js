import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { subscriptionAPI, handleAPIError } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import './StatusPage.css';

const StatusPage = () => {
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [subscriptionData, setSubscriptionData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Get email from navigation state if available
    const emailFromState = location.state?.email;
    if (emailFromState) {
      setEmail(emailFromState);
      checkSubscriptionStatus(emailFromState);
    }
  }, [location.state]);

  const checkSubscriptionStatus = async (emailToCheck = email) => {
    if (!emailToCheck || !emailToCheck.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await subscriptionAPI.getSubscriptionStatus(emailToCheck);
      console.log("API DATA STATUS", data.data.subscriptions);
      setSubscriptionData(data.data);
    } catch (error) {
      console.error('Error checking subscription status:', error);
      
      if (error.message.includes('Network error')) {
        console.error('Failed to fetch subscription data:', error);
        setError({
          message: 'Unable to connect to the server. Please check your internet connection and try again.',
          retry: () => checkSubscriptionStatus(emailToCheck)
        });
        setIsLoading(false);
        return;
      } else {
        setError(handleAPIError(error));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    checkSubscriptionStatus();
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      active: { text: 'Active', class: 'status-active' },
      past_due: {text: 'Past Due', class: 'status-warning' },
      canceled: { text: 'Canceled', class: 'status-error' },
      incomplete: { text: 'Incomplete', class: 'status-warning' },
      incomplete_expired: { text: 'Expired', class: 'status-error' },
      trialing: { text: 'Trial', class: 'status-success' },
      unpaid: { text: 'Unpaid', class: 'status-error' }
    };

    const statusInfo = statusMap[status] || { text: status, class: 'status-default' };
    
    return (
      <span className={`status-badge ${statusInfo.class}`}>
        {statusInfo.text}
      </span>
    );
  };

  const getInvoiceStatusBadge = (status) => {
    const statusMap = {
      paid: { text: 'Paid', class: 'status-success' },
      open: { text: 'Pending', class: 'status-warning' },
      void: { text: 'Void', class: 'status-error' },
      draft: { text: 'Draft', class: 'status-default' }
    };

    const statusInfo = statusMap[status] || { text: status, class: 'status-default' };
    
    return (
      <span className={`status-badge ${statusInfo.class}`}>
        {statusInfo.text}
      </span>
    );
  };

  return (
    <div className="status-page">
      <div className="status-header">
        <h1>Subscription Status</h1>
        <p>Check your current subscription details</p>
      </div>

      <div className="status-content">
        <div className="email-lookup-section">
          <h3>Check Subscription Status</h3>
          <form onSubmit={handleEmailSubmit} className="email-form">
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email Address
              </label>
              <div className="email-input-container">
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input"
                  placeholder="Enter your email address"
                  required
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={isLoading || !email}
                  className="btn btn-primary"
                >
                  {isLoading ? <LoadingSpinner size="small" /> : 'Check Status'}
                </button>
              </div>
            </div>
          </form>
        </div>

        {error && (
          <div className="alert alert-error">
            {error.message}
          </div>
        )}
        {subscriptionData && (
          <div className="subscription-status">
            <div className="subscriptions-list">
              <h3>Active Subscriptions</h3>
              {subscriptionData.subscriptions.map((subscription, index) => (
                <div key={subscription.id} className="subscription-card">
                  <div className="subscription-header">
                    <h4>Subscription #{index + 1}</h4>
                    {getStatusBadge(subscription.status)}
                  </div>
                  <div className="subscription-details">
                    <p><strong>Subscription ID:</strong> {subscription.id}</p>
                    <p><strong>Plan:</strong> {subscription.plan.nickname}</p>
                    <p><strong>Amount:</strong> ${(subscription.plan.amount / 100).toFixed(2)} {subscription.plan.currency.toUpperCase()} / {subscription.plan.interval}</p>
                    <p><strong>Current Period:</strong> {new Date(subscription.current_period_start * 1000).toLocaleDateString()} - {new Date(subscription.current_period_end * 1000).toLocaleDateString()}</p>
                    {subscription.cancel_at_period_end && (
                      <p className="text-warning">This subscription will end at the current period</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!subscriptionData && !isLoading && !error && (
          <div className="empty-state">
            <div className="empty-icon">📊</div>
            <h3>Enter your email to check subscription status</h3>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatusPage; 