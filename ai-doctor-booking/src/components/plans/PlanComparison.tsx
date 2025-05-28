"use client";

import React, { useState } from 'react';
import { SUBSCRIPTION_PLANS, PLAN_FEATURES_COMPARISON, BILLING_CYCLES, formatCurrency } from '@/constants/subscriptionPlans';
import { FiCheck, FiX, FiInfo } from 'react-icons/fi';

interface PlanComparisonProps {
  selectedPlan?: string;
  onPlanSelect?: (planId: string) => void;
  showBillingToggle?: boolean;
  currentPlan?: string;
  className?: string;
}

const PlanComparison: React.FC<PlanComparisonProps> = ({
  selectedPlan,
  onPlanSelect,
  showBillingToggle = true,
  currentPlan,
  className = ''
}) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const plans = Object.values(SUBSCRIPTION_PLANS);

  const getPrice = (plan: any) => {
    return billingCycle === 'yearly' ? plan.yearlyFee / 12 : plan.monthlyFee;
  };

  const getYearlyDiscount = (plan: any) => {
    return Math.round(((plan.monthlyFee * 12 - plan.yearlyFee) / (plan.monthlyFee * 12)) * 100);
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-light-grey">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-dark-grey mb-2">Compara Nuestros Planes</h2>
            <p className="text-medium-grey">Elige el plan que mejor se adapte a tu práctica médica</p>
          </div>
          
          {/* Billing Toggle */}
          {showBillingToggle && (
            <div className="mt-4 md:mt-0">
              <div className="inline-flex bg-light-grey rounded-lg p-1">
                <button
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    billingCycle === 'monthly'
                      ? 'bg-white text-dark-grey shadow-sm'
                      : 'text-medium-grey hover:text-dark-grey'
                  }`}
                  onClick={() => setBillingCycle('monthly')}
                >
                  Mensual
                </button>
                <button
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    billingCycle === 'yearly'
                      ? 'bg-white text-dark-grey shadow-sm'
                      : 'text-medium-grey hover:text-dark-grey'
                  }`}
                  onClick={() => setBillingCycle('yearly')}
                >
                  Anual
                  <span className="ml-1 text-xs text-green-600 font-semibold">-17%</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Plans Grid */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {plans.map((plan) => {
            const isSelected = selectedPlan === plan.id;
            const isCurrent = currentPlan === plan.id;
            const price = getPrice(plan);
            const yearlyDiscount = getYearlyDiscount(plan);

            return (
              <div
                key={plan.id}
                className={`relative border-2 rounded-xl p-6 transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? 'border-primary shadow-lg transform scale-105'
                    : isCurrent
                      ? 'border-primary bg-primary/5'
                      : 'border-light-grey hover:border-primary/50 hover:shadow-md'
                }`}
                onClick={() => onPlanSelect && onPlanSelect(plan.id)}
              >
                {/* Recommended Badge */}
                {plan.recommended && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <div className="bg-accent-orange text-white px-3 py-1 rounded-full text-xs font-medium">
                      Más Popular
                    </div>
                  </div>
                )}

                {/* Current Plan Badge */}
                {isCurrent && (
                  <div className="absolute -top-3 right-4">
                    <div className="bg-primary text-white px-3 py-1 rounded-full text-xs font-medium">
                      Plan Actual
                    </div>
                  </div>
                )}

                {/* Plan Header */}
                <div className="text-center mb-6">
                  <div 
                    className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                    style={{ backgroundColor: `${plan.color}20` }}
                  >
                    <div 
                      className="w-8 h-8 rounded-full"
                      style={{ backgroundColor: plan.color }}
                    />
                  </div>
                  
                  <h3 className="text-xl font-bold text-dark-grey mb-2">{plan.name}</h3>
                  <p className="text-sm text-medium-grey mb-4">{plan.description}</p>

                  {/* Pricing */}
                  <div className="mb-4">
                    <div className="flex items-baseline justify-center">
                      <span className="text-3xl font-bold text-dark-grey">
                        {formatCurrency(Math.round(price))}
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
                  </div>

                  {/* Action Button */}
                  <button
                    className={`w-full py-3 px-4 rounded-lg font-medium transition-colors duration-200 ${
                      isCurrent
                        ? 'bg-light-grey text-medium-grey cursor-not-allowed'
                        : isSelected
                          ? 'bg-primary text-white'
                          : 'bg-light-grey text-dark-grey hover:bg-primary hover:text-white'
                    }`}
                    disabled={isCurrent}
                  >
                    {isCurrent ? 'Plan Actual' : isSelected ? 'Seleccionado' : 'Seleccionar'}
                  </button>
                </div>

                {/* Key Features */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-dark-grey text-sm">Características principales:</h4>
                  {plan.features.slice(0, 4).map((feature, index) => (
                    <div key={index} className="flex items-start">
                      <FiCheck className="w-4 h-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                      <span className="text-sm text-dark-grey">{feature}</span>
                    </div>
                  ))}
                  {plan.features.length > 4 && (
                    <div className="text-xs text-medium-grey">
                      +{plan.features.length - 4} características más
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Detailed Feature Comparison Table */}
        <div className="border border-light-grey rounded-lg overflow-hidden">
          <div className="bg-light-grey px-6 py-4">
            <h3 className="font-semibold text-dark-grey flex items-center">
              <FiInfo className="w-5 h-5 mr-2" />
              Comparación Detallada de Características
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-light-grey">
                  <th className="text-left py-4 px-6 font-medium text-dark-grey">Característica</th>
                  {plans.map((plan) => (
                    <th key={plan.id} className="text-center py-4 px-4 font-medium text-dark-grey min-w-[120px]">
                      <div 
                        className="w-6 h-6 rounded-full mx-auto mb-1"
                        style={{ backgroundColor: plan.color }}
                      />
                      {plan.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Object.entries(PLAN_FEATURES_COMPARISON).map(([key, feature]) => (
                  <tr key={key} className="border-b border-light-grey hover:bg-light-grey/30">
                    <td className="py-4 px-6 font-medium text-dark-grey">{feature.label}</td>
                    <td className="py-4 px-4 text-center text-sm text-dark-grey">
                      {feature.basic}
                    </td>
                    <td className="py-4 px-4 text-center text-sm text-dark-grey">
                      {feature.premium}
                    </td>
                    <td className="py-4 px-4 text-center text-sm text-dark-grey">
                      {feature.enterprise}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Additional Information */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-semibold text-dark-grey mb-2">💳 Métodos de Pago</h4>
            <p className="text-sm text-medium-grey">
              Aceptamos tarjetas de crédito, débito, transferencias bancarias y PSE. 
              Todos los pagos son procesados de forma segura.
            </p>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4">
            <h4 className="font-semibold text-dark-grey mb-2">🔄 Cambios de Plan</h4>
            <p className="text-sm text-medium-grey">
              Puedes cambiar tu plan en cualquier momento. Los cambios se aplican 
              inmediatamente con prorrateo automático.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanComparison; 