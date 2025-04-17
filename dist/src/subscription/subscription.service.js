"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const subscription_entity_1 = require("./subscription.entity");
const stripe_1 = require("stripe");
const dotenv = require("dotenv");
dotenv.config();
const stripe = new stripe_1.default(process.env.STRIPE_SECRET || '', {
    apiVersion: '2022-11-15',
});
let SubscriptionService = class SubscriptionService {
    constructor(subModel) {
        this.subModel = subModel;
    }
    async getActivePlan() {
        return {
            title: 'Monthly Plan',
            stripe_subscription_item_id: 'si_XXXXXX',
        };
    }
    async getUsageCount(subscriptionItemId) {
        try {
            const usage = await stripe.subscriptionItems.listUsageRecordSummaries(subscriptionItemId, { limit: 1 });
            return usage.data.length ? usage.data[0].total_usage : 0;
        }
        catch (error) {
            console.error('Error fetching usage records:', error);
            throw error;
        }
    }
    async reportUsage(subscriptionItemId, quantity) {
        try {
            await stripe.subscriptionItems.createUsageRecord(subscriptionItemId, {
                quantity,
                timestamp: Math.floor(Date.now() / 1000),
                action: 'increment',
            });
        }
        catch (error) {
            console.error('Error reporting usage:', error);
            throw error;
        }
    }
    async seedPlans() {
        const count = await this.subModel.countDocuments();
        if (count > 0)
            return 'Plans already exist.';
        const plans = [
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
                        interval: plan.type,
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
    async createCheckoutOrSetupIntent(priceId, isMetered) {
        if (isMetered) {
            const customer = await stripe.customers.create();
            const setupIntent = await stripe.setupIntents.create({
                customer: customer.id,
                payment_method_types: ['card'],
            });
            return {
                type: 'setup',
                client_secret: setupIntent.client_secret,
            };
        }
        else {
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
};
SubscriptionService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(subscription_entity_1.Subscription.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], SubscriptionService);
exports.SubscriptionService = SubscriptionService;
//# sourceMappingURL=subscription.service.js.map