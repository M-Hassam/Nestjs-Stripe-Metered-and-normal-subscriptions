import { Model } from 'mongoose';
import { Subscription } from './subscription.entity';
export declare class SubscriptionService {
    private subModel;
    constructor(subModel: Model<Subscription>);
    getActivePlan(): Promise<{
        title: string;
        stripe_subscription_item_id: string;
    }>;
    getUsageCount(subscriptionItemId: string): Promise<any>;
    reportUsage(subscriptionItemId: string, quantity: number): Promise<void>;
    seedPlans(): Promise<"Plans already exist." | "Plans seeded successfully.">;
    getPlans(): Promise<(Subscription & {
        _id: import("mongoose").Types.ObjectId;
    })[]>;
    createCheckoutOrSetupIntent(priceId: string, isMetered: boolean): Promise<{
        type: string;
        client_secret: string;
        url?: undefined;
    } | {
        type: string;
        url: string;
        client_secret?: undefined;
    }>;
}
