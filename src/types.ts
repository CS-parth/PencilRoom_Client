  export type SelectedElementType = ElementType & {
    xOffsets?: number[];
    yOffsets?: number[]; // For pencil
    offsetX?: number; // For Others 
    offsetY?: number;
  };
  
  export type ElementType = {
    id: number,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    type: Tools,
    text?: string ,
    offsetX?: number, // conditional property
    offsetY?: number,
    position?: string | null,
    points?: {x:number,y:number}[];
    roughElement?: any
  }
  export interface ExtendedElementType extends ElementType {
    xOffsets?: number[];
    yOffsets?: number[];
  }
  
  export enum Tools {
    Selection = "selection",
    Line = "line",
    Rectangle = "rectangle",
    Pencil = "pencil",
    Text = "text"
  }
  
  export enum Action {
    None = "none",
    Drawing = "drawing",
    Moving = "moving",
    Selecting = "selecting",
    Resizing = "resizing",
    Writing = "writing",
    Panning = "panning"
  }

