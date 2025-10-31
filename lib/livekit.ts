import { Room, RoomOptions, DefaultReconnectPolicy } from 'livekit-client';

const API_BASE = (process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:5001/api').replace(/\/$/, '');
const LIVEKIT_URL = (process.env.EXPO_PUBLIC_LIVEKIT_URL || 'ws://localhost:7880').replace(/\/$/, '');

export type LiveKitTokenRequest = {
  roomName: string;
  identity: string;
  name?: string;
  canPublish?: boolean;
  canSubscribe?: boolean;
};

export async function fetchLiveKitToken(req: LiveKitTokenRequest): Promise<string> {
  const res = await fetch(`${API_BASE}/livekit/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to fetch LiveKit token: ${res.status} ${text}`);
  }
  const data = await res.json();
  return data.token as string;
}

export async function connectToRoom(token: string, opts?: Partial<RoomOptions>): Promise<Room> {
  const room = new Room({
    reconnectPolicy: new DefaultReconnectPolicy(),
    adaptiveStream: true,
    dynacast: true,
    stopLocalTrackOnUnpublish: true,
    ...opts,
  });

  await room.connect(LIVEKIT_URL, token);
  return room;
}