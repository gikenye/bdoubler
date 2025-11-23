import { NextRequest, NextResponse } from 'next/server';
import { getSessionById, updateSession, deleteSession, joinSession } from '../../../../lib/sessionStore';
import { UpdateSessionRequest, JoinSessionRequest } from '../../../../lib/sessionTypes';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getSessionById(id);
    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }
    return NextResponse.json(session);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch session' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // For joining session
  try {
    const { id } = await params;
    const body: JoinSessionRequest = await request.json();
    if (!body.userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }
    const session = await joinSession(id, body.userId);
    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }
    return NextResponse.json(session);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to join session' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // For updating session status
  try {
    const { id } = await params;
    const body: UpdateSessionRequest = await request.json();
    if (!body.status) {
      return NextResponse.json({ error: 'Missing status' }, { status: 400 });
    }
    const session = await updateSession(id, body);
    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }
    return NextResponse.json(session);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update session' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const success = await deleteSession(id);
    if (!success) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Session deleted' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete session' }, { status: 500 });
  }
}