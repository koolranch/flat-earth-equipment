/**
 * lib/push/sender-core.ts
 *
 * Pure (side-effect-free) core of the push sender.
 * No server-only imports — safe to import in Playwright tests.
 *
 * The real sendPushToUser (in lib/push/sender.server.ts) wires up Supabase +
 * the Expo SDK and delegates here. Tests inject mocks directly.
 */

import type { ExpoPushMessage, ExpoPushTicket } from 'expo-server-sdk';

export interface PushPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
  /** Defaults to 'default'. Pass null for a silent notification. */
  sound?: 'default' | null;
}

export interface SenderDeps {
  fetchTokens: (userId: string) => Promise<string[]>;
  deleteToken: (userId: string, token: string) => Promise<void>;
  chunkMessages: (messages: ExpoPushMessage[]) => ExpoPushMessage[][];
  sendChunk: (messages: ExpoPushMessage[]) => Promise<ExpoPushTicket[]>;
}

/**
 * Core implementation with fully injectable deps.
 * Exported with underscore prefix to signal it is for internal / test use.
 * Never throws — all errors are caught and reflected in { sent, failed }.
 */
export async function _sendPushWithDeps(
  userId: string,
  payload: PushPayload,
  deps: SenderDeps,
): Promise<{ sent: number; failed: number }> {
  let sent = 0;
  let failed = 0;

  try {
    // 1. Fetch registered tokens for this user
    const tokens = await deps.fetchTokens(userId);
    if (tokens.length === 0) {
      return { sent: 0, failed: 0 };
    }

    // 2. Build one message per token
    const messages: ExpoPushMessage[] = tokens.map((token) => ({
      to: token,
      title: payload.title,
      body: payload.body,
      data: payload.data,
      sound: payload.sound === null ? undefined : 'default',
    }));

    // 3. Chunk + send
    const chunks = deps.chunkMessages(messages);
    const allTickets: ExpoPushTicket[] = [];

    for (const chunk of chunks) {
      try {
        const tickets = await deps.sendChunk(chunk);
        allTickets.push(...tickets);
      } catch (chunkErr) {
        console.error('[push] sendChunk error:', chunkErr);
        failed += chunk.length;
      }
    }

    // 4. Process tickets
    for (let i = 0; i < allTickets.length; i++) {
      const ticket = allTickets[i];
      if (ticket.status === 'ok') {
        sent += 1;
      } else {
        failed += 1;
        const errCode = (ticket as any).details?.error as string | undefined;
        if (errCode === 'DeviceNotRegistered' || errCode === 'InvalidCredentials') {
          const staleToken = tokens[i];
          if (staleToken) {
            try {
              await deps.deleteToken(userId, staleToken);
            } catch (delErr) {
              console.error('[push] failed to delete stale token:', delErr);
            }
          }
        }
      }
    }
  } catch (err) {
    console.error('[push] _sendPushWithDeps unexpected error:', err);
    failed += 1;
  }

  return { sent, failed };
}
