"use client";

import React from 'react';
import { SubscriptionPlan, formatCurrency } from '@/constants/subscriptionPlans';
import { FiCheck, FiStar } from 'react-icons/fi';

interface PlanCardProps {
  plan: SubscriptionPlan;
  isSelected?: boolean;
  isCurrentPlan?: boolean;
  billingCycle?: 'monthly' | 'yearly';
  onSelect?: (planId: string) => void;
  showFeatures?: boolean;
  compact?: boolean;
  actionButton?: React.ReactNode;
  className?: string;
}

const PlanCard: React.FC<PlanCardProps> = ({
  plan,
  isSelected = false,
  isCurrentPlan = false,
  billingCycle = 'monthly',
  onSelect,
  showFeatures = true,
  compact = false,
  actionButton,
  className = ''
}) => {
  const price = billingCycle === 'yearly' ? plan.yearlyFee : plan.monthlyFee;
  const monthlyPrice = billingCycle === 'yearly' ? plan.yearlyFee / 12 : plan.monthlyFee;
  const yearlyDiscount = billingCycle === 'yearly' ? Math.round(((plan.monthlyFee * 12 - plan.yearlyFee) / (plan.monthlyFee * 12)) * 100) : 0;

  const handleClick = () => {
    if (onSelect && !isCurrentPlan) {
      onSelect(plan.id);
    }
  };

  const cardClasses = `
    relative bg-white rounded-xl shadow-sm border-2 transition-all duration-200 cursor-pointer
    ${isSelected ? 'border-primary shadow-lg transform scale-105' : 'border-light-grey hover:border-primary/50 hover:shadow-md'}
    ${isCurrentPlan ? 'border-primary bg-primary/5' : ''}
    ${compact ? 'p-4' : 'p-6'}
    ${className}
  `;

  return (
    <div className={cardClasses} onClick={handleClick}>
      {/* Recommended Badge */}
      {plan.recommended && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <div className="bg-accent-orange text-white px-3 py-1 rounded-full text-xs font-medium flex items-center">
            <FiStar className="w-3 h-3 mr-1" />
            Recomendado
          </div>
        </div>
      )}

      {/* Current Plan Badge */}
      {isCurrentPlan && (
        <div className="absolute -top-3 right-4">
          <div className="bg-primary text-white px-3 py-1 rounded-full text-xs font-medium">
            Plan Actual
          </div>
        </div>
      )}

      {/* Plan Header */}
      <div className="text-center mb-4">
        <div 
          className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center"
          style={{ backgroundColor: `${plan.color}20` }}
        >
          <div 
            className="w-6 h-6 rounded-full"
            style={{ backgroundColor: plan.color }}
          />
        </div>
        
        <h3 className="text-xl font-semibold text-dark-grey mb-1">{plan.name}</h3>
        
        {!compact && (
          <p className="text-sm text-medium-grey mb-3">{plan.description}</p>
        )}

        {/* Pricing */}
        <div className="mb-4">
          <div className="flex items-baseline justify-center">
            <span className="text-3xl font-bold text-dark-grey">
              {formatCurrency(Math.round(monthlyPrice))}
            </span>
            <span className="text-medium-grey ml-1">/mes</span>
          </div>
          
          {billingCycle === 'yearly' && yearlyDiscount > 0 && (
            <div className="mt-1">
              <span className="text-sm text-green-600 font-medium">
                Ahorra {yearlyDiscount}% anual
              </span>
            </div>
          )}
          
          {billingCycle === 'yearly' && (
            <div className="text-xs text-medium-grey mt-1">
              Facturado anualmente: {formatCurrency(price)}
            </div>
          )}
        </div>
      </div>

      {/* Features List */}
      {showFeatures && (
        <div className="space-y-3 mb-6">
          {plan.features.slice(0, compact ? 3 : undefined).map((feature, index) => (
            <div key={index} className="flex items-start">
              <FiCheck className="w-4 h-4 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
              <span className="text-sm text-dark-grey">{feature}</span>
            </div>
          ))}
          
          {compact && plan.features.length > 3 && (
            <div className="text-xs text-medium-grey">
              +{plan.features.length - 3} características más
            </div>
          )}
        </div>
      )}

      {/* Limitations */}
      {!compact && plan.limitations.length > 0 && (
        <div className="border-t border-light-grey pt-4 mb-6">
          <h4 className="text-sm font-medium text-medium-grey mb-2">Limitaciones:</h4>
          <div className="space-y-1">
            {plan.limitations.map((limitation, index) => (
              <div key={index} className="text-xs text-medium-grey">
                • {limitation}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Button */}
      {actionButton && (
        <div className="mt-auto">
          {actionButton}
        </div>
      )}

      {/* Default Action Button */}
      {!actionButton && onSelect && (
        <button
          className={`w-full py-3 px-4 rounded-lg font-medium transition-colors duration-200 ${
            isCurrentPlan
              ? 'bg-light-grey text-medium-grey cursor-not-allowed'
              : isSelected
                ? 'bg-primary text-white'
                : 'bg-light-grey text-dark-grey hover:bg-primary hover:text-white'
          }`}
          disabled={isCurrentPlan}
        >
          {isCurrentPlan ? 'Plan Actual' : isSelected ? 'Seleccionado' : 'Seleccionar Plan'}
        </button>
      )}

      {/* Selection Indicator */}
      {isSelected && !isCurrentPlan && (
        <div className="absolute top-4 right-4">
          <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
            <FiCheck className="w-4 h-4 text-white" />
          </div>
        </div>
      )}
    </div>
  );
};

export default PlanCard; 