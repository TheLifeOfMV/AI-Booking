export interface SubscriptionPlan {
  id: 'basic' | 'premium' | 'enterprise';
  name: string;
  monthlyFee: number; // in Colombian pesos
  yearlyFee: number; // in Colombian pesos (with discount)
  features: string[];
  limitations: string[];
  recommended: boolean;
  color: string;
  description: string;
  maxAppointments: number | 'unlimited';
  supportLevel: string;
  analytics: boolean;
  apiAccess: boolean;
  customIntegrations: boolean;
}

export const SUBSCRIPTION_PLANS: Record<string, SubscriptionPlan> = {
  basic: {
    id: 'basic',
    name: 'Básico',
    monthlyFee: 80000, // 80,000 COP
    yearlyFee: 800000, // 800,000 COP (2 months free)
    features: [
      'Hasta 50 citas por mes',
      'Dashboard básico',
      'Soporte por email',
      'Recordatorios automáticos',
      'Gestión de horarios',
      'Perfil profesional'
    ],
    limitations: [
      'Máximo 50 citas/mes',
      'Soporte solo por email',
      'Sin analytics avanzados'
    ],
    recommended: false,
    color: '#10B981', // Green
    description: 'Perfecto para médicos que están comenzando su práctica digital',
    maxAppointments: 50,
    supportLevel: 'Email',
    analytics: false,
    apiAccess: false,
    customIntegrations: false
  },
  premium: {
    id: 'premium',
    name: 'Premium',
    monthlyFee: 150000, // 150,000 COP
    yearlyFee: 1500000, // 1,500,000 COP (2 months free)
    features: [
      'Hasta 200 citas por mes',
      'Analytics avanzados',
      'Soporte prioritario',
      'Recordatorios automáticos',
      'Gestión de horarios avanzada',
      'Reportes mensuales',
      'Integración con calendario',
      'Notificaciones personalizadas'
    ],
    limitations: [
      'Máximo 200 citas/mes',
      'Sin API personalizada'
    ],
    recommended: true,
    color: '#007AFF', // Primary blue
    description: 'La opción más popular para médicos establecidos',
    maxAppointments: 200,
    supportLevel: 'Prioritario',
    analytics: true,
    apiAccess: false,
    customIntegrations: false
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    monthlyFee: 250000, // 250,000 COP
    yearlyFee: 2500000, // 2,500,000 COP (2 months free)
    features: [
      'Citas ilimitadas',
      'Analytics completos',
      'Soporte 24/7',
      'API personalizada',
      'Integración con sistemas externos',
      'Manager de cuenta dedicado',
      'Reportes personalizados',
      'Backup automático',
      'Múltiples ubicaciones',
      'Equipo médico colaborativo'
    ],
    limitations: [],
    recommended: false,
    color: '#8B5CF6', // Purple
    description: 'Solución completa para clínicas y consultorios grandes',
    maxAppointments: 'unlimited',
    supportLevel: '24/7 Dedicado',
    analytics: true,
    apiAccess: true,
    customIntegrations: true
  }
};

export const PLAN_FEATURES_COMPARISON = {
  appointments: {
    label: 'Citas por mes',
    basic: '50',
    premium: '200',
    enterprise: 'Ilimitadas'
  },
  support: {
    label: 'Soporte',
    basic: 'Email',
    premium: 'Prioritario',
    enterprise: '24/7 Dedicado'
  },
  analytics: {
    label: 'Analytics',
    basic: 'Básico',
    premium: 'Avanzado',
    enterprise: 'Completo'
  },
  integrations: {
    label: 'Integraciones',
    basic: 'Estándar',
    premium: 'Avanzadas',
    enterprise: 'Personalizadas'
  },
  api: {
    label: 'Acceso API',
    basic: '❌',
    premium: '❌',
    enterprise: '✅'
  },
  backup: {
    label: 'Backup automático',
    basic: '❌',
    premium: '✅',
    enterprise: '✅'
  }
};

export const BILLING_CYCLES = {
  monthly: {
    label: 'Mensual',
    discount: 0,
    description: 'Facturación mensual'
  },
  yearly: {
    label: 'Anual',
    discount: 0.17, // 17% discount (2 months free)
    description: 'Facturación anual (2 meses gratis)'
  }
};

// Helper functions
export const getPlanById = (planId: string): SubscriptionPlan | null => {
  return SUBSCRIPTION_PLANS[planId] || null;
};

export const calculateYearlyDiscount = (monthlyFee: number): number => {
  return monthlyFee * 12 * BILLING_CYCLES.yearly.discount;
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

export const getPlanRecommendation = (monthlyAppointments: number): SubscriptionPlan => {
  if (monthlyAppointments <= 50) {
    return SUBSCRIPTION_PLANS.basic;
  } else if (monthlyAppointments <= 200) {
    return SUBSCRIPTION_PLANS.premium;
  } else {
    return SUBSCRIPTION_PLANS.enterprise;
  }
}; 