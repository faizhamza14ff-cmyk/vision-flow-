import React, { useState } from 'react';
import { Check, Sparkles, Zap, ShieldCheck, HelpCircle } from 'lucide-react';
import { PricingPlanId, UserProfile } from '../types';

interface PricingSectionProps {
  user: UserProfile;
  onUpgradePlan: (plan: PricingPlanId, creditsToAdd: number) => void;
  showToast: (type: 'success' | 'error' | 'info' | 'warning', title: string, message: string) => void;
}

export const PricingSection: React.FC<PricingSectionProps> = ({
  user,
  onUpgradePlan,
  showToast,
}) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const plans = [
    {
      id: 'free' as PricingPlanId,
      name: 'Free',
      badge: 'Starter',
      priceMonthly: 0,
      priceYearly: 0,
      description: 'Test out generative video with basic quality and watermark.',
      features: [
        'Limited generations (5 credits/month)',
        '720p HD resolution',
        'VisionFlow AI watermark',
        'Standard generation queue',
        'Standard camera angles',
        'Community gallery access',
      ],
      credits: 5,
      isPopular: false,
      buttonText: user.plan === 'free' ? 'Current Plan' : 'Downgrade to Free',
    },
    {
      id: 'pro' as PricingPlanId,
      name: 'Pro',
      badge: 'Most Popular',
      priceMonthly: 29,
      priceYearly: 23,
      description: 'For creators, influencers, and marketers needing high-definition cinematic output.',
      features: [
        '150 generation credits / month',
        '1080p Full HD resolution',
        'No watermark on any video',
        'Faster generation (Turbo GPU cluster)',
        'Commercial usage rights',
        'All 7 cinematic video styles',
        'Advanced camera motion controls',
        'Priority email support',
      ],
      credits: 150,
      isPopular: true,
      buttonText: user.plan === 'pro' ? 'Current Plan' : 'Upgrade to Pro',
    },
    {
      id: 'ultimate' as PricingPlanId,
      name: 'Ultimate',
      badge: 'Maximum Power',
      priceMonthly: 79,
      priceYearly: 63,
      description: 'For professional studios, filmmakers, and agencies requiring 4K fidelity.',
      features: [
        '500 high-speed credits / month',
        '4K Ultra HD resolution & 60 FPS',
        'Premium AI video models (Veo & Diffusion-X)',
        'Top priority generation queue (Sub-8s)',
        'Full commercial & broadcasting rights',
        'Custom camera trajectory scripting',
        'API access & webhook integration',
        'Dedicated account manager',
      ],
      credits: 500,
      isPopular: false,
      buttonText: user.plan === 'ultimate' ? 'Current Plan' : 'Upgrade to Ultimate',
    },
  ];

  const handleSelectPlan = (plan: typeof plans[0]) => {
    if (user.plan === plan.id) {
      showToast('info', 'Current Plan', `You are already subscribed to the ${plan.name} plan.`);
      return;
    }
    onUpgradePlan(plan.id, plan.credits);
    showToast('success', 'Plan Upgraded!', `Welcome to VisionFlow ${plan.name}! ${plan.credits} credits have been added.`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Title */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-xs font-semibold text-cyan-300 mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Transparent Pricing & Credit Allocation</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-display font-extrabold text-white tracking-tight">
          Choose the Perfect Plan for Your Vision
        </h1>
        <p className="text-base sm:text-lg text-slate-300 mt-4 leading-relaxed">
          From hobbyists experimenting with text-to-video to professional studios rendering 4K masterpieces.
        </p>

        {/* Monthly / Yearly Toggle */}
        <div className="mt-8 flex items-center justify-center gap-3">
          <span className={`text-sm font-semibold ${billingCycle === 'monthly' ? 'text-white' : 'text-slate-400'}`}>
            Monthly Billing
          </span>
          <button
            id="billing-cycle-toggle"
            type="button"
            onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
            className="relative w-14 h-8 rounded-full bg-slate-800 p-1 transition-colors border border-slate-700"
            aria-label="Toggle billing cycle"
          >
            <div
              className={`w-6 h-6 rounded-full bg-gradient-to-r from-cyan-400 to-indigo-500 shadow-md transform transition-transform ${
                billingCycle === 'yearly' ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
          <div className="flex items-center gap-1.5">
            <span className={`text-sm font-semibold ${billingCycle === 'yearly' ? 'text-white' : 'text-slate-400'}`}>
              Annual Billing
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
              Save 20%
            </span>
          </div>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch mb-16">
        {plans.map((plan) => {
          const isCurrent = user.plan === plan.id;
          const price = billingCycle === 'yearly' ? plan.priceYearly : plan.priceMonthly;

          return (
            <div
              key={plan.id}
              id={`pricing-card-${plan.id}`}
              className={`relative rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 ${
                plan.isPopular
                  ? 'bg-gradient-to-b from-[#101a30] to-[#0d1322] border-2 border-cyan-400/80 shadow-2xl shadow-cyan-950/60 scale-[1.03] z-10'
                  : 'glass-panel border-slate-800/80 hover:border-slate-700'
              }`}
            >
              {/* Highlight Ribbon for Pro Plan */}
              {plan.isPopular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="px-4 py-1 rounded-full bg-gradient-to-r from-cyan-500 via-sky-400 to-indigo-500 text-black text-xs font-black uppercase tracking-wider shadow-lg shadow-cyan-500/40">
                    Most Popular
                  </span>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-display font-bold text-white">{plan.name}</h3>
                  <span
                    className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg ${
                      plan.isPopular
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {plan.badge}
                  </span>
                </div>

                <p className="text-xs text-slate-300 min-h-[36px] mb-6 leading-relaxed">
                  {plan.description}
                </p>

                {/* Price Display */}
                <div className="mb-6 pb-6 border-b border-slate-800">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl sm:text-5xl font-display font-black text-white">
                      ${price}
                    </span>
                    <span className="text-slate-400 text-sm">
                      {price === 0 ? '' : '/ month'}
                    </span>
                  </div>
                  {billingCycle === 'yearly' && price > 0 && (
                    <p className="text-[11px] text-emerald-400 font-medium mt-1">
                      Billed annually (${price * 12}/year)
                    </p>
                  )}
                </div>

                {/* Features List */}
                <div className="space-y-3.5 mb-8">
                  <p className="text-xs uppercase tracking-wider font-bold text-slate-400">
                    What's Included:
                  </p>
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div
                        className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                          plan.isPopular
                            ? 'bg-cyan-500/20 text-cyan-400'
                            : 'bg-slate-800 text-emerald-400'
                        }`}
                      >
                        <Check className="w-3 h-3" />
                      </div>
                      <span className="text-xs sm:text-sm text-slate-200">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <button
                id={`select-plan-${plan.id}`}
                onClick={() => handleSelectPlan(plan)}
                disabled={isCurrent}
                className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm transition-all select-none ${
                  isCurrent
                    ? 'bg-slate-800 text-slate-400 border border-slate-700 cursor-default'
                    : plan.isPopular
                    ? 'bg-gradient-to-r from-cyan-400 to-indigo-500 hover:from-cyan-300 hover:to-indigo-400 text-black shadow-lg shadow-cyan-500/30 hover:scale-105 active:scale-95'
                    : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 hover:border-slate-600'
                }`}
              >
                {plan.buttonText}
              </button>
            </div>
          );
        })}
      </div>

      {/* FAQ Quick Section */}
      <div className="max-w-3xl mx-auto rounded-3xl p-8 glass-panel border-slate-800">
        <h3 className="text-xl font-display font-bold text-white mb-6 flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-cyan-400" />
          <span>Frequently Asked Questions</span>
        </h3>
        <div className="space-y-4 text-xs sm:text-sm">
          <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800/80">
            <h4 className="font-bold text-white mb-1">How do credits work?</h4>
            <p className="text-slate-400 leading-relaxed">
              Each video generation consumes 2 credits for 720p/1080p, or 4 credits for 4K rendering. Longer durations (15s/30s) use an additional 1-2 credits.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800/80">
            <h4 className="font-bold text-white mb-1">Do I own the videos I generate?</h4>
            <p className="text-slate-400 leading-relaxed">
              Yes! All videos generated on Pro and Ultimate plans come with full commercial usage rights for YouTube, film projects, marketing, and client deliverables.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800/80">
            <h4 className="font-bold text-white mb-1">Can I cancel or upgrade anytime?</h4>
            <p className="text-slate-400 leading-relaxed">
              Yes, you can upgrade, downgrade, or cancel your subscription at any time without long-term commitments.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
