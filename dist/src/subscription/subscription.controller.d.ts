import { SubscriptionService } from './subscription.service';
import { Response } from 'express';
export declare class SubscriptionController {
    private readonly subscriptionService;
    constructor(subscriptionService: SubscriptionService);
    seed(): Promise<"Plans already exist." | "Plans seeded successfully.">;
    viewPlans(res: Response): Promise<any>;
    buyPlan(priceId: string, is_metered: string): Promise<{
        type: string;
        client_secret: string;
        url?: undefined;
    } | {
        type: string;
        url: string;
        client_secret?: undefined;
    }>;
    startSubscription(priceId: string, isMetered: string, res: Response): Promise<any>;
    attachCardPage(clientSecret: string): {
        client_secret: string;
    };
    reportUsage(subscriptionItemId: string, quantity: number): Promise<{
        message: string;
    }>;
    meteredBillingPage(): Promise<{
        plan: {
            title: string;
            stripe_subscription_item_id: string;
        };
        currentUsageCount: any;
    }>;
}
