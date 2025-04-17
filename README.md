# NestJS Stripe Subscription Example

This project demonstrates how to implement Stripe subscriptions using NestJS, including support for both standard and metered billing.

---

## Getting Started

### 1. Clone the Repository

git clone https://github.com/M-Hassam/Nestjs-Stripe-Metered-and-normal-subscriptions.git
cd nestjs-subscriptions

2. Install Dependencies

npm install

3. Create .env File

Create a .env file in the root of the project and add the following variables:

STRIPE_SECRET=sk_test_your_secret_key_here
MONGO_URI=mongodb://localhost:27017/your-db

Replace values with your actual Stripe secret key and MongoDB URI.
🔧 Run the Project

npm run start:dev

The project should now be running on http://localhost:3000.
🛣️ Available Routes
🔹 Seed Subscription Plans

GET /subscriptions/seed

Seeds the Stripe account with dummy plans.
🔹 View Plans Page (EJS)

GET /subscriptions/view

Renders a view of all available subscription plans.
🔹 Buy a Plan

GET /subscriptions/buy?priceId=<PRICE_ID>&is_metered=true|false

Creates a Stripe Checkout Session (standard) or SetupIntent (metered) and returns the appropriate redirect URL.
🔹 Start Subscription (Redirect to Card Page or Checkout)

GET /subscriptions/start-subscription?priceId=<PRICE_ID>&isMetered=true|false

Redirects user to:

    Stripe Checkout (if standard subscription)

    Card Attachment Page (if metered billing)

🔹 Card Attachment Page (EJS)

GET /subscriptions/attach-card?client_secret=<CLIENT_SECRET>

Renders a card setup form using Stripe Elements.
🔹 Metered Billing Page

GET /subscriptions/metered-billing

Shows the current metered plan and usage count with a button to report usage.
🔹 Report Usage (for Metered Billing)

POST /subscriptions/report-usage

Request Body:

{
  "subscriptionItemId": "si_123...",
  "quantity": 1
}

Reports a usage count to Stripe.
📁 Views (EJS Templates)

Make sure you have the following views inside a views/ directory:

    plans.ejs

    attach-card.ejs

    metered-billing.ejs

💡 Notes

    Stripe usage is metered by reporting usage manually (e.g., button click).

    You must use valid Stripe keys and product/price IDs.

    For metered billing, you must attach a card and report usage using the provided endpoint.

