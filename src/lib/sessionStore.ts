import { promises as fs } from 'fs';
import path from 'path';
import { Session } from './sessionTypes';

const SESSIONS_FILE = path.join(process.cwd(), 'sessions.json');

let sessionsCache: Session[] = [];
let loaded = false;

async function loadSessions(): Promise<Session[]> {
  if (loaded) return sessionsCache;
  try {
    const data = await fs.readFile(SESSIONS_FILE, 'utf-8');
    sessionsCache = JSON.parse(data);
  } catch (error) {
    // File doesn't exist or error, return empty array
    sessionsCache = [];
  }
  loaded = true;
  return sessionsCache;
}

async function saveSessions(sessions: Session[]): Promise<void> {
  sessionsCache = sessions;
  await fs.writeFile(SESSIONS_FILE, JSON.stringify(sessions, null, 2));
}

export async function getAllSessions(): Promise<Session[]> {
  return await loadSessions();
}

export async function getSessionById(id: string): Promise<Session | undefined> {
  const sessions = await loadSessions();
  return sessions.find(s => s.id === id);
}

export async function createSession(session: Session): Promise<void> {
  const sessions = await loadSessions();
  sessions.push(session);
  await saveSessions(sessions);
}

export async function updateSession(id: string, updates: Partial<Session>): Promise<Session | undefined> {
  const sessions = await loadSessions();
  const index = sessions.findIndex(s => s.id === id);
  if (index === -1) return undefined;
  sessions[index] = { ...sessions[index], ...updates, updatedAt: new Date().toISOString() };
  await saveSessions(sessions);
  return sessions[index];
}

export async function deleteSession(id: string): Promise<boolean> {
  const sessions = await loadSessions();
  const index = sessions.findIndex(s => s.id === id);
  if (index === -1) return false;
  sessions.splice(index, 1);
  await saveSessions(sessions);
  return true;
}

export async function joinSession(id: string, userId: string): Promise<Session | undefined> {
  const session = await getSessionById(id);
  if (!session) return undefined;
  if (session.participants.includes(userId)) return session; // already joined
  session.participants.push(userId);
  session.updatedAt = new Date().toISOString();
  await updateSession(id, session);
  return session;
}