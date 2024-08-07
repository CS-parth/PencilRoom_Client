import { create } from "zustand";
import { persist } from "zustand/middleware";

import { Tools, Action } from "../types";

type ToolsState = {
    tool: Tools;
    action: Action;
};

type Actions = {
    setTool: (tool: Tools) => void;
    setAction: (action: Action) => void;
    resetTools: () => void;
};

const initialState = {
    tool: Tools.Selection,
    action: Action.Selecting,
};

export const useToolsStore = create<ToolsState & Actions>()(
    persist(
        (set) => ({
            ...initialState,
            setTool: (tool: Tools) => set(()=>({tool: tool})),
            setAction: (action: Action) => set(() => ({action: action})),
            resetTools: () => set(()=>({tool:Tools.Selection,action:Action.Selecting})),
        }),
        {
            name: "pencilRoom_tools",
        }
    )
);

// export const useToolsState = () => {
//     const { tool, action, setTool, setAction, resetTools } = useToolsStore();
//     return [tool, action, setTool, setAction, resetTools] as const;
// };