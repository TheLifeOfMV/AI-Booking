import { SubscriptionPlan, SUBSCRIPTION_PLANS, formatCurrency } from '@/constants/subscriptionPlans';
import { DoctorSubscription, PaymentStatus, SubscriptionStatus } from '@/types/doctor';

export interface PlanChangeRequest {
  doctorId: string;
  currentPlanId: string;
  newPlanId: string;
  billingCycle: 'monthly' | 'yearly';
  effectiveDate?: string; // If not provided, change is immediate
}

export interface PaymentMethod {
  id: string;
  type: 'credit_card' | 'debit_card' | 'bank_transfer' | 'pse';
  lastFourDigits?: string;
  expiryDate?: string;
  bankName?: string;
  isDefault: boolean;
}

export interface ProrationCalculation {
  currentPlanRefund: number;
  newPlanCharge: number;
  netAmount: number;
  description: string;
}

export interface SubscriptionServiceResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
}

class SubscriptionService {
  private logAction(action: string, data: any) {
    console.log(`[SubscriptionService] ${action}:`, {
      timestamp: new Date().toISOString(),
      action,
      data
    });
  }

  /**
   * Get all available subscription plans
   */
  getAvailablePlans(): SubscriptionServiceResponse<SubscriptionPlan[]> {
    try {
      this.logAction('GET_AVAILABLE_PLANS', { planCount: Object.keys(SUBSCRIPTION_PLANS).length });
      
      const plans = Object.values(SUBSCRIPTION_PLANS);
      return {
        success: true,
        data: plans
      };
    } catch (error) {
      this.logAction('GET_AVAILABLE_PLANS_ERROR', { error });
      return {
        success: false,
        error: 'Failed to retrieve available plans'
      };
    }
  }

  /**
   * Calculate proration when changing plans
   */
  calculateProration(
    currentPlan: SubscriptionPlan,
    newPlan: SubscriptionPlan,
    daysRemainingInCycle: number,
    totalDaysInCycle: number = 30
  ): ProrationCalculation {
    this.logAction('CALCULATE_PRORATION', {
      currentPlan: currentPlan.id,
      newPlan: newPlan.id,
      daysRemainingInCycle,
      totalDaysInCycle
    });

    const dailyCurrentRate = currentPlan.monthlyFee / totalDaysInCycle;
    const dailyNewRate = newPlan.monthlyFee / totalDaysInCycle;

    const currentPlanRefund = dailyCurrentRate * daysRemainingInCycle;
    const newPlanCharge = dailyNewRate * daysRemainingInCycle;
    const netAmount = newPlanCharge - currentPlanRefund;

    const calculation: ProrationCalculation = {
      currentPlanRefund,
      newPlanCharge,
      netAmount,
      description: netAmount >= 0 
        ? `Cargo adicional de ${formatCurrency(netAmount)} por upgrade`
        : `Crédito de ${formatCurrency(Math.abs(netAmount))} por downgrade`
    };

    this.logAction('PRORATION_CALCULATED', calculation);
    return calculation;
  }

  /**
   * Validate plan change request
   */
  validatePlanChange(request: PlanChangeRequest): SubscriptionServiceResponse<boolean> {
    this.logAction('VALIDATE_PLAN_CHANGE', request);

    try {
      // Check if plans exist
      const currentPlan = SUBSCRIPTION_PLANS[request.currentPlanId];
      const newPlan = SUBSCRIPTION_PLANS[request.newPlanId];

      if (!currentPlan) {
        return {
          success: false,
          error: 'Current plan not found',
          code: 'CURRENT_PLAN_NOT_FOUND'
        };
      }

      if (!newPlan) {
        return {
          success: false,
          error: 'New plan not found',
          code: 'NEW_PLAN_NOT_FOUND'
        };
      }

      // Check if it's actually a change
      if (request.currentPlanId === request.newPlanId) {
        return {
          success: false,
          error: 'Cannot change to the same plan',
          code: 'SAME_PLAN_SELECTED'
        };
      }

      // Validate effective date if provided
      if (request.effectiveDate) {
        const effectiveDate = new Date(request.effectiveDate);
        const now = new Date();
        
        if (effectiveDate < now) {
          return {
            success: false,
            error: 'Effective date cannot be in the past',
            code: 'INVALID_EFFECTIVE_DATE'
          };
        }
      }

      this.logAction('PLAN_CHANGE_VALIDATED', { valid: true });
      return {
        success: true,
        data: true
      };
    } catch (error) {
      this.logAction('VALIDATE_PLAN_CHANGE_ERROR', { error });
      return {
        success: false,
        error: 'Validation failed'
      };
    }
  }

  /**
   * Process plan change
   */
  async changePlan(request: PlanChangeRequest): Promise<SubscriptionServiceResponse<DoctorSubscription>> {
    this.logAction('CHANGE_PLAN_START', request);

    try {
      // Validate the request first
      const validation = this.validatePlanChange(request);
      if (!validation.success) {
        return validation as SubscriptionServiceResponse<DoctorSubscription>;
      }

      const newPlan = SUBSCRIPTION_PLANS[request.newPlanId];
      const effectiveDate = request.effectiveDate || new Date().toISOString();
      
      // Calculate new end date (30 days from effective date)
      const endDate = new Date(effectiveDate);
      endDate.setDate(endDate.getDate() + 30);

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Create new subscription object
      const newSubscription: DoctorSubscription = {
        id: `sub_${Date.now()}`,
        planType: newPlan.id,
        monthlyFee: newPlan.monthlyFee,
        status: 'active' as SubscriptionStatus,
        paymentStatus: 'paid' as PaymentStatus,
        startDate: effectiveDate,
        endDate: endDate.toISOString(),
        nextPaymentDate: endDate.toISOString(),
        failedPaymentAttempts: 0
      };

      this.logAction('PLAN_CHANGE_SUCCESS', {
        doctorId: request.doctorId,
        newPlan: newPlan.id,
        newSubscription
      });

      return {
        success: true,
        data: newSubscription
      };
    } catch (error) {
      this.logAction('CHANGE_PLAN_ERROR', { error, request });
      return {
        success: false,
        error: 'Failed to change plan. Please try again.'
      };
    }
  }

  /**
   * Process payment for subscription
   */
  async processPayment(
    subscriptionId: string,
    amount: number,
    paymentMethodId: string
  ): Promise<SubscriptionServiceResponse<{ transactionId: string; status: PaymentStatus }>> {
    this.logAction('PROCESS_PAYMENT_START', {
      subscriptionId,
      amount,
      paymentMethodId
    });

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Simulate random payment success/failure for demo
      const isSuccess = Math.random() > 0.1; // 90% success rate

      if (isSuccess) {
        const transactionId = `txn_${Date.now()}`;
        
        this.logAction('PAYMENT_SUCCESS', {
          subscriptionId,
          transactionId,
          amount
        });

        return {
          success: true,
          data: {
            transactionId,
            status: 'paid' as PaymentStatus
          }
        };
      } else {
        this.logAction('PAYMENT_FAILED', {
          subscriptionId,
          amount,
          reason: 'Insufficient funds'
        });

        return {
          success: false,
          error: 'Payment failed. Please check your payment method.',
          code: 'PAYMENT_FAILED'
        };
      }
    } catch (error) {
      this.logAction('PROCESS_PAYMENT_ERROR', { error, subscriptionId });
      return {
        success: false,
        error: 'Payment processing failed. Please try again.'
      };
    }
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(
    subscriptionId: string,
    reason?: string,
    effectiveDate?: string
  ): Promise<SubscriptionServiceResponse<DoctorSubscription>> {
    this.logAction('CANCEL_SUBSCRIPTION_START', {
      subscriptionId,
      reason,
      effectiveDate
    });

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const cancelDate = effectiveDate || new Date().toISOString();

      // Create cancelled subscription object
      const cancelledSubscription: DoctorSubscription = {
        id: subscriptionId,
        planType: 'gratuito', // Default to gratuito after cancellation
        monthlyFee: 0,
        status: 'cancelled' as SubscriptionStatus,
        paymentStatus: 'refunded' as PaymentStatus,
        startDate: new Date().toISOString(),
        endDate: cancelDate,
        nextPaymentDate: '',
        failedPaymentAttempts: 0
      };

      this.logAction('SUBSCRIPTION_CANCELLED', {
        subscriptionId,
        cancelDate,
        reason
      });

      return {
        success: true,
        data: cancelledSubscription
      };
    } catch (error) {
      this.logAction('CANCEL_SUBSCRIPTION_ERROR', { error, subscriptionId });
      return {
        success: false,
        error: 'Failed to cancel subscription. Please try again.'
      };
    }
  }

  /**
   * Get payment methods for a doctor
   */
  async getPaymentMethods(doctorId: string): Promise<SubscriptionServiceResponse<PaymentMethod[]>> {
    this.logAction('GET_PAYMENT_METHODS', { doctorId });

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      // Mock payment methods
      const paymentMethods: PaymentMethod[] = [
        {
          id: 'pm_1',
          type: 'credit_card',
          lastFourDigits: '4242',
          expiryDate: '12/25',
          isDefault: true
        },
        {
          id: 'pm_2',
          type: 'bank_transfer',
          bankName: 'Banco de Bogotá',
          isDefault: false
        }
      ];

      return {
        success: true,
        data: paymentMethods
      };
    } catch (error) {
      this.logAction('GET_PAYMENT_METHODS_ERROR', { error, doctorId });
      return {
        success: false,
        error: 'Failed to retrieve payment methods'
      };
    }
  }

  /**
   * Create initial subscription for new doctor registration
   */
  async createInitialSubscription(
    doctorId: string,
    planId: string,
    paymentMethodId?: string
  ): Promise<SubscriptionServiceResponse<DoctorSubscription>> {
    this.logAction('CREATE_INITIAL_SUBSCRIPTION', {
      doctorId,
      planId,
      paymentMethodId
    });

    try {
      const plan = SUBSCRIPTION_PLANS[planId];
      if (!plan) {
        return {
          success: false,
          error: 'Invalid plan selected',
          code: 'INVALID_PLAN'
        };
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 30);

      const subscription: DoctorSubscription = {
        id: `sub_${doctorId}_${Date.now()}`,
        planType: plan.id,
        monthlyFee: plan.monthlyFee,
        status: 'active' as SubscriptionStatus,
        paymentStatus: paymentMethodId ? 'paid' : 'pending' as PaymentStatus,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        nextPaymentDate: endDate.toISOString(),
        failedPaymentAttempts: 0
      };

      this.logAction('INITIAL_SUBSCRIPTION_CREATED', {
        doctorId,
        subscriptionId: subscription.id,
        plan: plan.id
      });

      return {
        success: true,
        data: subscription
      };
    } catch (error) {
      this.logAction('CREATE_INITIAL_SUBSCRIPTION_ERROR', { error, doctorId });
      return {
        success: false,
        error: 'Failed to create subscription. Please try again.'
      };
    }
  }
}

// Export singleton instance
export const subscriptionService = new SubscriptionService();
export default subscriptionService; 