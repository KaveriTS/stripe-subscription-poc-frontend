import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { subscriptionAPI, handleAPIError } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import './ProductsPage.css';

const ProductsPage = () => {
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [clickedPriceId, setClickedPriceId] = useState(null);

  useEffect(() => {
    loadProduct();
  }, []);

  const loadProduct = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await subscriptionAPI.getProducts();
      
      if (response.data && response.data.products && response.data.products.length > 0) {
        const productData = response.data.products[0]; // Get the first product
        setProduct({
          id: productData.id,
          name: productData.name,
          description: productData.description,
          prices: productData.prices || [],
          currency: 'usd'
        });
      } else {
        throw new Error('No products found');
      }
    } catch (error) {
      console.error('Error loading product:', error);
      setError(handleAPIError(error));
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (amount, currency = 'usd') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  const getPlaceholderPrice = (interval) => {
    // Fallback prices if amount is not available
    switch (interval) {
      case 'day': return 100; 
      case 'week': return 1000; 
      case 'month': return 10000;
      default: return 1000;
    }
  };

  const getPriceAmount = (price) => {
    if (price.amount && !isNaN(price.amount) && price.amount > 0) {
      return price.amount;
    }
    return getPlaceholderPrice(price.interval);
  };

  const getIntervalLabel = (interval, intervalCount = 1) => {
    const labels = {
      'day': intervalCount === 1 ? 'Daily' : `Every ${intervalCount} days`,
      'week': intervalCount === 1 ? 'Weekly' : `Every ${intervalCount} weeks`, 
      'month': intervalCount === 1 ? 'Monthly' : `Every ${intervalCount} months`,
      'year': intervalCount === 1 ? 'Yearly' : `Every ${intervalCount} years`
    };
    return labels[interval] || interval;
  };

  const handleBuyNow = async (selectedPrice) => {
    if (!product || !selectedPrice || clickedPriceId) return; // Prevent double clicks
    
    setClickedPriceId(selectedPrice.id);
    
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const priceWithAmount = {
      ...selectedPrice,
      amount: getPriceAmount(selectedPrice)
    };
    
    navigate('/subscription', { 
      state: { 
        selectedProduct: {
          ...product,
          prices: [priceWithAmount]
        }
      } 
    });
  };

  if (isLoading) {
    return (
      <div className="products-page">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-2">Loading product...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="products-page">
        <div className="alert alert-error">
          <h3>Unable to Load Product</h3>
          <p>{error}</p>
          <button 
            onClick={loadProduct} 
            className="btn btn-primary mt-2"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="products-page">
        <div className="alert alert-error">
          <h3>No Product Available</h3>
          <p>No products are currently available.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="products-page">
      <div className="products-header">
        <h1>{product.name}</h1>
        <p>{product.description}</p>
      </div>

      <div className="pricing-plans-container">
        <h2>Choose Your Plan</h2>
        <div className="pricing-plans-grid">
          {product.prices.map((price, index) => (
            <div key={price.id} className="pricing-plan-card">
              <div className="plan-header">
                <h3>{getIntervalLabel(price.interval, price.intervalCount)}</h3>
                                 <div className="plan-price">
                   <span className="price-amount">
                     {formatPrice(getPriceAmount(price), price.currency)}
                   </span>
                   <span className="price-period">/{price.interval}</span>
                 </div>
              </div>

              <div className="plan-features">
                <ul>
                  <li>All premium features</li>
                  <li>Priority support</li>
                  <li>Exclusive tools</li>
                  <li>No limits</li>
                </ul>
              </div>

              <button 
                onClick={() => handleBuyNow(price)}
                disabled={clickedPriceId !== null}
                className={`btn btn-large w-full ${
                  clickedPriceId === price.id 
                    ? 'btn-clicked' 
                    : clickedPriceId 
                      ? 'btn-disabled' 
                      : 'btn-primary'
                }`}
              >
                {clickedPriceId === price.id ? (
                  <>
                    <LoadingSpinner size="small" />
                    <span className="ml-2">Processing...</span>
                  </>
                ) : (
                  'Buy Now'
                )}
              </button>
            </div>
          ))}
        </div>

        {product.prices.length === 0 && (
          <div className="no-pricing">
            <p>No pricing plans available at the moment.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductsPage; 