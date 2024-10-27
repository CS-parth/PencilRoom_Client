import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { Room, RoomStatus } from "../interfaces/room";
import { User } from '../interfaces/user';
import { socket } from "../utils/socket";
import { ElementType } from "../interfaces/whiteboard";

interface ClassState {
    loading: string | null;
    error: Error | null;
    room: Room | null;
    user: User | null;
    // typed: string;
    // userProgress: Progress | null;
    updateUser: (socketId: string) => void;
    createRoom: (user: User,elements: ElementType[]) => void;
    joinRoom: (roomId: string, user: User) => ElementType[];
    exitRoom: () => void;
    updateRoom: (room: Room) => void;
    updateElements: (action: ElementType[] | ((prev: ElementType[]) => ElementType[]),roomId: string, overwrite?: boolean) => void
    // gameStatusUpdate: (roomId: string, status: string) => void;
    // userProgressUpdate: (
    //   roomId: string,
    //   socketId: string,
    //   progress: Progress
    // ) => void;
    startClass: () => void;
    // setTyped: (typed: string) => void;
    // setMode: (mode: GameModes) => void;
    // setDuration: (duration: GameDuration) => void;
    // setDificulty: (difficulty: GameDifficulties) => void;
    resetRoom: () => void;
    // resetProgress: () => void;
}

const initialRoom: Room = {
    status: RoomStatus.RUNNING
}
const initialUser: User = {
    uid: "",
    socketId: "",
    displayName: "",
    photoURL: ""
}
const useClassStore = create<ClassState>()(
    devtools((set,get) => (
        {
            loading: null,
            error: null,
            room: initialRoom,
            user: initialUser,
            updateUser: async (socketId) => {
                set({
                    user: {...get().user!,socketId}
                });
            },
            updateElements: async (action,roomId, overwrite=false) => {
                socket.emit('updateElements',action,roomId,overwrite);
            },
            createRoom: async (user,elements) => {
                socket.emit('createRoom',user,""!,elements, (res) => {
                    if(res.success == true){
                        set({
                            room: res.data
                        });
                        console.log("after listing to the socket", get().room)
                    }
                });
            },
            joinRoom: (roomId, user) => {
                return new Promise<ElementType[]>((resolve, reject) => {
                    set({ loading: 'Joining the room! Please Wait....' });
            
                    socket.emit('joinRoom', roomId, user, (res) => {
                        set({ loading: null });
            
                        if (res.success === false) {
                            set({ error: res.error });
                            reject(res.error);
                        } else {
                            console.log(res.data);
                            resolve(res.data); 
                        }
                    });
                });
            },
            exitRoom: () => {
                socket.emit('exitRoom', get().room?.roomId!, (res) => {
                    if (res.success === false) {
                      set({ error: res.error, loading: null });
                    }
                });
            }, 
            updateRoom: async (room) => {
                set({room});
            },
            startClass: () => {
                socket.emit('startClass',get().room?.roomId!,""!,(res) => {
                    if(res.success === false) {
                        set({loading: null,error: res.error});
                    }
                })
            },
            resetRoom: () => {
                set({room : initialRoom});
            }
        }
    ))
);


export default useClassStore;