import { nearPoint,distance } from "./math";
import { Tools,ElementType } from "../types";

export const positionWithElement = (x: number, y: number, element: ElementType) => {
    const { type, x1, y1, x2, y2 } = element;
    switch (type) {
      case Tools.Rectangle:
        const topLeft = nearPoint(x,y,x1,y1,"topLeft");
        const topRight = nearPoint(x,y,x1,y2,"topRight");
        const bottomLeft = nearPoint(x,y,x2,y1,"bottomLeft");
        const bottomRight = nearPoint(x,y,x2,y2,"bottomRight");
        const inside = x >= x1 && x <= x2 && y >= y1 && y <= y2 ? "inside" : null;
        return topLeft || topRight || bottomLeft || bottomRight || inside;
      // break;
      case Tools.Line:
        const a = { x: x1, y: y1 };
        const b = { x: x2, y: y2 };
        const c = { x, y };
        const offset = distance(a, b) - (distance(a, c) + distance(b, c));
        const start = nearPoint(x,y,x1,y1,"start");
        const end = nearPoint(x,y,x2,y2,"end");
        const on = Math.abs(offset) < 1 ? "inside" : null;
        return start || end || on;
      // break;
      case Tools.Pencil: 
        const betweenAnyPoint = element.points?.some((point,index)=>{
              const nextPoint = element.points?.[index+1];
              if(!nextPoint) return false;
              return (
                  (Math.abs(distance({x:point.x,y:point.y}, {x:nextPoint.x,y:nextPoint.y}) - (distance({x:point.x,y:point.y}, {x,y}) + distance({x:nextPoint.x,y:nextPoint.y}, {x,y}))) < 5)
              );
        });
        return betweenAnyPoint ? "inside" : null;
        // break;
      case Tools.Text:
        return x >= x1 && x <= x2 && y >= y1 && y <= y2 ? "inside" : null;
      default:
        throw new Error(`Invalid type provided ${type}`);
        // break;
    }
  };

  export const getElementAtPosition = (x:number, y:number, elements:ElementType[]) => {
    return elements
                  .map((element) => ({
                    ...element,
                    position: positionWithElement(x,y,element)
                  }))
                  .find((element)=>element.position!==null);
  };

  export const extractPosition = (position: string) => {
    switch (position) {
      case "topLeft":
      case "bottomRight":
        return "nwse-resize";
      case "topRight":
      case "bottomLeft":
        return "nesw-resize";
      case "start":
      case "end":
        return "move";
      case "inside":
        return "move";
      default:
        return "default";
    }
  };