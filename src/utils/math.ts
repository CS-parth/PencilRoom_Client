import { Tools,ElementType } from "../types";

export const average = (a: number, b: number): number => (a + b) / 2;


export const distance = (a: { x: number; y: number }, b: { x: number; y: number }): number => Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));


export const adjustElementCoordinates = (element: ElementType) => {
    const { type, x1, y1, x2, y2 } = element;

    if (type === Tools.Rectangle) {
      const minX = Math.min(x1, x2);
      const maxX = Math.max(x1, x2);
      const minY = Math.min(y1, y2);
      const maxY = Math.max(y1, y2);
      return { x1: minX, y1: minY, x2: maxX, y2: maxY };
    } else {
      if (x1 < x2 || (x1 === x2 && y1 < y2)) {
        return { x1, y1, x2, y2 };
      } else {
        return { x1: x2, y1: y2, x2: x1, y2: y1 };
      }
    }
};

export const nearPoint = (
    x: number,
    y:number,
    x1:number,
    y1:number,
    name:string
)=>{
    return Math.abs(x-x1) < 5 && Math.abs(y-y1) < 5 ? name : null;
};