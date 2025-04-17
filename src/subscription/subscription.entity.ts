import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Subscription extends Document {
  @Prop() title: string;
  @Prop() description: string;
  @Prop() is_free: string;
  @Prop() duration: string;
  @Prop() type: 'day' | 'week' | 'month' | 'year'; // Ensure valid types
  @Prop() no_credits: number;
  @Prop() is_unlimited: string;
  @Prop() plan_limit: number;
  @Prop() price: number;
  @Prop() status: string;
  @Prop() is_metered: boolean;
  @Prop() stripe_price_id?: string; // Added stripe_price_id
}

export const SubscriptionSchema = SchemaFactory.createForClass(Subscription);
