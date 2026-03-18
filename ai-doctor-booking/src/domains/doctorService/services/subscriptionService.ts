import { SubscriptionPlan, SUBSCRIPTION_PLANS, formatCurrency } from '@/platform/constants/subscriptionPlans';
import { DoctorSubscription, PaymentStatus, SubscriptionStatus } from '@/domains/doctorService/types/doctor';

export interface PlanChangeRequest {
  doctorId: string;
  currentPlanId: string;
  newPlanId: string;
  billingCycle: 'monthly' | 'yearly';
  effectiveDate?: string;
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

function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
}

class SubscriptionService {
  getAvailablePlans(): SubscriptionServiceResponse<SubscriptionPlan[]> {
    const plans = Object.values(SUBSCRIPTION_PLANS);
    return { success: true, data: plans };
  }

  calculateProration(
    currentPlan: SubscriptionPlan,
    newPlan: SubscriptionPlan,
    daysRemainingInCycle: number,
    totalDaysInCycle: number = 30
  ): ProrationCalculation {
    const dailyCurrentRate = currentPlan.monthlyFee / totalDaysInCycle;
    const dailyNewRate = newPlan.monthlyFee / totalDaysInCycle;

    const currentPlanRefund = dailyCurrentRate * daysRemainingInCycle;
    const newPlanCharge = dailyNewRate * daysRemainingInCycle;
    const netAmount = newPlanCharge - currentPlanRefund;

    return {
      currentPlanRefund,
      newPlanCharge,
      netAmount,
      description: netAmount >= 0
        ? `Cargo adicional de ${formatCurrency(netAmount)} por upgrade`
        : `Crédito de ${formatCurrency(Math.abs(netAmount))} por downgrade`,
    };
  }

  async changePlan(
    request: PlanChangeRequest
  ): Promise<SubscriptionServiceResponse<{ checkoutUrl?: string; subscription?: DoctorSubscription }>> {
    try {
      const newPlan = SUBSCRIPTION_PLANS[request.newPlanId];
      if (!newPlan) {
        return { success: false, error: 'Plan no encontrado', code: 'PLAN_NOT_FOUND' };
      }

      if (request.currentPlanId === request.newPlanId) {
        return { success: false, error: 'No puedes cambiar al mismo plan', code: 'SAME_PLAN' };
      }

      if (request.newPlanId === 'gratuito') {
        return this.cancelSubscription('current');
      }

      const token = getAuthToken();
      const res = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ plan_type: request.newPlanId }),
      });

      const json = await res.json();
      if (!json.success) {
        return { success: false, error: json.message || 'Error al iniciar el pago' };
      }

      return {
        success: true,
        data: { checkoutUrl: json.data.checkoutUrl },
      };
    } catch (error: any) {
      return { success: false, error: error.message || 'Error inesperado' };
    }
  }

  async getCurrentSubscription(): Promise<SubscriptionServiceResponse<DoctorSubscription | null>> {
    try {
      const token = getAuthToken();
      const res = await fetch('/api/subscriptions', {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const json = await res.json();
      if (!json.success) {
        return { success: false, error: json.message };
      }

      if (!json.data) return { success: true, data: null };

      const sub = json.data;
      const mapped: DoctorSubscription = {
        id: sub.id,
        planType: sub.plan_type,
        monthlyFee: sub.monthly_fee,
        status: sub.status as SubscriptionStatus,
        paymentStatus: sub.payment_status as PaymentStatus,
        startDate: sub.start_date || sub.created_at,
        endDate: sub.end_date || '',
        nextPaymentDate: sub.end_date || '',
        failedPaymentAttempts: sub.failed_payment_attempts || 0,
      };

      return { success: true, data: mapped };
    } catch (error: any) {
      return { success: false, error: error.message || 'Error inesperado' };
    }
  }

  async cancelSubscription(
    _subscriptionId: string,
    _reason?: string
  ): Promise<SubscriptionServiceResponse<{ checkoutUrl?: string; subscription?: DoctorSubscription }>> {
    try {
      const token = getAuthToken();
      const res = await fetch('/api/subscriptions/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const json = await res.json();
      if (!json.success) {
        return { success: false, error: json.message || 'Error al cancelar' };
      }

      const gratuito: DoctorSubscription = {
        id: 'free',
        planType: 'gratuito',
        monthlyFee: 0,
        status: 'active' as SubscriptionStatus,
        paymentStatus: 'paid' as PaymentStatus,
        startDate: new Date().toISOString(),
        endDate: '',
        nextPaymentDate: '',
        failedPaymentAttempts: 0,
      };

      return { success: true, data: { subscription: gratuito } };
    } catch (error: any) {
      return { success: false, error: error.message || 'Error inesperado' };
    }
  }
}

export const subscriptionService = new SubscriptionService();
export default subscriptionService;
