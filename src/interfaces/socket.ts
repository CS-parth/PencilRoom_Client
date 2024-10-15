import { ElementType } from 'react';
import { RoomStatus, Room } from './room.ts';
import { User } from './user';

export interface ServerToClientEvents {
  updateUser: (socketId: string) => void;
  roomCreated: (room: Room) => void;
  roomError: (error: string) => void;
  updateRoom: (room: Room) => void;
  updateElements: (action:ElementType[] | ((prev: ElementType[]) => ElementType[]),overwrite?:boolean) => void;
  basicEmit: (a: number, b: string, c: Buffer) => void;
  withAck: (d: string, callback: (e: number) => void) => void;
}

interface Response<T> {
  success: boolean;
  data?: T;
  error?: Error;
}

export interface ClientToServerEvents {

  createRoom: (
    user: User,
    settings: ClassSettings,
    callback: (res: Response<Room>) => void
  ) => void;

  joinRoom: (
    roomId: string,
    user: User,
    callback: (res: Response<Room>) => void
  ) => void;

  startClass: (
    roomId: string,
    paragraph: string,
    callback: (res: Response<Room>) => void
  ) => void;

  gameStatusUpdate: (
    roomId: string,
    status: RoomStatus,
    callback: (res: Response<Room>) => void
  ) => void;

  updateElements: (
    action:ElementType[] | ((prev: ElementType[]) => ElementType[]),
    roomId: string,
    overwrite?:boolean
  ) => void;

  userProgressUpdate: (
    roomId: string,
    socketId: string,
    progress: Progress,
    callback: (res: Response<Room>) => void
  ) => void;

  exitRoom: (roomId: string, callback: (res: Response) => void) => void;
}

