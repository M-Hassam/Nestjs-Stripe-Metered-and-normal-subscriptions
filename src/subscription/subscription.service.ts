import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Subscription } from './subscription.entity';
import Stripe from 'stripe';
import * as dotenv from 'dotenv';

dotenv.config();
const stripe = new Stripe(process.env.STRIPE_SECRET || '', {
  apiVersion: '2024-04-10', // Official stable version for Stripe v18
});


interface PlanInput {
  title: string;
  description: string;
  is_free: string;
  duration: string;
  type: string;
  no_credits: number;
  is_unlimited: string;
  plan_limit: number | null;
  price: number;
  status: string;
  is_metered: boolean;
  stripe_price_id?: string; // Optional
}

@Injectable()


export class SubscriptionService {
  constructor(
    @InjectModel(Subscription.name) private subModel: Model<Subscription>,
  ) {}

  async getActivePlan() {
    // Fetch the active plan. You may need to query your database here.
    return {
      title: 'Monthly Plan',
      stripe_subscription_item_id: 'si_XXXXXX', // This should be the subscription item ID stored in your DB.
    };
  }

  async getUsageCount(subscriptionItemId: string) {
    try {
      const usage = await stripe.subscriptionItems.listUsageRecordSummaries(
        subscriptionItemId,
        { limit: 1 }
      );
      return usage.data.length ? usage.data[0].total_usage : 0;
    } catch (error) {
      console.error('Error fetching usage records:', error);
      throw error;
    }
  }

  async reportUsage(subscriptionItemId: string, quantity: number) {
    try {
      await stripe.subscriptionItems.createUsageRecord(
        subscriptionItemId,
        {
          quantity,
          timestamp: Math.floor(Date.now() / 1000),
          action: 'increment',
        }
      );
    } catch (error) {
      console.error('Error reporting usage:', error);
      throw error;
    }
  }

  async seedPlans() {
    const count = await this.subModel.countDocuments();
    if (count > 0) return 'Plans already exist.';

    const plans: PlanInput[] = [
      {
        title: 'Free Plan',
        description: '5-day free trial with full access.',
        is_free: 'yes',
        duration: '1',
        type: 'week',
        no_credits: 0,
        is_unlimited: 'no',
        plan_limit: 10,
        price: 0,
        status: 'active',
        is_metered: false,
      },
      {
        title: 'Monthly Plan',
        description: 'All access with monthly billing.',
        is_free: 'no',
        duration: '1',
        type: 'month',
        no_credits: 0,
        is_unlimited: 'no',
        plan_limit: 30,
        price: 24.99,
        status: 'active',
        is_metered: false,
      },
      {
        title: 'Annual Plan',
        description: 'Save 20% with yearly billing.',
        is_free: 'no',
        duration: '1',
        type: 'year',
        no_credits: 0,
        is_unlimited: 'yes',
        plan_limit: null,
        price: 239.5,
        status: 'active',
        is_metered: false,
      },
      {
        title: 'Ava Prime',
        description: 'Pay-as-you-go metered billing.',
        is_free: 'no',
        duration: '1',
        type: 'month',
        no_credits: 0,
        is_unlimited: 'no',
        plan_limit: null,
        price: 0,
        status: 'active',
        is_metered: true,
      },
    ];

    for (const plan of plans) {
      if (plan.price > 0 || plan.is_metered) {
        const product = await stripe.products.create({
          name: plan.title,
          description: plan.description,
        });

        const stripePrice = await stripe.prices.create({
          unit_amount: plan.is_metered ? 100 : Math.round(plan.price * 100),
          currency: 'usd',
          recurring: {
            interval: plan.type as Stripe.Price.Recurring.Interval,
            usage_type: plan.is_metered ? 'metered' : 'licensed',
          },
          billing_scheme: 'per_unit',
          product: product.id,
        });

        plan.stripe_price_id = stripePrice.id;
      }

      await this.subModel.create(plan);
    }

    return 'Plans seeded successfully.';
  }

  async getPlans() {
    return this.subModel.find();
  }

  async createCheckoutOrSetupIntent(priceId: string, isMetered: boolean) {
  if (isMetered) {
    const customer = await stripe.customers.create(); // You can use real user info here

    const setupIntent = await stripe.setupIntents.create({
      customer: customer.id,
      payment_method_types: ['card'],
    });

    return {
      type: 'setup',
      client_secret: setupIntent.client_secret,
    };
  } else {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: 'http://localhost:3000/success',
      cancel_url: 'http://localhost:3000/cancel',
    });

    return {
      type: 'checkout',
      url: session.url,
    };
  }
  
}

}
