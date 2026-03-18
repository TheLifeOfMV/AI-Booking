import { NextRequest, NextResponse } from 'next/server';
import { handleIncomingMessage } from '@/domains/whatsappService/conversationHandler';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;

  if (mode === 'subscribe' && token === verifyToken) {
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const messages = value?.messages;

    if (!messages || messages.length === 0) {
      return NextResponse.json({ status: 'no_messages' });
    }

    for (const message of messages) {
      const phone = message.from;
      let text = '';
      let interactiveId: string | undefined;

      if (message.type === 'text') {
        text = message.text?.body || '';
      } else if (message.type === 'interactive') {
        if (message.interactive?.type === 'list_reply') {
          interactiveId = message.interactive.list_reply.id;
          text = message.interactive.list_reply.title;
        } else if (message.interactive?.type === 'button_reply') {
          interactiveId = message.interactive.button_reply.id;
          text = message.interactive.button_reply.title;
        }
      } else {
        continue;
      }

      if (phone && (text || interactiveId)) {
        await handleIncomingMessage(phone, text, interactiveId);
      }
    }

    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('WhatsApp webhook error:', error);
    return NextResponse.json({ status: 'ok' });
  }
}
