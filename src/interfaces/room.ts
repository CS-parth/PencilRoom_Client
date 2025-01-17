// import { GameDifficulties, GameDuration, GameModes } from './game';
import { User } from './user';
import { ElementType } from './whiteboard';

// export interface GameSettings {
//   mode: GameModes;
//   difficulty: GameDifficulties;
//   duration: GameDuration;
// }

export enum RoomStatus {
  WAITING,
  RUNNING,
  FINISHED,
}

// export interface Progress {
//   wpm: number;
//   accuracy: number;
//   correctWordsArray: string[];
//   incorrectWordsArray: string[];
// }

export interface Room {
  roomId?: string;
  owner?: User;
  users?: User[];
//   usersProgress?: {
//     key: string;
//     value: Progress;
//   }[];
//   gameSettings: GameSettings;
  status?: RoomStatus;
  elements: ElementType[];
  createdAt?: Date;
  timer?: number;
}