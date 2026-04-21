/**
 * lib/push/sender.ts
 *
 * Reusable helper for sending Expo push notifications to a user.
 * Safe to call from any server-side code, including Stripe webhooks — all
 * errors are caught internally and reflected in { sent, failed } counts.
 *
 * Environment variable (optional):
 *   EXPO_ACCESS_TOKEN — required only when using FCM v1 / per-project
 *   credentials in production (apps that have migrated from the legacy Expo
 *   push service). Obtain it at expo.dev → Account Settings → Access Tokens,
 *   then add it to .env.local and to Vercel environment variables.
 *   If omitted the legacy service is used, which works for development and
 *   for apps that have not yet migrated.
 */

import 'server-only';
import Expo from 'expo-server-sdk';
import { supabaseService } from '@/lib/supabase/service.server';
import { _sendPushWithDeps, type SenderDeps } from './sender-core';

export type { PushPayload, SenderDeps } from './sender-core';

/**
 * Send a push notification to every registered device for `userId`.
 * Returns { sent, failed } counts. Never throws.
 */
export async function sendPushToUser(
  userId: string,
  payload: import('./sender-core').PushPayload,
): Promise<{ sent: number; failed: number }> {
  // accessToken enables FCM v1 / per-project credentials when set.
  // The SDK handles the transport difference internally.
  const expo = new Expo(
    process.env.EXPO_ACCESS_TOKEN ? { accessToken: process.env.EXPO_ACCESS_TOKEN } : {},
  );

  const svc = supabaseService();

  const deps: SenderDeps = {
    async fetchTokens(uid) {
      const { data, error } = await svc
        .from('push_tokens')
        .select('token')
        .eq('user_id', uid);
      if (error) {
        console.error('[push] fetchTokens error:', error);
        return [];
      }
      return (data ?? []).map((r: { token: string }) => r.token);
    },

    async deleteToken(uid, token) {
      const { error } = await svc
        .from('push_tokens')
        .delete()
        .eq('user_id', uid)
        .eq('token', token);
      if (error) console.error('[push] deleteToken error:', error);
    },

    chunkMessages: (msgs) => expo.chunkPushNotifications(msgs),

    sendChunk: (chunk) => expo.sendPushNotificationsAsync(chunk),
  };

  return _sendPushWithDeps(userId, payload, deps);
}
