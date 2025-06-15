export interface SubscriptionPlan {
  id: 'gratuito' | 'premium' | 'elite';
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
  gratuito: {
    id: 'gratuito',
    name: 'Plan Gratuito',
    monthlyFee: 0, // $0 / mes
    yearlyFee: 0, // Free plan
    features: [
      'Hasta 20 citas médicas mensuales',
      'Panel de control básico para gestionar citas',
      'Recordatorios automáticos por correo electrónico',
      'Historial de citas de los últimos 30 días',
      'Actualizaciones automáticas del sistema',
      'Soporte por correo electrónico (en horario laboral)'
    ],
    limitations: [
      'Máximo 20 citas/mes',
      'Soporte solo por email en horario laboral',
      'Historial limitado a 30 días'
    ],
    recommended: false,
    color: '#10B981', // Green
    description: 'Perfecto para médicos que están comenzando su práctica digital',
    maxAppointments: 20,
    supportLevel: 'Email (horario laboral)',
    analytics: false,
    apiAccess: false,
    customIntegrations: false
  },
  premium: {
    id: 'premium',
    name: 'Plan Premium',
    monthlyFee: 100000, // 100,000 COP / mes
    yearlyFee: 1000000, // 1,000,000 COP (2 months free)
    features: [
      'Hasta 60 citas médicas mensuales',
      'Recordatorios automáticos por correo y WhatsApp (con IA)',
      'WhatsApp con IA para confirmación/cancelación de citas',
      'Historial de citas de los últimos 6 meses',
      'Reportes básicos de citas (realizadas, canceladas)',
      'Soporte por correo y chat en vivo',
      'Acceso desde hasta 3 dispositivos'
    ],
    limitations: [
      'Máximo 60 citas/mes',
      'Acceso limitado a 3 dispositivos',
      'Historial limitado a 6 meses'
    ],
    recommended: true,
    color: '#007AFF', // Primary blue
    description: 'La opción más popular para médicos establecidos',
    maxAppointments: 60,
    supportLevel: 'Correo y chat en vivo',
    analytics: true,
    apiAccess: false,
    customIntegrations: false
  },
  elite: {
    id: 'elite',
    name: 'Plan Élite / Corporativo',
    monthlyFee: 150000, // 150,000 COP / mes
    yearlyFee: 1500000, // 1,500,000 COP (2 months free)
    features: [
      'Citas médicas ilimitadas mensuales',
      'WhatsApp con IA: agendamiento, confirmación, reprogramación',
      'Llamadas automáticas con asistente virtual de IA para confirmación',
      'Historial de citas sin límite de tiempo',
      'Reportes avanzados y analítica (cancelaciones, ausencias, desempeño)',
      'Soporte premium: correo, chat en vivo y teléfono',
      'Acceso desde dispositivos ilimitados'
    ],
    limitations: [],
    recommended: false,
    color: '#8B5CF6', // Purple
    description: 'Solución completa para clínicas y consultorios grandes',
    maxAppointments: 'unlimited',
    supportLevel: 'Premium: correo, chat y teléfono',
    analytics: true,
    apiAccess: true,
    customIntegrations: true
  }
};

export const PLAN_FEATURES_COMPARISON = {
  appointments: {
    label: 'Citas por mes',
    gratuito: '20',
    premium: '60',
    elite: 'Ilimitadas'
  },
  support: {
    label: 'Soporte',
    gratuito: 'Email (horario laboral)',
    premium: 'Correo y chat en vivo',
    elite: 'Premium: correo, chat y teléfono'
  },
  analytics: {
    label: 'Analytics',
    gratuito: 'Básico',
    premium: 'Reportes básicos',
    elite: 'Reportes avanzados y analítica'
  },
  integrations: {
    label: 'Integraciones',
    gratuito: 'Email básico',
    premium: 'WhatsApp con IA',
    elite: 'WhatsApp + Llamadas con IA'
  },
  devices: {
    label: 'Dispositivos',
    gratuito: '1',
    premium: '3',
    elite: 'Ilimitados'
  },
  history: {
    label: 'Historial',
    gratuito: '30 días',
    premium: '6 meses',
    elite: 'Sin límite'
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
  if (monthlyAppointments <= 20) {
    return SUBSCRIPTION_PLANS.gratuito;
  } else if (monthlyAppointments <= 60) {
    return SUBSCRIPTION_PLANS.premium;
  } else {
    return SUBSCRIPTION_PLANS.elite;
  }
}; 