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
  offsetX: number,
  offsetY: number,
  type: Tools,
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
  Selecting = "selecting"
}

function App() {
  // const [selectedTool,setSelectedTool] = useState("line");
  const [elements,setElements] = useState<ElementType[]>([]);
  const [action,setAction] = useState<Action>(Action.Selecting);
  const [elementType, setElementType] = useState<"line" | "rectangle" | "circle">("line");
  const [tool,setTool] = useState<Tools>(Tools.Line);
  const [selectedElement,setSelectedElement] = useState<ElementType>();
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

  const distance = (a, b) => Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));

  const isWithinElement = (x: number, y: number, element: ElementType) => {
    const { type, x1, y1, x2, y2 } = element;

    if (type === Tools.Rectangle) {
      const minX = Math.min(x1, x2);
      const maxX = Math.max(x1, x2);
      const minY = Math.min(y1, y2);
      const maxY = Math.max(y1, y2);
      return x >= minX && x <= maxX && y >= minY && y <= maxY;
    } else {
      const a = { x: x1, y: y1 };
      const b = { x: x2, y: y2 };
      const c = { x, y };
      const offset = distance(a, b) - (distance(a, c) + distance(b, c));
      return Math.abs(offset) < 1;
    }

  };

  const getElementAtPosition = (x, y, elements) => {
    return elements.find((element) => isWithinElement(x, y, element));
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
      setAction(Action.Drawing);
      const id = elements.length;
      const newElement = createElement(id,clientX,clientY,clientX,clientY,tool);
      setElements((prevState)=>([
        ...prevState,
        newElement
      ]));
    }else if(tool == Tools.Selection){
      setAction(Action.Selecting);
      const element = getElementAtPosition(clientX, clientY, elements);
      if (element) {
        const offsetX = clientX - element.x1;
        const offsetY = clientY - element.y1;
        setSelectedElement({ ...element, offsetX, offsetY });
        setAction(Action.Moving);
      }
  } 
  }

  const handleMouseMove = (event:React.MouseEvent<HTMLCanvasElement>) => {
    let { clientX,clientY } = extractClient(event);
    if(tool == Tools.Selection){
      (event.target as HTMLInputElement).style.cursor = getElementAtPosition(
                                                        clientX,
                                                        clientY,
                                                        elements
                                                      )
                                                        ? "move"
                                                        : "default";
    }
    if(action == Action.Drawing){
      // get the last x.y
      const idx = elements.length-1;
      const {x1,y1} = elements[idx];
      const newElement = createElement(idx,x1,y1,clientX,clientY,tool);
      const elementsCopy = [...elements];
      elementsCopy[idx] = newElement;
      setElements(elementsCopy);
    }else if(action == Action.Moving && selectedElement){
      const { id, x1, x2, y1, y2, type, offsetX, offsetY } = selectedElement;
      const newX1 = clientX - offsetX;
      const newY1 = clientY - offsetY;
      const newX2 = newX1 + (x2 - x1);
      const newY2 = newY1 + (y2 - y1);

      updateElement(id, newX1, newY1, newX2, newY2, type);
    }
  }
  const handeMouseUp = () => {
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