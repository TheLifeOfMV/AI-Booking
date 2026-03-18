import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || '' });

export interface ParsedIntent {
  intent:
    | 'book_appointment'
    | 'cancel_appointment'
    | 'check_appointments'
    | 'select_specialty'
    | 'select_doctor'
    | 'select_slot'
    | 'confirm'
    | 'deny'
    | 'greeting'
    | 'help'
    | 'unknown';
  entities: {
    specialty_name?: string;
    doctor_name?: string;
    date?: string;
    time?: string;
    slot_index?: number;
    booking_id?: string;
  };
  confidence: number;
}

export async function parseIntent(
  userMessage: string,
  conversationState: string,
  context: Record<string, any>
): Promise<ParsedIntent> {
  const systemPrompt = `You are an intent parser for a medical appointment booking assistant.
The user is in conversation state: "${conversationState}".
Current context: ${JSON.stringify(context)}

Parse the user's message and return a JSON object with:
- intent: one of [book_appointment, cancel_appointment, check_appointments, select_specialty, select_doctor, select_slot, confirm, deny, greeting, help, unknown]
- entities: extracted data like specialty_name, doctor_name, date (YYYY-MM-DD), time (HH:MM), slot_index (0-based number if user picks by number), booking_id
- confidence: 0-1

Rules:
- If state is "awaiting_specialty" and user sends text, intent should be "select_specialty" with specialty_name
- If state is "awaiting_doctor" and user sends text, intent should be "select_doctor" with doctor_name or slot_index
- If state is "awaiting_slot" and user sends text/number, intent should be "select_slot" with slot_index or time
- If state is "awaiting_confirmation" and user says yes/sí/confirmo, intent should be "confirm"
- If state is "awaiting_confirmation" and user says no/cancelar, intent should be "deny"
- If user says hola, hi, buenos días, etc., intent is "greeting"
- If user mentions "agendar", "cita", "reservar", "appointment", intent is "book_appointment"
- If user mentions "cancelar mi cita", intent is "cancel_appointment"
- If user mentions "mis citas", "ver citas", intent is "check_appointments"
- Numbers like "1", "2", "3" map to slot_index (0-based, so "1" = 0)

Respond ONLY with valid JSON, no markdown.`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.1,
      max_tokens: 300,
    });

    const content = response.choices[0]?.message?.content?.trim() || '';
    const parsed = JSON.parse(content);

    return {
      intent: parsed.intent || 'unknown',
      entities: parsed.entities || {},
      confidence: parsed.confidence || 0.5,
    };
  } catch (error) {
    console.error('AI intent parsing error:', error);
    return { intent: 'unknown', entities: {}, confidence: 0 };
  }
}

export async function generateResponse(
  state: string,
  context: Record<string, any>,
  data: any
): Promise<string> {
  const systemPrompt = `You are a friendly medical appointment booking assistant for a Colombian healthcare platform.
You communicate in Spanish (Colombia). Be warm, professional, and concise.
Current state: ${state}
Context: ${JSON.stringify(context)}
Available data: ${JSON.stringify(data)}

Generate a natural, helpful message for the patient based on the current state and data.
Keep messages under 500 characters. Use emojis sparingly (1-2 max per message).
Do NOT use markdown formatting - this is WhatsApp plain text.

Respond ONLY with the message text, nothing else.`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'system', content: systemPrompt }],
      temperature: 0.7,
      max_tokens: 300,
    });

    return response.choices[0]?.message?.content?.trim() || '';
  } catch (error) {
    console.error('AI response generation error:', error);
    return '';
  }
}
