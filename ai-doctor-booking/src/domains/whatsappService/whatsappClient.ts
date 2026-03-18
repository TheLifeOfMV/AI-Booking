const WHATSAPP_API_URL = 'https://graph.facebook.com/v19.0';

function getConfig() {
  const token = process.env.WHATSAPP_API_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!token || !phoneNumberId) {
    throw new Error('WHATSAPP_API_TOKEN and WHATSAPP_PHONE_NUMBER_ID are required');
  }

  return { token, phoneNumberId };
}

export async function sendTextMessage(to: string, text: string): Promise<void> {
  const { token, phoneNumberId } = getConfig();

  const res = await fetch(`${WHATSAPP_API_URL}/${phoneNumberId}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: { body: text },
    }),
  });

  if (!res.ok) {
    const error = await res.text();
    console.error('WhatsApp send failed:', error);
    throw new Error(`WhatsApp API error: ${res.status}`);
  }
}

export async function sendInteractiveList(
  to: string,
  headerText: string,
  bodyText: string,
  buttonText: string,
  sections: { title: string; rows: { id: string; title: string; description?: string }[] }[]
): Promise<void> {
  const { token, phoneNumberId } = getConfig();

  const res = await fetch(`${WHATSAPP_API_URL}/${phoneNumberId}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to,
      type: 'interactive',
      interactive: {
        type: 'list',
        header: { type: 'text', text: headerText },
        body: { text: bodyText },
        action: {
          button: buttonText,
          sections,
        },
      },
    }),
  });

  if (!res.ok) {
    const error = await res.text();
    console.error('WhatsApp interactive send failed:', error);
    throw new Error(`WhatsApp API error: ${res.status}`);
  }
}

export async function sendInteractiveButtons(
  to: string,
  bodyText: string,
  buttons: { id: string; title: string }[]
): Promise<void> {
  const { token, phoneNumberId } = getConfig();

  const res = await fetch(`${WHATSAPP_API_URL}/${phoneNumberId}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to,
      type: 'interactive',
      interactive: {
        type: 'button',
        body: { text: bodyText },
        action: {
          buttons: buttons.map((b) => ({
            type: 'reply',
            reply: { id: b.id, title: b.title },
          })),
        },
      },
    }),
  });

  if (!res.ok) {
    const error = await res.text();
    console.error('WhatsApp buttons send failed:', error);
    throw new Error(`WhatsApp API error: ${res.status}`);
  }
}
