# Stripe Subscription Frontend (POC)

This is the frontend React application for a proof-of-concept subscription billing system using **Stripe** with support for:

- Selecting a product and plan duration (monthly, weekly, etc.)
- Entering card details securely via Stripe Elements
- Creating subscriptions using a dual Stripe account architecture
- Retry handling and payment status display
---

## Tech Stack

- React.js
- Stripe.js + @stripe/react-stripe-js
- React Router
- Axios (for API communication)
---

## Project Structure

```
src/
├── components/     # Reusable UI components
├── pages/         # Main pages
├── services/      # API layer (Axios instance + service methods)
├── App.js         # App router config
└── index.js       # App entry point
```

## 🏗️ Architecture Overview

This frontend communicates with a Node.js/Express backend that integrates with two Stripe accounts:

- **Stripe Account A**: Manages products, prices, subscriptions, and webhooks
- **Stripe Account B**: Handles payment processing via Stripe Elements


## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd subscription-management-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   
   Update `.env` with your actual values:
   ```env
   # Stripe Configuration (Account B - for payment processing)
   REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_account_b_publishable_key_here
   
   # Backend API Configuration
   REACT_APP_API_BASE_URL=http://localhost:7000/api
   
   REACT_APP_ENVIRONMENT=development
   ```

## Running the Application

 **Development mode**
   ```bash
   npm start
   ```
   The application will open at `http://localhost:3000`


## Application Flow
- User visits the Products Page → selects a plan (daily, weekly, monthly)
- On clicking "Buy Now", navigates to subscription page
- Enters email and card details securely using Stripe Elements
- Submits the form → triggers createSubscription() API
- Backend creates customer + subscription & returns success/failure
- User is redirected to status page showing latest status
- If payment fails, user receives Stripe's hosted invoice link in their registered email

## Key Integrations
- Stripe Elements for PCI-compliant card entry
- Stripe dual account support:
   - Account A handles subscription + invoices
   - Account B handles payment capture
- Hosted invoice links used for retrying failed payments

*This project was created for a hands-on understanding of subscription systems using Stripe's APIs and manual invoice capture via split accounts.*