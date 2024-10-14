import { ElementType } from "../interfaces/whiteboard";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type HistoryState = {
  index: number;
  history: ElementType[][];
}

type Actions = {
  setIndex: (idx: number) => void
  setHistory: (action: ElementType[] | ((prev: ElementType[]) => ElementType[]), overwrite?: boolean) => void
  undo: () => void
  redo: () => void
  resetHistory: () => void
}

const initialState: HistoryState = {
  index: 0,
  history: [[]], // limit of 15 histories only 
}

export const useHistoryStore = create<HistoryState & Actions>()(
  persist(
    (set) => ({
      ...initialState,
      setIndex: (idx) => set({ index: idx }),
      setHistory: (action, overwrite = false) => set((state) => {
        let currentHistory = state.history;
        let currentIndex = state.index;
        const newState = typeof action === "function" ? action(currentHistory[currentIndex]) : action;
        if (overwrite) {
          const historyCopy = [...currentHistory];
          historyCopy[currentIndex] = newState;
          return { history: historyCopy };
        } else {
          let updatedState = [...currentHistory].slice(0, currentIndex + 1);
          if(updatedState.length == 15){
            updatedState = updatedState.slice(1)
            currentIndex--;
          }
          return { 
            history: [...updatedState, newState],
            index: currentIndex + 1
          };
        }
      }),
      undo: () => set((state) => 
        state.index > 0 ? { index: state.index - 1 } : state
      ),
      redo: () => set((state) => 
        state.index < state.history.length - 1 ? { index: state.index + 1 } : state
      ),
      resetHistory: () => set(() => (initialState))
    }),
    {
      name: 'pencilRoom_history'
    }
  )
);