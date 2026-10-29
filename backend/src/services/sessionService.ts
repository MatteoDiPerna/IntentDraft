import type { FastifyReply, FastifyRequest } from 'fastify';
import type { User as DbUser } from '@prisma/client';
import type { Env } from '../config/env.js';
import { prisma } from '../lib/db.js';

export type SessionCookieOptions = {
  path: '/';
  httpOnly: true;
  secure: boolean;
  sameSite: 'lax';
  maxAge: number;
  signed: true;
};

export function sessionCookieOptions(env: Env): SessionCookieOptions {
  return {
    path: '/',
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: env.SESSION_TTL_DAYS * 24 * 60 * 60,
    signed: true,
  };
}

export async function createSession(userId: string, env: Env): Promise<string> {
  const expiresAt = new Date(Date.now() + env.SESSION_TTL_DAYS * 24 * 60 * 60 * 1000);
  const session = await prisma.session.create({
    data: { userId, expiresAt },
  });
  return session.id;
}

export function setSessionCookie(reply: FastifyReply, env: Env, sessionId: string): void {
  reply.setCookie(env.SESSION_COOKIE_NAME, sessionId, sessionCookieOptions(env));
}

export function clearSessionCookie(reply: FastifyReply, env: Env): void {
  reply.clearCookie(env.SESSION_COOKIE_NAME, { path: '/' });
}

export function readSessionIdFromRequest(request: FastifyRequest, env: Env): string | null {
  const raw = request.cookies[env.SESSION_COOKIE_NAME];
  if (!raw) return null;
  const unsigned = request.unsignCookie(raw);
  if (!unsigned.valid || !unsigned.value) return null;
  return unsigned.value;
}

export async function findUserBySessionId(sessionId: string): Promise<DbUser | null> {
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: { user: true },
  });
  if (!session) return null;
  if (session.expiresAt.getTime() <= Date.now()) {
    await prisma.session.delete({ where: { id: sessionId } }).catch(() => undefined);
    return null;
  }
  return session.user;
}

export async function resolveUserFromRequest(
  request: FastifyRequest,
  env: Env,
): Promise<DbUser | null> {
  const sessionId = readSessionIdFromRequest(request, env);
  if (!sessionId) return null;
  return findUserBySessionId(sessionId);
}

export async function deleteSessionById(sessionId: string): Promise<void> {
  await prisma.session.delete({ where: { id: sessionId } }).catch(() => undefined);
}

export async function logoutRequest(request: FastifyRequest, env: Env): Promise<void> {
  const sessionId = readSessionIdFromRequest(request, env);
  if (sessionId) await deleteSessionById(sessionId);
}
