import createContextHook from "@nkzw/create-context-hook";
import { useEffect, useMemo, useRef, useState } from "react";
import { Room, RoomEvent, RemoteParticipant, LocalParticipant } from "livekit-client";
import { fetchLiveKitToken, connectToRoom } from "../lib/livekit";
import { useAuth } from "./AuthProvider";
import { useWindowDimensions } from "react-native";

export type LKParticipant = RemoteParticipant | LocalParticipant;

export type LiveKitState = {
  room: Room | null;
  isConnecting: boolean;
  error?: string;
  participants: LKParticipant[];
  layoutRatio: number; // 0.7 portrait, 0.5 landscape
  join: (roomName: string) => Promise<void>;
  leave: () => Promise<void>;
  setMicEnabled: (enabled: boolean) => Promise<void>;
  setCamEnabled: (enabled: boolean) => Promise<void>;
  recentJoins: string[]; // participant identities joined recently for animation
};

export const [LiveKitProvider, useLiveKit] = createContextHook<LiveKitState>(() => {
  const { user } = useAuth();
  const [room, setRoom] = useState<Room | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [participants, setParticipants] = useState<LKParticipant[]>([]);
  const [recentJoins, setRecentJoins] = useState<string[]>([]);
  const joinTimeouts = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const { width, height } = useWindowDimensions();
  const layoutRatio = width < height ? 0.7 : 0.5;

  useEffect(() => {
    const r = room;
    if (!r) return;

    const rebuild = () => {
      const remotes = Array.from(r.remoteParticipants.values());
      setParticipants([r.localParticipant, ...remotes]);
    };

    const onParticipantConnected = (p: RemoteParticipant) => {
      rebuild();
      if (p.identity) {
        setRecentJoins((prev) => [p.identity, ...prev].slice(0, 10));
        const prevTimeout = joinTimeouts.current[p.identity];
        if (prevTimeout) clearTimeout(prevTimeout);
        joinTimeouts.current[p.identity] = setTimeout(() => {
          setRecentJoins((prev) => prev.filter((id) => id !== p.identity));
        }, 2500);
      }
    };

    const onParticipantDisconnected = () => {
      rebuild();
    };

    r.on(RoomEvent.ParticipantConnected, onParticipantConnected);
    r.on(RoomEvent.ParticipantDisconnected, onParticipantDisconnected);

    // Initial build
    rebuild();

    return () => {
      r.off(RoomEvent.ParticipantConnected, onParticipantConnected);
      r.off(RoomEvent.ParticipantDisconnected, onParticipantDisconnected);
    };
  }, [room]);

  const join = async (roomName: string) => {
    if (!user) {
      setError('User not logged in');
      return;
    }
    setIsConnecting(true);
    setError(undefined);
    try {
      const token = await fetchLiveKitToken({
        roomName,
        identity: user.id,
        name: user.displayName || user.username,
        canPublish: true,
        canSubscribe: true,
      });
      const r = await connectToRoom(token);
      setRoom(r);
      await r.localParticipant.setMicrophoneEnabled(true);
      await r.localParticipant.setCameraEnabled(true);
      const remotes = Array.from(r.remoteParticipants.values());
      setParticipants([r.localParticipant, ...remotes]);
    } catch (e: any) {
      console.error('LiveKit join error', e);
      setError(e?.message || 'Failed to join');
    } finally {
      setIsConnecting(false);
    }
  };

  const leave = async () => {
    const r = room;
    if (!r) return;
    try {
      await r.disconnect();
    } catch {}
    setRoom(null);
    setParticipants([]);
  };

  const setMicEnabled = async (enabled: boolean) => {
    const r = room;
    if (!r) return;
    await r.localParticipant.setMicrophoneEnabled(enabled);
  };

  const setCamEnabled = async (enabled: boolean) => {
    const r = room;
    if (!r) return;
    await r.localParticipant.setCameraEnabled(enabled);
  };

  return useMemo(() => ({
    room,
    isConnecting,
    error,
    participants,
    layoutRatio,
    recentJoins,
    join,
    leave,
    setMicEnabled,
    setCamEnabled,
  }), [room, isConnecting, error, participants, layoutRatio, recentJoins]);
});