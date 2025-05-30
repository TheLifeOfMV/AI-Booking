"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import PlanComparison from '@/components/plans/PlanComparison';
import { SUBSCRIPTION_PLANS, formatCurrency } from '@/constants/subscriptionPlans';
import { FiCheck, FiArrowRight, FiUsers, FiTrendingUp, FiZap, FiHelpCircle, FiStar } from 'react-icons/fi';

const PlansPage = () => {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState('premium'); // Default to recommended plan
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
  };

  const handleGetStarted = () => {
    // Redirect to doctor registration (plan selection will be available after approval)
    router.push('/doctor/register');
  };

  const faqs = [
    {
      question: "¿Puedo cambiar de plan en cualquier momento?",
      answer: "Sí, puedes cambiar tu plan en cualquier momento desde tu perfil. Los cambios se aplican inmediatamente con prorrateo automático del costo."
    },
    {
      question: "¿Qué métodos de pago aceptan?",
      answer: "Aceptamos tarjetas de crédito, débito, transferencias bancarias y PSE. Todos los pagos son procesados de forma segura."
    },
    {
      question: "¿Hay permanencia mínima?",
      answer: "No, no hay permanencia mínima. Puedes cancelar tu suscripción en cualquier momento sin penalizaciones."
    },
    {
      question: "¿Qué pasa si mi pago falla?",
      answer: "Te notificaremos inmediatamente y tendrás 7 días para actualizar tu método de pago antes de que se suspenda temporalmente tu cuenta."
    },
    {
      question: "¿Ofrecen descuentos para clínicas grandes?",
      answer: "Sí, ofrecemos planes empresariales personalizados para clínicas con múltiples médicos. Contáctanos para más información."
    },
  ];

  const testimonials = [
    {
      name: "Dr. María González",
      specialty: "Cardióloga",
      plan: "Premium",
      quote: "La plataforma me ha permitido organizar mejor mis citas y tener un control total de mi agenda. El plan Premium tiene todas las herramientas que necesito.",
      rating: 5
    },
    {
      name: "Dr. Carlos Rodríguez",
      specialty: "Pediatra",
      plan: "Enterprise",
      quote: "Como director de una clínica, el plan Enterprise nos da la flexibilidad y las integraciones que necesitamos para gestionar múltiples especialistas.",
      rating: 5
    },
    {
      name: "Dra. Ana Martínez",
      specialty: "Dermatóloga",
      plan: "Basic",
      quote: "Perfecto para comenzar. El plan Básico me permitió digitalizar mi práctica sin una gran inversión inicial.",
      rating: 4
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary/10 to-blue-50 py-16">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-dark-grey mb-4">
              Planes de Suscripción para Médicos
            </h1>
            <p className="text-xl text-medium-grey max-w-3xl mx-auto">
              Elige el plan perfecto para tu práctica médica. Sin comisiones por cita, 
              solo una tarifa fija mensual con todas las herramientas que necesitas.
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="text-center p-6 bg-white rounded-xl shadow-sm">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <FiUsers className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-dark-grey mb-1">+1,000 Médicos</h3>
              <p className="text-sm text-medium-grey">Confían en nuestra plataforma</p>
            </div>
            <div className="text-center p-6 bg-white rounded-xl shadow-sm">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <FiTrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-dark-grey mb-1">98% Satisfacción</h3>
              <p className="text-sm text-medium-grey">De nuestros usuarios</p>
            </div>
            <div className="text-center p-6 bg-white rounded-xl shadow-sm">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <FiZap className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-dark-grey mb-1">24/7 Soporte</h3>
              <p className="text-sm text-medium-grey">Siempre disponible</p>
            </div>
          </div>
        </div>
      </div>

      {/* Plans Comparison */}
      <div className="py-16">
        <div className="container max-w-6xl mx-auto px-4">
          <PlanComparison
            selectedPlan={selectedPlan}
            onPlanSelect={handlePlanSelect}
            showBillingToggle={true}
          />
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-primary py-16">
        <div className="container max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            ¿Listo para comenzar?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Únete a más de 1,000 médicos que ya digitalizaron su práctica
          </p>
          
          {selectedPlan && (
            <div className="bg-white/10 rounded-lg p-6 mb-8 max-w-md mx-auto">
              <div className="text-white">
                <h3 className="font-semibold mb-2">Plan seleccionado:</h3>
                <div className="text-2xl font-bold">
                  {SUBSCRIPTION_PLANS[selectedPlan]?.name}
                </div>
                <div className="text-blue-100">
                  {formatCurrency(SUBSCRIPTION_PLANS[selectedPlan]?.monthlyFee || 0)}/mes
                </div>
              </div>
            </div>
          )}

          <button
            onClick={handleGetStarted}
            className="bg-white text-primary px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-50 transition-colors inline-flex items-center"
          >
            Comenzar Ahora
            <FiArrowRight className="ml-2 w-5 h-5" />
          </button>
          
          <p className="text-blue-100 text-sm mt-4">
            Prueba gratis por 30 días • Sin permanencia • Cancela cuando quieras
          </p>
        </div>
      </div>

      {/* Features Highlight */}
      <div className="py-16 bg-light-grey/30">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-dark-grey mb-4">
              ¿Por qué elegir nuestros planes?
            </h2>
            <p className="text-xl text-medium-grey">
              Diseñados específicamente para las necesidades de los médicos colombianos
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <FiCheck className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-dark-grey mb-2">Sin Comisiones</h3>
              <p className="text-medium-grey">
                Paga solo tu suscripción mensual. Sin comisiones adicionales por cada cita agendada.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <FiUsers className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-dark-grey mb-2">Fácil de Usar</h3>
              <p className="text-medium-grey">
                Interfaz intuitiva diseñada para médicos. Comienza a usar la plataforma en minutos.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <FiZap className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-dark-grey mb-2">Soporte Local</h3>
              <p className="text-medium-grey">
                Equipo de soporte en Colombia que entiende las necesidades del sistema de salud local.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <FiTrendingUp className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="font-semibold text-dark-grey mb-2">Analytics Avanzados</h3>
              <p className="text-medium-grey">
                Reportes detallados sobre tu práctica para tomar mejores decisiones de negocio.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <FiStar className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="font-semibold text-dark-grey mb-2">Actualizaciones Constantes</h3>
              <p className="text-medium-grey">
                Nuevas funcionalidades cada mes basadas en el feedback de nuestros usuarios.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <FiHelpCircle className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="font-semibold text-dark-grey mb-2">Onboarding Personalizado</h3>
              <p className="text-medium-grey">
                Te ayudamos a configurar tu perfil y comenzar a recibir pacientes desde el día uno.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="py-16">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-dark-grey mb-4">
              Lo que dicen nuestros médicos
            </h2>
            <p className="text-xl text-medium-grey">
              Testimonios reales de profesionales que ya usan nuestra plataforma
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-light-grey">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <FiStar
                      key={i}
                      className={`w-4 h-4 ${
                        i < testimonial.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-medium-grey mb-4 italic">"{testimonial.quote}"</p>
                <div>
                  <div className="font-semibold text-dark-grey">{testimonial.name}</div>
                  <div className="text-sm text-medium-grey">{testimonial.specialty}</div>
                  <div className="text-xs text-primary font-medium">Plan {testimonial.plan}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="py-16 bg-light-grey/30">
        <div className="container max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-dark-grey mb-4">
              Preguntas Frecuentes
            </h2>
            <p className="text-xl text-medium-grey">
              Resolvemos las dudas más comunes sobre nuestros planes
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white rounded-lg border border-light-grey overflow-hidden">
                <button
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-light-grey/30 transition-colors"
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                >
                  <span className="font-medium text-dark-grey">{faq.question}</span>
                  <FiHelpCircle className={`w-5 h-5 text-medium-grey transition-transform ${
                    openFaq === index ? 'rotate-180' : ''
                  }`} />
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-4">
                    <p className="text-medium-grey">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="py-16">
        <div className="container max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-dark-grey mb-4">
            Comienza tu transformación digital hoy
          </h2>
          <p className="text-xl text-medium-grey mb-8">
            Únete a la nueva generación de médicos que ya digitalizaron su práctica
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleGetStarted}
              className="bg-primary text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-600 transition-colors inline-flex items-center justify-center"
            >
              Comenzar Prueba Gratuita
              <FiArrowRight className="ml-2 w-5 h-5" />
            </button>
            <button
              onClick={() => router.push('/contact')}
              className="border border-primary text-primary px-8 py-4 rounded-lg font-semibold hover:bg-primary/5 transition-colors"
            >
              Hablar con un Experto
            </button>
          </div>
          
          <p className="text-medium-grey text-sm mt-6">
            ¿Tienes dudas? Contáctanos al <strong>+57 1 234 5678</strong> o{' '}
            <a href="mailto:soporte@medicalbooking.co" className="text-primary hover:underline">
              soporte@medicalbooking.co
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PlansPage; 