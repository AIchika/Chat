const express = require('express');
const router = express.Router();
const { AccessToken, RoomServiceClient, IngressClient, IngressInput } = require('livekit-server-sdk');
const dotenv = require('dotenv');

dotenv.config();

const LIVEKIT_API_KEY = process.env.LIVEKIT_API_KEY || '';
const LIVEKIT_API_SECRET = process.env.LIVEKIT_API_SECRET || '';
const LIVEKIT_URL = process.env.LIVEKIT_URL || '';

// Basic validation helper
function ensureLiveKitEnv(res) {
  if (!LIVEKIT_API_KEY || !LIVEKIT_API_SECRET || !LIVEKIT_URL) {
    res.status(500).json({ error: 'LiveKit environment not configured: set LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET' });
    return false;
  }
  return true;
}

// Issue a JWT for joining a LiveKit room
router.post('/token', async (req, res) => {
  try {
    if (!ensureLiveKitEnv(res)) return;

    const { roomName, identity, name, canPublish = true, canSubscribe = true } = req.body || {};
    if (!roomName || !identity) {
      return res.status(400).json({ error: 'roomName and identity are required' });
    }

    const at = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, { identity, name });
    at.addGrant({
      room: roomName,
      roomJoin: true,
      canPublish: !!canPublish,
      canSubscribe: !!canSubscribe,
    });

    const token = await at.toJwt();
    res.json({ token });
  } catch (err) {
    console.error('Error issuing LiveKit token', err);
    res.status(500).json({ error: 'Failed to issue token' });
  }
});

// Create RTMP ingress for OBS/RTMP publishing
router.post('/ingress', async (req, res) => {
  try {
    if (!ensureLiveKitEnv(res)) return;

    const { roomName, name = 'rtmp-ingress' } = req.body || {};
    if (!roomName) {
      return res.status(400).json({ error: 'roomName is required' });
    }

    const ingressClient = new IngressClient(LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET);

    const response = await ingressClient.createIngress({
      name,
      roomName,
      inputType: IngressInput.RTMP_INPUT,
    });

    res.json({ ingress: response });
  } catch (err) {
    console.error('Error creating LiveKit ingress', err);
    res.status(500).json({ error: 'Failed to create ingress' });
  }
});

// Optional: list room participants (useful for admin)
router.get('/rooms/:roomName/participants', async (req, res) => {
  try {
    if (!ensureLiveKitEnv(res)) return;

    const { roomName } = req.params;
    const roomService = new RoomServiceClient(LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET);
    const participants = await roomService.listParticipants(roomName);
    res.json({ participants });
  } catch (err) {
    console.error('Error listing participants', err);
    res.status(500).json({ error: 'Failed to list participants' });
  }
});

module.exports = router;