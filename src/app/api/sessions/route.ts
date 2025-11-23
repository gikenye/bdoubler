import { NextRequest, NextResponse } from 'next/server';
import { getAllSessions, createSession } from '../../../lib/sessionStore';
import { CreateSessionRequest, Session } from '../../../lib/sessionTypes';
import { randomUUID } from 'crypto';

export async function GET() {
  try {
    const sessions = await getAllSessions();
    return NextResponse.json(sessions);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateSessionRequest = await request.json();
    if (!body.name || !body.creatorId) {
      return NextResponse.json({ error: 'Missing name or creatorId' }, { status: 400 });
    }
    const now = new Date().toISOString();
    const session: Session = {
      id: randomUUID(),
      name: body.name,
      creatorId: body.creatorId,
      participants: [body.creatorId],
      status: 'active',
      createdAt: now,
      updatedAt: now,
    };
    await createSession(session);
    return NextResponse.json(session, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
  }
}