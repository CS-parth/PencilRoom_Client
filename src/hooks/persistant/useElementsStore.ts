import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ElementStore {
    elements: ;
    setElements: ()=>void;
}