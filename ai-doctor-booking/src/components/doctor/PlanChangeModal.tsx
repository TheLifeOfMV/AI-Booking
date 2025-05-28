"use client";

import React, { useState, useEffect } from 'react';
import { SUBSCRIPTION_PLANS, formatCurrency } from '@/constants/subscriptionPlans';
import { subscriptionService, ProrationCalculation } from '@/services/subscriptionService';
import PlanCard from '@/components/plans/PlanCard';
import { FiX, FiCreditCard, FiInfo, FiAlertTriangle, FiCheck } from 'react-icons/fi';

interface PlanChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan: string;
  doctorId: string;
  onPlanChanged?: (newSubscription: any) => void;
}

const PlanChangeModal: React.FC<PlanChangeModalProps> = ({
  isOpen,
  onClose,
  currentPlan,
  doctorId,
  onPlanChanged
}) => {
  const [selectedPlan, setSelectedPlan] = useState('');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [step, setStep] = useState<'select' | 'confirm' | 'processing' | 'success'>('select');
  const [proration, setProration] = useState<ProrationCalculation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const plans = Object.values(SUBSCRIPTION_PLANS);
  const currentPlanData = SUBSCRIPTION_PLANS[currentPlan];
  const selectedPlanData = selectedPlan ? SUBSCRIPTION_PLANS[selectedPlan] : null;

  useEffect(() => {
    if (selectedPlan && selectedPlan !== currentPlan) {
      // Calculate proration
      const currentPlanData = SUBSCRIPTION_PLANS[currentPlan];
      const newPlanData = SUBSCRIPTION_PLANS[selectedPlan];
      
      if (currentPlanData && newPlanData) {
        const daysRemaining = 15; // Mock: 15 days remaining in current cycle
        const calculation = subscriptionService.calculateProration(
          currentPlanData,
          newPlanData,
          daysRemaining
        );
        setProration(calculation);
      }
    } else {
      setProration(null);
    }
  }, [selectedPlan, currentPlan]);

  const handlePlanSelect = (planId: string) => {
    if (planId === currentPlan) {
      setSelectedPlan('');
      return;
    }
    setSelectedPlan(planId);
  };

  const handleContinue = () => {
    if (!selectedPlan || selectedPlan === currentPlan) {
      setError('Por favor selecciona un plan diferente al actual');
      return;
    }
    setError(null);
    setStep('confirm');
  };

  const handleConfirmChange = async () => {
    if (!selectedPlan) return;

    setStep('processing');
    setIsLoading(true);

    try {
      const result = await subscriptionService.changePlan({
        doctorId,
        currentPlanId: currentPlan,
        newPlanId: selectedPlan,
        billingCycle
      });

      if (result.success) {
        setStep('success');
        if (onPlanChanged && result.data) {
          onPlanChanged(result.data);
        }
      } else {
        setError(result.error || 'Error al cambiar el plan');
        setStep('confirm');
      }
    } catch (error) {
      setError('Error inesperado. Por favor, inténtalo de nuevo.');
      setStep('confirm');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (step === 'processing') return; // Prevent closing during processing
    
    setSelectedPlan('');
    setStep('select');
    setError(null);
    setProration(null);
    onClose();
  };

  const isUpgrade = selectedPlanData && currentPlanData && 
    selectedPlanData.monthlyFee > currentPlanData.monthlyFee;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-light-grey">
          <h2 className="text-xl font-bold text-dark-grey">
            {step === 'select' && 'Cambiar Plan de Suscripción'}
            {step === 'confirm' && 'Confirmar Cambio de Plan'}
            {step === 'processing' && 'Procesando Cambio...'}
            {step === 'success' && 'Cambio Exitoso'}
          </h2>
          <button
            onClick={handleClose}
            className="text-medium-grey hover:text-dark-grey transition-colors"
            disabled={step === 'processing'}
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Step 1: Plan Selection */}
          {step === 'select' && (
            <div className="space-y-6">
              {/* Current Plan Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <FiInfo className="w-5 h-5 text-blue-600 mt-0.5 mr-3" />
                  <div>
                    <h3 className="font-medium text-blue-900">Plan Actual</h3>
                    <p className="text-blue-700 text-sm">
                      Actualmente tienes el plan <strong>{currentPlanData?.name}</strong> por{' '}
                      <strong>{formatCurrency(currentPlanData?.monthlyFee || 0)}</strong> al mes.
                    </p>
                  </div>
                </div>
              </div>

              {/* Billing Cycle Toggle */}
              <div className="flex justify-center">
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

              {/* Plans Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {plans.map((plan) => (
                  <PlanCard
                    key={plan.id}
                    plan={plan}
                    isSelected={selectedPlan === plan.id}
                    isCurrentPlan={currentPlan === plan.id}
                    billingCycle={billingCycle}
                    onSelect={handlePlanSelect}
                    showFeatures={true}
                    compact={true}
                  />
                ))}
              </div>

              {/* Proration Info */}
              {proration && selectedPlanData && (
                <div className={`border rounded-lg p-4 ${
                  proration.netAmount >= 0 ? 'bg-orange-50 border-orange-200' : 'bg-green-50 border-green-200'
                }`}>
                  <div className="flex items-start">
                    <FiCreditCard className={`w-5 h-5 mt-0.5 mr-3 ${
                      proration.netAmount >= 0 ? 'text-orange-600' : 'text-green-600'
                    }`} />
                    <div>
                      <h4 className={`font-medium ${
                        proration.netAmount >= 0 ? 'text-orange-900' : 'text-green-900'
                      }`}>
                        {isUpgrade ? 'Upgrade' : 'Downgrade'} - Ajuste Prorrateado
                      </h4>
                      <p className={`text-sm mt-1 ${
                        proration.netAmount >= 0 ? 'text-orange-700' : 'text-green-700'
                      }`}>
                        {proration.description}
                      </p>
                      <div className="mt-2 text-xs space-y-1">
                        <div>Reembolso plan actual: {formatCurrency(proration.currentPlanRefund)}</div>
                        <div>Cargo nuevo plan: {formatCurrency(proration.newPlanCharge)}</div>
                        <div className="font-medium">
                          Total: {proration.netAmount >= 0 ? '+' : ''}{formatCurrency(proration.netAmount)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <FiAlertTriangle className="w-5 h-5 text-red-600 mt-0.5 mr-3" />
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3">
                <button
                  onClick={handleClose}
                  className="px-4 py-2 border border-light-grey text-medium-grey rounded-lg hover:bg-light-grey transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleContinue}
                  disabled={!selectedPlan || selectedPlan === currentPlan}
                  className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continuar
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Confirmation */}
          {step === 'confirm' && selectedPlanData && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-dark-grey mb-2">
                  Confirma tu cambio de plan
                </h3>
                <p className="text-medium-grey">
                  Estás a punto de cambiar del plan <strong>{currentPlanData?.name}</strong> al plan{' '}
                  <strong>{selectedPlanData.name}</strong>
                </p>
              </div>

              {/* Plan Comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-light-grey rounded-lg p-4">
                  <h4 className="font-medium text-medium-grey mb-2">Plan Actual</h4>
                  <div className="text-lg font-semibold text-dark-grey">{currentPlanData?.name}</div>
                  <div className="text-medium-grey">{formatCurrency(currentPlanData?.monthlyFee || 0)}/mes</div>
                </div>
                <div className="border border-primary rounded-lg p-4 bg-primary/5">
                  <h4 className="font-medium text-primary mb-2">Nuevo Plan</h4>
                  <div className="text-lg font-semibold text-dark-grey">{selectedPlanData.name}</div>
                  <div className="text-medium-grey">
                    {formatCurrency(billingCycle === 'yearly' ? selectedPlanData.yearlyFee / 12 : selectedPlanData.monthlyFee)}/mes
                  </div>
                </div>
              </div>

              {/* Proration Summary */}
              {proration && (
                <div className="bg-light-grey/50 rounded-lg p-4">
                  <h4 className="font-medium text-dark-grey mb-3">Resumen de Facturación</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Reembolso plan actual (días restantes):</span>
                      <span>{formatCurrency(proration.currentPlanRefund)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Cargo nuevo plan (días restantes):</span>
                      <span>{formatCurrency(proration.newPlanCharge)}</span>
                    </div>
                    <div className="border-t border-light-grey pt-2 flex justify-between font-medium">
                      <span>Total a {proration.netAmount >= 0 ? 'pagar' : 'reembolsar'}:</span>
                      <span className={proration.netAmount >= 0 ? 'text-orange-600' : 'text-green-600'}>
                        {proration.netAmount >= 0 ? '+' : ''}{formatCurrency(proration.netAmount)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Important Notes */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Información Importante</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• El cambio será efectivo inmediatamente</li>
                  <li>• Tu próxima facturación será el mismo día del mes</li>
                  <li>• Puedes cambiar de plan nuevamente en cualquier momento</li>
                  {proration?.netAmount && proration.netAmount > 0 && (
                    <li>• El cargo adicional se procesará con tu método de pago actual</li>
                  )}
                </ul>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <FiAlertTriangle className="w-5 h-5 text-red-600 mt-0.5 mr-3" />
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setStep('select')}
                  className="px-4 py-2 border border-light-grey text-medium-grey rounded-lg hover:bg-light-grey transition-colors"
                >
                  Volver
                </button>
                <button
                  onClick={handleConfirmChange}
                  disabled={isLoading}
                  className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                >
                  {isLoading ? 'Procesando...' : 'Confirmar Cambio'}
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Processing */}
          {step === 'processing' && (
            <div className="text-center py-8">
              <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold text-dark-grey mb-2">Procesando cambio de plan...</h3>
              <p className="text-medium-grey">Por favor espera mientras actualizamos tu suscripción.</p>
            </div>
          )}

          {/* Step 4: Success */}
          {step === 'success' && selectedPlanData && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiCheck className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-dark-grey mb-2">¡Cambio exitoso!</h3>
              <p className="text-medium-grey mb-6">
                Tu plan ha sido actualizado exitosamente al plan <strong>{selectedPlanData.name}</strong>.
              </p>
              <button
                onClick={handleClose}
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Cerrar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlanChangeModal; 