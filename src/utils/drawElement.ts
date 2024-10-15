import { Tools,ElementType } from "../interfaces/whiteboard";
import getStroke from 'perfect-freehand'
import { average } from "./math";

export const getSvgPathFromStroke = (points: { x: number; y: number }[], closed: boolean = true): string => {
    const len = points.length

    if (len < 4) {
      return ``
    }

    let a = points[0]
    let b = points[1]
    const c = points[2]

    let result = `M${a[0].toFixed(2)},${a[1].toFixed(2)} Q${b[0].toFixed(
      2
    )},${b[1].toFixed(2)} ${average(b[0], c[0]).toFixed(2)},${average(
      b[1],
      c[1]
    ).toFixed(2)} T`

    for (let i = 2, max = len - 1; i < max; i++) {
      a = points[i]
      b = points[i + 1]
      result += `${average(a[0], b[0]).toFixed(2)},${average(a[1], b[1]).toFixed(
        2
      )} `
    }

    if (closed) {
      result += 'Z'
    }

    return result
}

export const drawElement = (roughCanvas:any,context:CanvasRenderingContext2D,element:ElementType) => {
    switch (element.type) {
        case Tools.Line:
        case Tools.Rectangle:
        roughCanvas.draw(element.roughElement); // drawing a drawable
        break;
        case Tools.Pencil:
        if(element.points == undefined) return;
        const outlinePoints = getStroke(element.points)
        const pathData = getSvgPathFromStroke(outlinePoints);
        const myPath = new Path2D(pathData);
        context.fill(myPath);
        break;
        case Tools.Text:
        context.textBaseline = "top";
        context.font = "24px 'Pacifico', cursive";
        const text = element.text || "";
        context.fillText(text,element.x1,element.y1);
        break;
        default:
        throw new Error(`Type not recognised: ${element.type}`);
    }
}