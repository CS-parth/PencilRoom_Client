import React from 'react'
import { useEffect, useLayoutEffect, useState } from 'react'
import rough from 'roughjs'
import { useHistory } from './hooks/useHistoryState'
import { getSvgPathFromStroke } from './utils'
import getStroke from 'perfect-freehand'
// All the types for the

type SelectedElementType = ElementType & {
  xOffsets?: number[];
  yOffsets?: number[]; // For pencil
  offsetX?: number; // For Others 
  offsetY?: number;
};

type ElementType = {
  id: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  offsetX?: number, // conditional property
  offsetY?: number,
  type: Tools,
  position?: string | null,
  points?: {x:number,y:number}[];
  roughElement: any
}
interface ExtendedElementType extends ElementType {
  xOffsets?: number[];
  yOffsets?: number[];
}

enum Tools {
  Selection = "selection",
  Line = "line",
  Rectangle = "rectangle",
  Pencil = "pencil"
}

enum Action {
  None = "none",
  Drawing = "drawing",
  Moving = "moving",
  Selecting = "selecting",
  Resizing = "resizing"
}

function App() {
  // const [selectedTool,setSelectedTool] = useState("line");
  const [elements,setElements,undo,redo] = useHistory([]);
  const [action,setAction] = useState<Action>(Action.Selecting);
  const [tool,setTool] = useState<Tools>(Tools.Line);
  const [selectedElement,setSelectedElement] = useState<SelectedElementType|null>();
  const generator = rough.generator();
  const createElement = (
    id: number,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    type: Tools
  ): ElementType => {
    switch (type) {
      case Tools.Line:
      case Tools.Rectangle: {
        const roughElement =
          type === Tools.Line
            ? generator.line(x1, y1, x2, y2)
            : generator.rectangle(x1, y1, x2 - x1, y2 - y1);
        return { id, x1, y1, x2, y2, type, roughElement };
      }
      case Tools.Pencil: {
        const defaultRoughElement = null;
        return {
          id,
          x1: 0,
          y1: 0,
          x2: 0,
          y2: 0,
          type,
          points: [{ x: x1, y: y1 }],
          roughElement: defaultRoughElement,
        };
      }
      default:
        throw new Error(`Type not recognised: ${type}`);
    }
  };

  const extractClient = (event:React.MouseEvent<HTMLCanvasElement>)=>{
      let {clientX,clientY} = event;
      const canvas = document.getElementById('canvas') as HTMLCanvasElement;
      var boundingRect = canvas.getBoundingClientRect();
      clientX = clientX-boundingRect.left;
      clientY = clientY-boundingRect.top;
      return {clientX,clientY};
  }

  const extractPosition = (position: string) => {
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

  const distance = (a, b) => Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));

  const resizedCoordinates = (
    clientX:number,
    clientY:number,
    position:string,
    coordinates:{x1:number,y1:number,x2:number,y2:number}
  )=>{
    const { x1, y1, x2, y2 } = coordinates;

    switch (position) {
      case "start":
      case "topLeft":
        return {
          x1: clientX,
          y1: clientY,
          x2,
          y2,
        };
      case "topRight":
        return {
          x1,
          y1: clientY,
          x2: clientX,
          y2,
        };
      case "bottomLeft":
        return {
          x1: clientX,
          y1,
          x2,
          y2: clientY,
        };
      case "end":
      case "bottomRight":
        return {
          x1,
          y1,
          x2: clientX,
          y2: clientY,
        };
      default:
        return coordinates;
    }
  }

  const nearPoint = (
    x: number,
    y:number,
    x1:number,
    y1:number,
    name:string
  ) => {
    return Math.abs(x-x1) < 5 && Math.abs(y-y1) < 5 ? name : null;
  };

  const positionWithElement = (x: number, y: number, element: ElementType) => {
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
      default:
        throw new Error(`Invalid type provided ${type}`);
        // break;
    }
  };

  const getElementAtPosition = (x:number, y:number, elements:ElementType[]) => {
    return elements
                  .map((element) => ({
                    ...element,
                    position: positionWithElement(x,y,element)
                  }))
                  .find((element)=>element.position!==null);
  };

  const updateElement = (
    id: number,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    type: Tools
  ) => {
    switch (type) {
      case Tools.Line:
      case Tools.Rectangle: {
        const updatedElement = createElement(id, x1, y1, x2, y2, type);
        const elementsCopy = [...elements];
        elementsCopy[id] = updatedElement;
        setElements(elementsCopy, true);
        break;
      }
      case Tools.Pencil: {
        const existingPoints = elements[id].points || [];
        const elementsCopy = [...elements];
        elementsCopy[id].points = [...existingPoints,{x:x2,y:y2}];
        // console.log(elements[id].points);
        setElements(elementsCopy, true);
        break;
      }
    }
  };

  const adjustElementCoordinates = (element: ElementType) => {
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
  const average = (a, b) => (a + b) / 2

  const getSvgPathFromStroke = (points, closed = true) => {
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
  const drawElement = (roughCanvas:any,context:CanvasRenderingContext2D,element:ElementType) => {
    switch (element.type) {
      case Tools.Line:
      case Tools.Rectangle:
        roughCanvas.draw(element.roughElement); // drawing a drawable
        break;
      case Tools.Pencil:
        if(element.points == undefined) return;
        const outlinePoints = getStroke(element.points.slice(0,element.points.length-1))
        const pathData = getSvgPathFromStroke(outlinePoints);
        const myPath = new Path2D(pathData);
        context.fill(myPath);
        break;
      default:
        throw new Error(`Type not recognised: ${element.type}`);
    }
  }
  useLayoutEffect(() => {
    const canvas = document.getElementById("canvas") as HTMLCanvasElement;
    const context = canvas.getContext("2d") as CanvasRenderingContext2D;
    context.clearRect(0, 0, canvas.width, canvas.height);

    const roughCanvas = rough.canvas(canvas);

    elements.forEach((element) => drawElement(roughCanvas, context, element));
  }, [elements]);

  useEffect(() => {
    const undoRedoFunction = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "z") {
        if (event.shiftKey) {
          redo();
        } else {
          undo();
        }
      }
    };

    document.addEventListener("keydown", undoRedoFunction);
    return () => {
      document.removeEventListener("keydown", undoRedoFunction);
    };
  }, [undo, redo]);

  const handleMouseDown = (event:React.MouseEvent<HTMLCanvasElement>) =>{
    // start drawing 
    let { clientX,clientY } = extractClient(event);
    if(tool != Tools.Selection){
      const id = elements.length;
      const newElement = createElement(id,clientX,clientY,clientX,clientY,tool);
      // if(tool == Tools.Pencil){
      //   newElement.points = [{x:clientX,y:clientY}];
      // }
      setElements((prevState)=>([
        ...prevState,
        newElement
      ])); // overwrite is tured off while creating the initial point for the next shape
      setSelectedElement(newElement); 
      setAction(Action.Drawing);
    }else if(tool == Tools.Selection){
      const element = getElementAtPosition(clientX, clientY, elements);
      if (element) {
        console.log("elemt : ",element);
        let selectedElement: SelectedElementType = { ...element };
        if((element.type == Tools.Pencil) && element.points){
          console.log("IN");
          const xOffsets = element.points?.map((point) => clientX - point.x);
          const yOffsets = element.points?.map((point) => clientY - point.y);
          console.log(xOffsets);
          console.log(yOffsets);
          selectedElement = { ...selectedElement, xOffsets, yOffsets }; // while Moving we will use this to crete newElement (bug in the last point)
          setSelectedElement(selectedElement);
        }else{
          console.log("OUT");
          const offsetX = clientX - element.x1;
          const offsetY = clientY - element.y1;
          setSelectedElement({ ...selectedElement, offsetX, offsetY });
        }
        setElements((prevState) => prevState); // No OverWrite means creating a copy of the current history before moving the elemnt so as to get the undo/Redo functionalites working on the Moving part and the resizing part as well
        if(element.position == "inside"){
          setAction(Action.Moving);
        }else{
          setAction(Action.Resizing);
        }
      }
  } 
  }

  const handleMouseMove = (event:React.MouseEvent<HTMLCanvasElement>) => {
    let { clientX,clientY } = extractClient(event);
    if(tool == Tools.Selection){
      const element = getElementAtPosition(clientX,clientY,elements);
      // console.log(element)
      if(element && element.position){
        (event.target as HTMLInputElement).style.cursor = extractPosition(element.position);
      }else{
        (event.target as HTMLInputElement).style.cursor = "default";
      }
    }
    if(action == Action.Drawing){
      // get the last x.y
      // console.log("MoveCalled");
      const idx = elements.length-1;
      const {x1,y1} = elements[idx];
      updateElement(idx, x1, y1, clientX, clientY, tool);
    }else if((action == Action.Moving) && selectedElement){
      if(selectedElement.type == Tools.Pencil && "points" in selectedElement && "xOffsets" in selectedElement && "yOffsets" in selectedElement){
        const newPoints = selectedElement.points?.map((point,index)=>({
          x:clientX - selectedElement.xOffsets![index],
          y:clientY - selectedElement.yOffsets![index]
        }));
        const elementCopy = [...elements]; // copy current history
        elementCopy[selectedElement.id] = {
          ...elementCopy[selectedElement.id],
          points: newPoints
        }
        setElements(elementCopy,true); // As we are moving we do not want to create a history for this so overwite = true
      }else{
        const { id, x1, x2, y1, y2, type, offsetX, offsetY } = selectedElement;
        const safeOffsetX = offsetX ?? 0;
        const safeOffsetY = offsetY ?? 0;
        const newX1 = clientX - safeOffsetX;
        const newY1 = clientY - safeOffsetY;
        const newX2 = newX1 + (x2 - x1);
        const newY2 = newY1 + (y2 - y1);
        updateElement(id, newX1, newY1, newX2, newY2, type);
      }
    }else if((action == Action.Resizing) && selectedElement && selectedElement.position){
      const { id, type, position, ...coordinates } = selectedElement;
      const { x1, y1, x2, y2 } = resizedCoordinates(
        clientX,
        clientY,
        position,
        coordinates
      );
      updateElement(id, x1, y1, x2, y2, type);
    }
  }

  const handeMouseUp = () => {
    if (selectedElement) {
        console.log(selectedElement);
        const index = selectedElement.id;
        const { id, type } = elements[index];
        if (action === Action.Drawing || action === Action.Resizing && selectedElement.type!=Tools.Pencil)
         {
          const { x1, y1, x2, y2 } = adjustElementCoordinates(elements[index]);
          updateElement(id, x1, y1, x2, y2, type);
        }
    }
    setSelectedElement(null);
    setAction(Action.None);
  }

  const handleClearButton = () => {
    setElements([]);
  }

  return (
    <div style={{ position: "fixed" }}>
      
      <label htmlFor="pencil">Pencil</label>
      <input type="radio" name='pencil' id='pencil' checked={tool==Tools.Pencil} onChange={()=>setTool(Tools.Pencil)}/>

      <label htmlFor="line">Line</label>
      <input type="radio" name='line' id='line' checked={tool==Tools.Line} onChange={()=>setTool(Tools.Line)}/>
      
      <label htmlFor="reactangle">Reactangle</label>
      <input type="radio" name='reactangle' id='reactangle' checked={tool==Tools.Rectangle} onChange={()=>setTool(Tools.Rectangle)}/>
      
      <label htmlFor="selection">Selection</label>
      <input type="radio" name='selection' id='selection' checked={tool==Tools.Selection} onChange={()=>setTool(Tools.Selection)}/>            
      
      <button type='button' onClick={handleClearButton}>Clear</button>

      <div style={{ position: "fixed", zIndex: 2, bottom: 0, padding: 10 }}>
        <button onClick={undo}>Undo</button>
        <button onClick={redo}>Redo</button>
      </div>
      
      <canvas 
          className="fixed"
          id='canvas'  
          width={window.innerWidth}
          height={window.innerHeight}
          onMouseDown={handleMouseDown}
          onMouseUp={handeMouseUp}
          onMouseMove={handleMouseMove}
      >
      </canvas>
    </div>
  )

}
export default App;