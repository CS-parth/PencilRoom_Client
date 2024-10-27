import { io, Socket } from 'socket.io-client';
import {
  ClientToServerEvents,
  ServerToClientEvents,
} from '../interfaces/socket';

// "undefined" means the URL will be computed from the `window.location` object
const URL =
  process.env.NODE_ENV === 'production'
    ? "https://pencilroom-server.onrender.com"
    : 'http://localhost:6600';

export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(URL);