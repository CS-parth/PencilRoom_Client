import React from 'react'
import { useEffect, useLayoutEffect, useState } from 'react'
import rough from 'roughjs'

// All the types for the
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
  roughElement: any
}

enum Tools {
  Selection = "selection",
  Line = "line",
  Rectangle = "rectangle",
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
  const [elements,setElements] = useState<ElementType[]>([]);
  const [action,setAction] = useState<Action>(Action.Selecting);
  const [elementType, setElementType] = useState<"line" | "rectangle" | "circle">("line");
  const [tool,setTool] = useState<Tools>(Tools.Line);
  const [selectedElement,setSelectedElement] = useState<ElementType|null>();
  const generator = rough.generator();
  const createElement = (
    id: number,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    type: Tools
  ): ElementType => {
    const roughElement =
      type === Tools.Line
        ? generator.line(x1, y1, x2, y2)
        : generator.rectangle(x1, y1, x2 - x1, y2 - y1);
    return { id, x1, y1, x2, y2, type ,roughElement };
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

    if (type === Tools.Rectangle) {
      const topLeft = nearPoint(x,y,x1,y1,"topLeft");
      const topRight = nearPoint(x,y,x1,y2,"topRight");
      const bottomLeft = nearPoint(x,y,x2,y1,"bottomLeft");
      const bottomRight = nearPoint(x,y,x2,y2,"bottomRight");
      const inside = x >= x1 && x <= x2 && y >= y1 && y <= y2 ? "inside" : null;
      return topLeft || topRight || bottomLeft || bottomRight || inside;
    } else {
      const a = { x: x1, y: y1 };
      const b = { x: x2, y: y2 };
      const c = { x, y };
      const offset = distance(a, b) - (distance(a, c) + distance(b, c));
      const start = nearPoint(x,y,x1,y1,"start");
      const end = nearPoint(x,y,x2,y2,"end");
      const inside = Math.abs(offset) < 1 ? "inside" : null;
      return start || end || inside;
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
    const updateElement = createElement(id, x1, y1, x2, y2, type);

    const elementsCopy = [...elements];
    elementsCopy[id] = updateElement;
    setElements(elementsCopy);
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

  useLayoutEffect(()=>{
    const canvas = document.getElementById('canvas') as HTMLCanvasElement;
    const context = canvas.getContext("2d") as CanvasRenderingContext2D;
    context.clearRect(0, 0, canvas.width, canvas.height);
    const roughCanvas = rough.canvas(canvas);
    elements.forEach(({ roughElement }) => {
        roughCanvas.draw(roughElement);
    });
  },[elements])
  
  const handleMouseDown = (event:React.MouseEvent<HTMLCanvasElement>) =>{
    // start drawing 
    let { clientX,clientY } = extractClient(event);
    if(tool != Tools.Selection){
      const id = elements.length;
      const newElement = createElement(id,clientX,clientY,clientX,clientY,tool);
      setElements((prevState)=>([
        ...prevState,
        newElement
      ]));
      setSelectedElement(newElement);
      setAction(Action.Drawing);
    }else if(tool == Tools.Selection){
      const element = getElementAtPosition(clientX, clientY, elements);
      if (element) {
        const offsetX = clientX - element.x1;
        const offsetY = clientY - element.y1;
        setSelectedElement({ ...element, offsetX, offsetY });
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
      const idx = elements.length-1;
      const {x1,y1} = elements[idx];
      updateElement(idx, x1, y1, clientX, clientY, tool);
    }else if((action == Action.Moving) && selectedElement){
      const { id, x1, x2, y1, y2, type, offsetX, offsetY } = selectedElement;
      const safeOffsetX = offsetX ?? 0;
      const safeOffsetY = offsetY ?? 0;
      const newX1 = clientX - safeOffsetX;
      const newY1 = clientY - safeOffsetY;
      const newX2 = newX1 + (x2 - x1);
      const newY2 = newY1 + (y2 - y1);
      updateElement(id, newX1, newY1, newX2, newY2, type);
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
    if (action === Action.Drawing || action === Action.Resizing) {
      if (selectedElement) {
        const index = selectedElement.id;
        const { id, type } = elements[index];
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
      <label htmlFor="line">Line</label>
      <input type="radio" name='line' id='line' checked={tool==Tools.Line} onChange={()=>setTool(Tools.Line)}/>
      
      <label htmlFor="reactangle">Reactangle</label>
      <input type="radio" name='reactangle' id='reactangle' checked={tool==Tools.Rectangle} onChange={()=>setTool(Tools.Rectangle)}/>
      
      <label htmlFor="selection">Selection</label>
      <input type="radio" name='selection' id='selection' checked={tool==Tools.Selection} onChange={()=>setTool(Tools.Selection)}/>            
      
      <button type='button' onClick={handleClearButton}>Clear</button>
     
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