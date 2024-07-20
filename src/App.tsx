import { useEffect, useLayoutEffect, useState } from 'react'
import rough from 'roughjs'

// All the types for the
type ElementType = {
  x1: number,
  y1: number,
  x2: number,
  y2: number
  roughElement: any
}
function App() {
  // const [selectedTool,setSelectedTool] = useState("line");
  const [elements,setElements] = useState<ElementType[]>([]);
  const [drawing,setDrawing] = useState(false);
  const [elementType, setElementType] = useState<"line" | "rectangle" | "circle">("line");
  const generator = rough.generator();
  const createElement = (
    x1: number,
    y1: number,
    x2: number,
    y2: number
  ): ElementType => {
    const roughElement =
      elementType === "line"
        ? generator.line(x1, y1, x2, y2)
        : generator.rectangle(x1, y1, x2 - x1, y2 - y1);
    return { x1, y1, x2, y2, roughElement };
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
    setDrawing(true);
    let { clientX,clientY } = event;
    const canvas = document.getElementById('canvas') as HTMLCanvasElement;
    var boundingRect = canvas.getBoundingClientRect();
    clientX = clientX-boundingRect.left;
    clientY = clientY-boundingRect.top;
    const newElement = createElement(clientX,clientY,clientX,clientY);
    setElements((prevState)=>([
      ...prevState,
      newElement
    ]));
  } 

  const handleMouseMove = (event:React.MouseEvent<HTMLCanvasElement>) => {
    if(!drawing) return;
    let { clientX,clientY } = event;
    const canvas = document.getElementById('canvas') as HTMLCanvasElement;
    var boundingRect = canvas.getBoundingClientRect();
    clientX = clientX-boundingRect.left;
    clientY = clientY-boundingRect.top;
    // get the last x.y
    const idx = elements.length-1;
    const {x1,y1} = elements[idx];
    const newElement = createElement(x1,y1,clientX,clientY);
    const elementsCopy = [...elements];
    elementsCopy[idx] = newElement;
    setElements(elementsCopy);
  }
  const handeMouseUp = (event:React.MouseEvent<HTMLCanvasElement>) => {
    setDrawing(false);
  }

  const handleClearButton = () => {
    setElements([]);
  }
  return (
    <div style={{ position: "fixed" }}>
      <label htmlFor="line">Line</label>
      <input type="radio" name='line' id='line' checked={elementType=="line"} onChange={()=>setElementType("line")}/>
      <label htmlFor="reactangle">Reactangle</label>
      <input type="radio" name='reactangle' id='reactangle' checked={elementType=="rectangle"} onChange={()=>setElementType("rectangle")}/>
      <button type='button' onClick={handleClearButton}>Clear</button>
      <button type='button' onClick={handleClearButton}>Undo</button>
      <button type='button' onClick={handleClearButton}>Redo</button>
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

export default App
