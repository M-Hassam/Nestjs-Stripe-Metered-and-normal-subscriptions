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
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionController = void 0;
const common_1 = require("@nestjs/common");
const subscription_service_1 = require("./subscription.service");
const express_1 = require("express");
let SubscriptionController = class SubscriptionController {
    constructor(subscriptionService) {
        this.subscriptionService = subscriptionService;
    }
    async seed() {
        return await this.subscriptionService.seedPlans();
    }
    async viewPlans(res) {
        const plans = await this.subscriptionService.getPlans();
        return res.render('plans', { plans });
    }
    async buyPlan(priceId, is_metered) {
        return this.subscriptionService.createCheckoutOrSetupIntent(priceId, is_metered === 'true');
    }
    async startSubscription(priceId, isMetered, res) {
        const result = await this.subscriptionService.createCheckoutOrSetupIntent(priceId, isMetered === 'true');
        if (result.type === 'setup') {
            return res.redirect(`/subscriptions/attach-card?client_secret=${result.client_secret}`);
        }
        else {
            return res.redirect(result.url);
        }
    }
    attachCardPage(clientSecret) {
        return { client_secret: clientSecret };
    }
    async reportUsage(subscriptionItemId, quantity) {
        await this.subscriptionService.reportUsage(subscriptionItemId, quantity);
        return { message: 'Usage reported successfully' };
    }
    async meteredBillingPage() {
        const plan = await this.subscriptionService.getActivePlan();
        const currentUsageCount = await this.subscriptionService.getUsageCount(plan.stripe_subscription_item_id);
        return { plan, currentUsageCount };
    }
};
__decorate([
    (0, common_1.Get)('seed'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SubscriptionController.prototype, "seed", null);
__decorate([
    (0, common_1.Get)('view'),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_a = typeof express_1.Response !== "undefined" && express_1.Response) === "function" ? _a : Object]),
    __metadata("design:returntype", Promise)
], SubscriptionController.prototype, "viewPlans", null);
__decorate([
    (0, common_1.Get)('buy'),
    __param(0, (0, common_1.Query)('priceId')),
    __param(1, (0, common_1.Query)('is_metered')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], SubscriptionController.prototype, "buyPlan", null);
__decorate([
    (0, common_1.Get)('start-subscription'),
    __param(0, (0, common_1.Query)('priceId')),
    __param(1, (0, common_1.Query)('isMetered')),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, typeof (_b = typeof express_1.Response !== "undefined" && express_1.Response) === "function" ? _b : Object]),
    __metadata("design:returntype", Promise)
], SubscriptionController.prototype, "startSubscription", null);
__decorate([
    (0, common_1.Get)('attach-card'),
    (0, common_1.Render)('attach-card'),
    __param(0, (0, common_1.Query)('client_secret')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SubscriptionController.prototype, "attachCardPage", null);
__decorate([
    (0, common_1.Post)('report-usage'),
    __param(0, (0, common_1.Body)('subscriptionItemId')),
    __param(1, (0, common_1.Body)('quantity')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], SubscriptionController.prototype, "reportUsage", null);
__decorate([
    (0, common_1.Get)('metered-billing'),
    (0, common_1.Render)('metered-billing'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SubscriptionController.prototype, "meteredBillingPage", null);
SubscriptionController = __decorate([
    (0, common_1.Controller)('subscriptions'),
    __metadata("design:paramtypes", [subscription_service_1.SubscriptionService])
], SubscriptionController);
exports.SubscriptionController = SubscriptionController;
//# sourceMappingURL=subscription.controller.js.map