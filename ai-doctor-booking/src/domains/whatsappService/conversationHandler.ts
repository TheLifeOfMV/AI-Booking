import { getServerSupabaseClient } from '@/platform/lib/supabaseClient';
import { getSpecialties } from '@/domains/shared/services/specialtyService.server';
import { getApprovedDoctors, getDoctorAvailableSlots } from '@/domains/doctorService/services/doctorService.server';
import { createBooking } from '@/domains/shared/services/bookingService.server';
import { sendTextMessage, sendInteractiveList, sendInteractiveButtons } from './whatsappClient';
import { parseIntent } from './aiAgent';

type ConversationState =
  | 'greeting'
  | 'awaiting_specialty'
  | 'awaiting_doctor'
  | 'awaiting_date'
  | 'awaiting_slot'
  | 'awaiting_confirmation'
  | 'completed';

interface Conversation {
  id: string;
  phone_number: string;
  patient_user_id: string | null;
  state: ConversationState;
  context: Record<string, any>;
}

async function getOrCreateConversation(phone: string): Promise<Conversation> {
  const supabase = getServerSupabaseClient(true);

  const { data: existing } = await supabase
    .from('whatsapp_conversations')
    .select('*')
    .eq('phone_number', phone)
    .neq('state', 'completed')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (existing) {
    const fiveHoursAgo = new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString();
    if (existing.last_message_at < fiveHoursAgo) {
      await supabase
        .from('whatsapp_conversations')
        .update({ state: 'completed' })
        .eq('id', existing.id);
    } else {
      return existing as Conversation;
    }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('user_id')
    .eq('phone_number', phone)
    .single();

  const { data: newConv } = await supabase
    .from('whatsapp_conversations')
    .insert({
      phone_number: phone,
      patient_user_id: profile?.user_id || null,
      state: 'greeting',
      context: {},
    })
    .select()
    .single();

  return newConv as Conversation;
}

async function updateConversation(
  id: string,
  state: ConversationState,
  context: Record<string, any>
): Promise<void> {
  const supabase = getServerSupabaseClient(true);
  await supabase
    .from('whatsapp_conversations')
    .update({ state, context, last_message_at: new Date().toISOString() })
    .eq('id', id);
}

export async function handleIncomingMessage(
  phone: string,
  messageText: string,
  interactiveId?: string
): Promise<void> {
  const conv = await getOrCreateConversation(phone);
  const text = interactiveId || messageText;

  const intent = await parseIntent(text, conv.state, conv.context);

  try {
    switch (conv.state) {
      case 'greeting':
        await handleGreeting(conv, intent, text);
        break;
      case 'awaiting_specialty':
        await handleSpecialtySelection(conv, intent, text);
        break;
      case 'awaiting_doctor':
        await handleDoctorSelection(conv, intent, text);
        break;
      case 'awaiting_date':
        await handleDateSelection(conv, intent, text);
        break;
      case 'awaiting_slot':
        await handleSlotSelection(conv, intent, text);
        break;
      case 'awaiting_confirmation':
        await handleConfirmation(conv, intent, text);
        break;
      default:
        await handleGreeting(conv, intent, text);
    }
  } catch (error) {
    console.error('Conversation handler error:', error);
    await sendTextMessage(
      phone,
      'Lo siento, ocurrió un error. Por favor intenta de nuevo escribiendo "hola".'
    );
  }
}

async function handleGreeting(
  conv: Conversation,
  intent: any,
  _text: string
): Promise<void> {
  if (!conv.patient_user_id) {
    await sendTextMessage(
      conv.phone_number,
      'Hola! Bienvenido al sistema de citas médicas. Para agendar citas por WhatsApp, necesitas tener una cuenta registrada con este número de teléfono. Regístrate en nuestra app y vuelve a escribirnos.'
    );
    await updateConversation(conv.id, 'completed', {});
    return;
  }

  if (
    intent.intent === 'book_appointment' ||
    intent.intent === 'greeting' ||
    intent.intent === 'help'
  ) {
    const specialtiesResult = await getSpecialties();
    if (!specialtiesResult.success || !specialtiesResult.data) {
      await sendTextMessage(conv.phone_number, 'Lo siento, no pude cargar las especialidades. Intenta más tarde.');
      return;
    }

    const specialties = specialtiesResult.data;
    const rows = specialties.slice(0, 10).map((s) => ({
      id: `specialty_${s.id}`,
      title: s.name.substring(0, 24),
      description: s.description?.substring(0, 72) || undefined,
    }));

    await sendInteractiveList(
      conv.phone_number,
      'Agendar Cita',
      'Hola! Te ayudo a agendar una cita médica. Selecciona la especialidad que necesitas:',
      'Ver Especialidades',
      [{ title: 'Especialidades', rows }]
    );

    await updateConversation(conv.id, 'awaiting_specialty', {
      specialties: specialties.map((s) => ({ id: s.id, name: s.name })),
    });
  } else if (intent.intent === 'check_appointments') {
    await handleCheckAppointments(conv);
  } else if (intent.intent === 'cancel_appointment') {
    await sendTextMessage(
      conv.phone_number,
      'Para cancelar una cita, por favor usa nuestra app o contacta a soporte. Escribe "cita" si quieres agendar una nueva cita.'
    );
  } else {
    await sendTextMessage(
      conv.phone_number,
      'Hola! Soy el asistente de citas médicas. Puedo ayudarte a:\n\n1. Agendar una cita - escribe "agendar cita"\n2. Ver mis citas - escribe "mis citas"\n\n¿En qué te puedo ayudar?'
    );
  }
}

async function handleSpecialtySelection(
  conv: Conversation,
  intent: any,
  text: string
): Promise<void> {
  let specialtyId: number | null = null;
  let specialtyName = '';

  if (text.startsWith('specialty_')) {
    specialtyId = parseInt(text.replace('specialty_', ''));
    const match = conv.context.specialties?.find((s: any) => s.id === specialtyId);
    specialtyName = match?.name || '';
  } else if (intent.entities.specialty_name) {
    const match = conv.context.specialties?.find(
      (s: any) =>
        s.name.toLowerCase().includes(intent.entities.specialty_name!.toLowerCase())
    );
    if (match) {
      specialtyId = match.id;
      specialtyName = match.name;
    }
  }

  if (!specialtyId) {
    await sendTextMessage(
      conv.phone_number,
      'No encontré esa especialidad. Por favor selecciona una de la lista.'
    );
    return;
  }

  const doctorsResult = await getApprovedDoctors({ specialtyId, limit: 10 });
  if (
    !doctorsResult.success ||
    !doctorsResult.data ||
    doctorsResult.data.doctors.length === 0
  ) {
    await sendTextMessage(
      conv.phone_number,
      `No hay doctores disponibles en ${specialtyName} en este momento. Escribe "cita" para ver otras especialidades.`
    );
    await updateConversation(conv.id, 'greeting', {});
    return;
  }

  const doctors = doctorsResult.data.doctors;
  const rows = doctors.map((d) => ({
    id: `doctor_${d.user_id}`,
    title: (d.profile?.full_name || 'Doctor').substring(0, 24),
    description: d.location?.substring(0, 72) || undefined,
  }));

  await sendInteractiveList(
    conv.phone_number,
    specialtyName,
    `Estos son los doctores disponibles en ${specialtyName}. Selecciona uno:`,
    'Ver Doctores',
    [{ title: 'Doctores', rows }]
  );

  const doctorList = doctors.map((d) => ({
    user_id: d.user_id,
    name: d.profile?.full_name || 'Doctor',
    location: d.location,
    fee: d.consultation_fee,
  }));

  await updateConversation(conv.id, 'awaiting_doctor', {
    ...conv.context,
    specialty_id: specialtyId,
    specialty_name: specialtyName,
    doctors: doctorList,
  });
}

async function handleDoctorSelection(
  conv: Conversation,
  intent: any,
  text: string
): Promise<void> {
  let doctorUserId: string | null = null;
  let doctorName = '';

  if (text.startsWith('doctor_')) {
    doctorUserId = text.replace('doctor_', '');
    const match = conv.context.doctors?.find((d: any) => d.user_id === doctorUserId);
    doctorName = match?.name || '';
  } else if (intent.entities.doctor_name) {
    const match = conv.context.doctors?.find(
      (d: any) =>
        d.name.toLowerCase().includes(intent.entities.doctor_name!.toLowerCase())
    );
    if (match) {
      doctorUserId = match.user_id;
      doctorName = match.name;
    }
  } else if (intent.entities.slot_index !== undefined) {
    const idx = intent.entities.slot_index;
    const doctor = conv.context.doctors?.[idx];
    if (doctor) {
      doctorUserId = doctor.user_id;
      doctorName = doctor.name;
    }
  }

  if (!doctorUserId) {
    await sendTextMessage(
      conv.phone_number,
      'No encontré ese doctor. Por favor selecciona uno de la lista.'
    );
    return;
  }

  await sendTextMessage(
    conv.phone_number,
    `Has seleccionado a ${doctorName}. ¿Para qué fecha deseas la cita?\n\nEscribe la fecha en formato DD/MM/YYYY (ej: 25/03/2026)`
  );

  await updateConversation(conv.id, 'awaiting_date', {
    ...conv.context,
    doctor_user_id: doctorUserId,
    doctor_name: doctorName,
  });
}

async function handleDateSelection(
  conv: Conversation,
  intent: any,
  text: string
): Promise<void> {
  let dateStr: string | null = null;

  if (intent.entities.date) {
    dateStr = intent.entities.date;
  } else {
    const match = text.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
    if (match) {
      const [, day, month, year] = match;
      dateStr = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
  }

  if (!dateStr) {
    await sendTextMessage(
      conv.phone_number,
      'No pude entender la fecha. Por favor escríbela en formato DD/MM/YYYY (ej: 25/03/2026)'
    );
    return;
  }

  const requestedDate = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (requestedDate < today) {
    await sendTextMessage(
      conv.phone_number,
      'La fecha no puede ser en el pasado. Por favor escribe una fecha futura.'
    );
    return;
  }

  const slotsResult = await getDoctorAvailableSlots(
    conv.context.doctor_user_id,
    dateStr
  );

  if (
    !slotsResult.success ||
    !slotsResult.data ||
    slotsResult.data.length === 0
  ) {
    await sendTextMessage(
      conv.phone_number,
      `No hay horarios disponibles para ${conv.context.doctor_name} el ${dateStr}. Intenta con otra fecha.`
    );
    return;
  }

  const availableSlots = slotsResult.data.filter((s: any) => s.available);

  if (availableSlots.length === 0) {
    await sendTextMessage(
      conv.phone_number,
      `Todos los horarios están ocupados para esa fecha. Intenta con otra fecha.`
    );
    return;
  }

  const slotList = availableSlots.slice(0, 10).map((s: any, i: number) => ({
    id: `slot_${i}`,
    title: s.time,
  }));

  await sendInteractiveList(
    conv.phone_number,
    `Horarios - ${dateStr}`,
    `Horarios disponibles con ${conv.context.doctor_name}.\nSelecciona un horario:`,
    'Ver Horarios',
    [{ title: 'Horarios', rows: slotList }]
  );

  await updateConversation(conv.id, 'awaiting_slot', {
    ...conv.context,
    date: dateStr,
    available_slots: availableSlots.map((s: any) => s.time),
  });
}

async function handleSlotSelection(
  conv: Conversation,
  intent: any,
  text: string
): Promise<void> {
  let selectedTime: string | null = null;

  if (text.startsWith('slot_')) {
    const idx = parseInt(text.replace('slot_', ''));
    selectedTime = conv.context.available_slots?.[idx] || null;
  } else if (intent.entities.time) {
    selectedTime = intent.entities.time;
  } else if (intent.entities.slot_index !== undefined) {
    selectedTime = conv.context.available_slots?.[intent.entities.slot_index] || null;
  } else {
    const match = text.match(/(\d{1,2}):(\d{2})/);
    if (match) {
      selectedTime = `${match[1].padStart(2, '0')}:${match[2]}`;
    }
  }

  if (!selectedTime || !conv.context.available_slots?.includes(selectedTime)) {
    await sendTextMessage(
      conv.phone_number,
      'No pude identificar el horario. Por favor selecciona uno de la lista.'
    );
    return;
  }

  const summary =
    `Resumen de tu cita:\n\n` +
    `Especialidad: ${conv.context.specialty_name}\n` +
    `Doctor: ${conv.context.doctor_name}\n` +
    `Fecha: ${conv.context.date}\n` +
    `Hora: ${selectedTime}\n\n` +
    `¿Confirmas la cita?`;

  await sendInteractiveButtons(conv.phone_number, summary, [
    { id: 'confirm_yes', title: 'Sí, confirmar' },
    { id: 'confirm_no', title: 'No, cancelar' },
  ]);

  await updateConversation(conv.id, 'awaiting_confirmation', {
    ...conv.context,
    selected_time: selectedTime,
  });
}

async function handleConfirmation(
  conv: Conversation,
  intent: any,
  text: string
): Promise<void> {
  const isConfirm =
    text === 'confirm_yes' ||
    intent.intent === 'confirm' ||
    /^(s[ií]|yes|confirmo|confirmar|ok)$/i.test(text.trim());

  if (!isConfirm) {
    await sendTextMessage(
      conv.phone_number,
      'Cita cancelada. Escribe "cita" si quieres agendar una nueva.'
    );
    await updateConversation(conv.id, 'completed', conv.context);
    return;
  }

  if (!conv.patient_user_id) {
    await sendTextMessage(
      conv.phone_number,
      'Error: No se encontró tu cuenta. Regístrate en la app con este número de teléfono.'
    );
    await updateConversation(conv.id, 'completed', conv.context);
    return;
  }

  const appointmentTime = `${conv.context.date}T${conv.context.selected_time}:00`;

  const result = await createBooking({
    patient_user_id: conv.patient_user_id,
    doctor_user_id: conv.context.doctor_user_id,
    specialty_id: conv.context.specialty_id,
    appointment_time: appointmentTime,
    channel: 'whatsapp',
  });

  if (result.success) {
    await sendTextMessage(
      conv.phone_number,
      `Tu cita ha sido agendada exitosamente!\n\n` +
        `Doctor: ${conv.context.doctor_name}\n` +
        `Fecha: ${conv.context.date}\n` +
        `Hora: ${conv.context.selected_time}\n\n` +
        `Recibirás un recordatorio antes de tu cita. Si necesitas cancelar o reprogramar, usa la app.`
    );
  } else {
    await sendTextMessage(
      conv.phone_number,
      `Lo siento, no se pudo agendar la cita: ${result.error?.message || 'Error desconocido'}. Escribe "cita" para intentar de nuevo.`
    );
  }

  await updateConversation(conv.id, 'completed', {
    ...conv.context,
    booking_result: result.success ? 'success' : 'failed',
  });
}

async function handleCheckAppointments(conv: Conversation): Promise<void> {
  if (!conv.patient_user_id) {
    await sendTextMessage(
      conv.phone_number,
      'No tienes una cuenta asociada a este número. Regístrate en la app.'
    );
    return;
  }

  const supabase = getServerSupabaseClient(true);
  const { data: bookings } = await supabase
    .from('bookings')
    .select(
      `*, doctors:doctor_user_id(profiles!inner(full_name)), specialties:specialty_id(name)`
    )
    .eq('patient_user_id', conv.patient_user_id)
    .in('status', ['pending', 'confirmed'])
    .order('appointment_time', { ascending: true })
    .limit(5);

  if (!bookings || bookings.length === 0) {
    await sendTextMessage(
      conv.phone_number,
      'No tienes citas próximas. Escribe "cita" para agendar una nueva.'
    );
    return;
  }

  let msg = 'Tus próximas citas:\n\n';
  for (const b of bookings) {
    const date = new Date(b.appointment_time);
    const doctorName = (b as any).doctors?.profiles?.full_name || 'Doctor';
    const specialtyName = (b as any).specialties?.name || '';
    msg += `- ${date.toLocaleDateString('es-CO')} ${date.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })} | ${doctorName} (${specialtyName}) | ${b.status}\n`;
  }
  msg += '\nEscribe "cita" para agendar una nueva.';

  await sendTextMessage(conv.phone_number, msg);
  await updateConversation(conv.id, 'completed', {});
}
