"use client";

import React, { useState, useEffect } from 'react';
import { SUBSCRIPTION_PLANS, getPlanRecommendation, formatCurrency } from '@/constants/subscriptionPlans';
import PlanCard from '@/components/plans/PlanCard';
import { FiHelpCircle, FiUsers, FiTrendingUp, FiZap } from 'react-icons/fi';

interface PlanSelectorProps {
  selectedPlan?: string;
  onPlanSelect: (planId: string) => void;
  expectedMonthlyAppointments?: number;
  onAppointmentsChange?: (appointments: number) => void;
  showRecommendation?: boolean;
  className?: string;
}

const PlanSelector: React.FC<PlanSelectorProps> = ({
  selectedPlan,
  onPlanSelect,
  expectedMonthlyAppointments = 0,
  onAppointmentsChange,
  showRecommendation = true,
  className = ''
}) => {
  const [appointments, setAppointments] = useState(expectedMonthlyAppointments);
  const [showTooltip, setShowTooltip] = useState<string | null>(null);
  
  const plans = Object.values(SUBSCRIPTION_PLANS);
  const recommendedPlan = showRecommendation ? getPlanRecommendation(appointments) : null;

  useEffect(() => {
    if (onAppointmentsChange) {
      onAppointmentsChange(appointments);
    }
  }, [appointments, onAppointmentsChange]);

  const handleAppointmentChange = (value: number) => {
    setAppointments(value);
    
    // Auto-select recommended plan if no plan is currently selected
    if (!selectedPlan && showRecommendation) {
      const recommended = getPlanRecommendation(value);
      onPlanSelect(recommended.id);
    }
  };

  const appointmentRanges = [
    { label: '1-25 citas/mes', value: 20, icon: FiUsers, description: 'Ideal para médicos que están comenzando' },
    { label: '26-100 citas/mes', value: 60, icon: FiTrendingUp, description: 'Perfecto para práctica establecida' },
    { label: '100+ citas/mes', value: 150, icon: FiZap, description: 'Para clínicas y consultorios grandes' }
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-dark-grey mb-2">Selecciona tu Plan de Suscripción</h2>
        <p className="text-medium-grey">
          Elige el plan que mejor se adapte al volumen de tu práctica médica
        </p>
      </div>

      {/* Appointment Volume Selector */}
      {showRecommendation && (
        <div className="bg-light-grey/50 rounded-xl p-6">
          <div className="flex items-center mb-4">
            <h3 className="text-lg font-semibold text-dark-grey">¿Cuántas citas esperas tener por mes?</h3>
            <button
              className="ml-2 text-medium-grey hover:text-dark-grey"
              onMouseEnter={() => setShowTooltip('appointments')}
              onMouseLeave={() => setShowTooltip(null)}
            >
              <FiHelpCircle className="w-5 h-5" />
            </button>
            {showTooltip === 'appointments' && (
              <div className="absolute z-10 bg-dark-grey text-white text-sm rounded-lg p-3 mt-8 ml-4 max-w-xs">
                Esto nos ayuda a recomendarte el plan más adecuado para tu práctica médica.
                Puedes cambiar de plan en cualquier momento.
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {appointmentRanges.map((range) => {
              const Icon = range.icon;
              const isSelected = appointments === range.value;
              
              return (
                <button
                  key={range.value}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                    isSelected
                      ? 'border-primary bg-primary/5'
                      : 'border-light-grey hover:border-primary/50'
                  }`}
                  onClick={() => handleAppointmentChange(range.value)}
                >
                  <div className="flex items-center mb-2">
                    <Icon className={`w-5 h-5 mr-2 ${isSelected ? 'text-primary' : 'text-medium-grey'}`} />
                    <span className={`font-medium ${isSelected ? 'text-primary' : 'text-dark-grey'}`}>
                      {range.label}
                    </span>
                  </div>
                  <p className="text-sm text-medium-grey">{range.description}</p>
                </button>
              );
            })}
          </div>

          {/* Custom Input */}
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-dark-grey">O especifica un número exacto:</label>
            <input
              type="number"
              min="1"
              max="1000"
              value={appointments || ''}
              onChange={(e) => handleAppointmentChange(parseInt(e.target.value) || 0)}
              className="w-24 px-3 py-2 border border-light-grey rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              placeholder="0"
            />
            <span className="text-sm text-medium-grey">citas por mes</span>
          </div>
        </div>
      )}

      {/* Recommendation Banner */}
      {recommendedPlan && appointments > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${recommendedPlan.color}20` }}
              >
                <div 
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: recommendedPlan.color }}
                />
              </div>
            </div>
            <div className="ml-3">
              <h4 className="text-sm font-medium text-blue-900">
                Recomendación: Plan {recommendedPlan.name}
              </h4>
              <p className="text-sm text-blue-700 mt-1">
                Basado en {appointments} citas mensuales, el plan {recommendedPlan.name} es ideal para tu práctica.
                {recommendedPlan.maxAppointments === 'unlimited' 
                  ? ' Tendrás citas ilimitadas.' 
                  : ` Incluye hasta ${recommendedPlan.maxAppointments} citas por mes.`
                }
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            isSelected={selectedPlan === plan.id}
            onSelect={onPlanSelect}
            showFeatures={true}
            compact={false}
            className={
              recommendedPlan?.id === plan.id 
                ? 'ring-2 ring-blue-200 ring-offset-2' 
                : ''
            }
          />
        ))}
      </div>

      {/* Plan Benefits Summary */}
      <div className="bg-white rounded-xl border border-light-grey p-6">
        <h3 className="text-lg font-semibold text-dark-grey mb-4">¿Por qué elegir un plan de suscripción?</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                <span className="text-green-600 text-sm">✓</span>
              </div>
              <div>
                <h4 className="font-medium text-dark-grey">Sin comisiones por cita</h4>
                <p className="text-sm text-medium-grey">
                  Paga una tarifa fija mensual, sin comisiones adicionales por cada cita agendada.
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                <span className="text-green-600 text-sm">✓</span>
              </div>
              <div>
                <h4 className="font-medium text-dark-grey">Herramientas profesionales</h4>
                <p className="text-sm text-medium-grey">
                  Acceso a dashboard, analytics, recordatorios automáticos y más.
                </p>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                <span className="text-green-600 text-sm">✓</span>
              </div>
              <div>
                <h4 className="font-medium text-dark-grey">Soporte dedicado</h4>
                <p className="text-sm text-medium-grey">
                  Recibe ayuda cuando la necesites con nuestro equipo de soporte especializado.
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                <span className="text-green-600 text-sm">✓</span>
              </div>
              <div>
                <h4 className="font-medium text-dark-grey">Flexibilidad total</h4>
                <p className="text-sm text-medium-grey">
                  Cambia de plan o cancela en cualquier momento sin penalizaciones.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Selected Plan Summary */}
      {selectedPlan && (
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-dark-grey">
                Plan seleccionado: {SUBSCRIPTION_PLANS[selectedPlan].name}
              </h4>
              <p className="text-sm text-medium-grey">
                {formatCurrency(SUBSCRIPTION_PLANS[selectedPlan].monthlyFee)} por mes
              </p>
            </div>
            <button
              onClick={() => onPlanSelect('')}
              className="text-sm text-primary hover:text-primary/80"
            >
              Cambiar plan
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlanSelector; 