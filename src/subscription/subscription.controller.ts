import { Controller, Get, Res, Query, Render, Post, Body } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { Response } from 'express';

@Controller('subscriptions')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Get('seed')
  async seed() {
    return await this.subscriptionService.seedPlans();
  }

  @Get('view')
  async viewPlans(@Res() res: Response) {
    const plans = await this.subscriptionService.getPlans();
    return res.render('plans', { plans });
  }

  @Get('buy')
  async buyPlan(@Query('priceId') priceId: string, @Query('is_metered') is_metered: string) {
    return this.subscriptionService.createCheckoutOrSetupIntent(priceId, is_metered === 'true');
  }

  @Get('start-subscription')
  async startSubscription(@Query('priceId') priceId: string, @Query('isMetered') isMetered: string, @Res() res: Response) {
    const result = await this.subscriptionService.createCheckoutOrSetupIntent(priceId, isMetered === 'true');

    if (result.type === 'setup') {
      return res.redirect(`/subscriptions/attach-card?client_secret=${result.client_secret}`);
    } else {
      return res.redirect(result.url);
    }
  }

  @Get('attach-card')
  @Render('attach-card')
  attachCardPage(@Query('client_secret') clientSecret: string) {
    return { client_secret: clientSecret };
  }

  @Post('report-usage')
  async reportUsage(
    @Body('subscriptionItemId') subscriptionItemId: string,
    @Body('quantity') quantity: number,
  ) {
    await this.subscriptionService.reportUsage(subscriptionItemId, quantity);
    return { message: 'Usage reported successfully' };
  }

  @Get('metered-billing')
  @Render('metered-billing') // EJS view
  async meteredBillingPage() {
    const plan = await this.subscriptionService.getActivePlan();
    const currentUsageCount = await this.subscriptionService.getUsageCount(plan.stripe_subscription_item_id);

    return { plan, currentUsageCount };
  }
}