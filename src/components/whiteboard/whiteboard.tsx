import React from 'react'
import { useEffect, useLayoutEffect, useState,useRef } from 'react'
import rough from 'roughjs'
import { useHistoryStore } from '../../hooks/useHistoryStore'
import getStroke from 'perfect-freehand'
import "../../assets/font.css"
import { useToolsStore } from '../../hooks/useToolsStore'
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
  type: Tools,
  text?: string,
  offsetX?: number, // conditional property
  offsetY?: number,
  position?: string | null,
  points?: {x:number,y:number}[];
  roughElement?: any
}

enum Tools {
  Selection = "selection",
  Line = "line",
  Rectangle = "rectangle",
  Pencil = "pencil",
  Text = "text"
}

enum Action {
  None = "none",
  Drawing = "drawing",
  Moving = "moving",
  Selecting = "selecting",
  Resizing = "resizing",
  Writing = "writing",
  Panning = "panning"
}

function WhiteBoard() {
  // const [selectedTool,setSelectedTool] = useState("line");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const {elements,setElements,undo,redo,resetHistory} = useHistoryStore((state) => ({
    elements: state.history[state.index],
    setElements: state.setHistory,
    undo: state.undo,
    redo: state.redo,
    resetHistory: state.resetHistory
  }));
  const {tool, action, setTool, setAction, resetTools} = useToolsStore((state) => ({
    tool: state.tool,
    action: state.action,
    setTool: state.setTool,
    setAction: state.setAction,
    resetTools: state.resetTools
  }));
  const [selectedElement,setSelectedElement] = useState<SelectedElementType|null>();
  const [panOffset,setPanOffSet] = useState({x:50,y:50});
  const [startPanMousePosition,setStartMousePosition] = useState({x:0,y:0});
  const [scale,setScale] = useState(1);
  const [scaleOffset,setScaleOffset] = useState({x:0,y:0});

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
          points: [{x:x1,y:y1}],
          x1: 0,
          y1: 0,
          x2: 0,
          y2: 0,
          type,
          roughElement: defaultRoughElement,
        };
      }
      case Tools.Text:
        return { id, type, x1, y1, x2, y2, text: "" };
      default:
        throw new Error(`Type not recognised: ${type}`);
    }
  };

  const extractClient = (event:React.MouseEvent<HTMLCanvasElement>)=>{
      let {clientX,clientY} = event;
      // const canvas = document.getElementById('canvas') as HTMLCanvasElement;
      // var boundingRect = canvas.getBoundingClientRect();
      clientX = (clientX-panOffset.x * scale + scaleOffset.x)/scale;
      clientY = (clientY-panOffset.y * scale + scaleOffset.y)/scale;
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

  const distance = (a: { x: number; y: number }, b: { x: number; y: number }): number =>
  Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));

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
      case Tools.Text:
        return x >= x1 && x <= x2 && y >= y1 && y <= y2 ? "inside" : null;
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
    type: Tools,
    options?: { text: string }
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
        setElements(elementsCopy, true);
        break;
      }
      case Tools.Text: {
        const canvas = document.getElementById("canvas");
        if (!(canvas instanceof HTMLCanvasElement)) {
          throw new Error("Canvas element not found");
        }
        const context = canvas.getContext("2d");
        if (!context) {
          throw new Error("Could not get 2D context from canvas");
        }
        if (!options) {
          throw new Error("No text options provided for text tool");
        }
        const textWidth = context.measureText(options.text).width;
        const textHeight = 24;
        const elementsCopy = [...elements];
        elementsCopy[id] = {
          ...createElement(id, x1, y1, x1 + textWidth, y1 + textHeight, type),
          text: options.text,
        };
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
  
  const average = (a: number, b: number): number => (a + b) / 2;

  const getSvgPathFromStroke = (points: { x: number; y: number }[], closed: boolean = true): string => {
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

  useLayoutEffect(() => {
    const canvas = document.getElementById("canvas") as HTMLCanvasElement;
    const context = canvas.getContext("2d") as CanvasRenderingContext2D;
    context.clearRect(0, 0, canvas.width, canvas.height);
    const scaledWidth = canvas.width * scale;
    const scaledHeight = canvas.height * scale;

    const scaleOffsetX = (scaledWidth - canvasWidth) / 2;
    const scaleOffsetY = (scaledHeight - canvasHeight) / 2;

    setScaleOffset({x:scaleOffsetX,y:scaleOffsetY});

    context.save();
    context.translate(panOffset.x*scale - scaleOffsetX,panOffset.y*scale - scaleOffsetY);
    context.scale(scale,scale);
    const roughCanvas = rough.canvas(canvas);
    console.log(elements);
    elements.forEach((element) => {
      if(action == "writing" && selectedElement && (selectedElement.id === element.id)) return;
      drawElement(roughCanvas, context, element)
    });
    context.restore();
  }, [elements,action,selectedElement,panOffset,scale]);

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

  useEffect(() => {
    const textArea = textareaRef.current;
    if (action === "writing" && textArea && selectedElement) {
      setTimeout(() => {
        textArea.focus();
        textArea.value = selectedElement.text || "";
      }, 0); // Waiting for the DOM to render textarea after re-render
    }
  }, [action, selectedElement]);

  useEffect(()=>{
    const panFunction = (event: React.MouseEvent<HTMLCanvasElement>): void => {
      setPanOffSet(prevState => ({
        x: prevState.x - event.deltaX,
        y: prevState.y - event.deltaY
      }))
    }
    document.addEventListener("wheel",panFunction);
    return ()=>{
      document.removeEventListener("wheel",panFunction);
    }
  },[])

  const handleMouseDown = (event:React.MouseEvent<HTMLCanvasElement>) =>{
    // start drawing 
    if(action == Action.Writing) return;
    let { clientX,clientY } = extractClient(event);

    if(event.button == 1){ // Wheeler button
      // panning 
      setAction(Action.Panning);
      setStartMousePosition({x:clientX,y:clientY});
      return;
    }
    if(tool != Tools.Selection){
      const id = elements.length;
      const newElement = createElement(id,clientX,clientY,clientX,clientY,tool);
      setElements((prevState)=>([
        ...prevState,
        newElement
      ])); // overwrite is tured off while creating the initial point for the next shape
      setSelectedElement(newElement); 
      if(tool == Tools.Text){
        setAction(Action.Writing);
      }else{
        setAction(Action.Drawing);
      }
    }else if(tool == Tools.Selection){
      const element = getElementAtPosition(clientX, clientY, elements);
      if (element) {
        let selectedElement: SelectedElementType = { ...element };
        if((element.type == Tools.Pencil) && element.points){
          const xOffsets = element.points?.map((point) => clientX - point.x);
          const yOffsets = element.points?.map((point) => clientY - point.y);
          selectedElement = { ...selectedElement, xOffsets, yOffsets }; // while Moving we will use this to crete newElement (bug in the last point)
          setSelectedElement(selectedElement);
        }else{
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
    if(action == Action.Panning){
      const deltaX = clientX + panOffset.x - startPanMousePosition.x;
      const deltaY = clientY + panOffset.y - startPanMousePosition.y;
      setPanOffSet((prevState)=>({
        x: deltaX,
        y: deltaY
      }))
      return;
    }
    if(tool == Tools.Selection){
      const element = getElementAtPosition(clientX,clientY,elements);
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

  const handleMouseUp = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const { clientX, clientY } = extractClient(event);
    if (selectedElement) {
      const index = selectedElement.id;
      const { id, type } = elements[index];
      if (
        (action === Action.Drawing || action === Action.Resizing) &&
        tool != Tools.Pencil
      ) {
        const { x1, y1, x2, y2 } = adjustElementCoordinates(elements[index]);
        updateElement(id, x1, y1, x2, y2, type);
      }
      const offsetX = selectedElement.offsetX || 0;
      const offsetY = selectedElement.offsetY || 0;
      if (
        selectedElement.type === "text" &&
        clientX - offsetX === selectedElement.x1 &&
        clientY - offsetY === selectedElement.y1
      ) {
        setAction(Action.Writing);
        return;
      }
    }
    if (action === "writing") {
      return;
    }
    if (action === Action.Panning) {
      document.body.style.cursor = "default";
    }
    setAction(Action.None);
    setSelectedElement(null);
  };

  const handleBlur = (event: React.FocusEvent<HTMLTextAreaElement>) => {
    if (selectedElement) {
      const { id, x1, y1, type } = selectedElement;
      const x2 = selectedElement.x2 || x1;
      const y2 = selectedElement.y2 || y1;

      setAction(Action.None);
      setSelectedElement(null);
      updateElement(id, x1, y1, x2, y2, type, { text: event.target.value});
    } else {
      console.error("No element selected when handleBlur was called");
    }
  };

  const handleClearButton = () => {
    resetTools();
    resetHistory();
  } 

  const [canvasHeight,setCanvasHeight] = useState(window.innerHeight);
  const [canvasWidth,setCanvasWidth] = useState(window.innerWidth);

  const onZoom = (val:number) => {
    setScale(prevState => Math.min(Math.max(prevState + val,0.1),2));
  }

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      
      <div className="actions" style={{
        position: "fixed",
        top: 0,
        left: 10,
        display: "flex",
        gap: "10px",
        padding: "10px",
        background: "#f5f5f5", 
        borderRadius: '0 0 8px 8px',
        boxShadow: '0 1px 5px rgba(0,0,0,0.1)',
        zIndex: 20 
      }}>
        <button onClick={handleClearButton}>Clear</button>
      </div>

      <div className="toolbar gap-4" style={{ 
        position: "fixed", 
        top: 0, 
        left: '50%', 
        transform: 'translateX(-50%)', 
        padding: "10px", 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        background: "#f5f5f5", 
        borderRadius: '0 0 8px 8px',
        boxShadow: '0 1px 5px rgba(0,0,0,0.1)',
        zIndex: 20 
      }}>
        <button className={`tool-button ${tool === Tools.Selection ? 'active' : ''}`} onClick={() => setTool(Tools.Selection)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z"></path>
          </svg>
        </button>
        <button className={`tool-button ${tool === Tools.Rectangle ? 'active' : ''}`} onClick={() => setTool(Tools.Rectangle)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          </svg>
        </button>
        <button className={`tool-button ${tool === Tools.Line ? 'active' : ''}`} onClick={() => setTool(Tools.Line)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </button>
        <button className={`tool-button ${tool === Tools.Pencil ? 'active' : ''}`} onClick={() => setTool(Tools.Pencil)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
          </svg>
        </button>
        <button className={`tool-button ${tool === Tools.Text ? 'active' : ''}`} onClick={() => setTool(Tools.Text)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="4 7 4 4 20 4 20 7"></polyline>
            <line x1="9" y1="20" x2="15" y2="20"></line>
            <line x1="12" y1="4" x2="12" y2="20"></line>
          </svg>
        </button>
      </div>

  
      <div className="bottom-left-controls gap-8" style={{ 
        position: "fixed", 
        bottom: 10, 
        left: 10, 
        display: "flex", 
        alignItems: "center", 
        background: "#f5f5f5", 
        borderRadius: '8px',
        padding: '5px',
        boxShadow: '0 1px 5px rgba(0,0,0,0.1)',
        zIndex: 20 
      }}>
        <div className='flex gap-4'>
          <button onClick={undo}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="1 4 1 10 7 10"></polyline>
              <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
            </svg>
          </button>
          <button onClick={redo}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="23 4 23 10 17 10"></polyline>
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
            </svg>
          </button>
        </div>
        <div>
          <button onClick={() => onZoom(-0.1)}>-</button>
          <span onClick={() => setScale(1)} style={{ margin: "0 10px", cursor: "pointer" }}>
            {new Intl.NumberFormat("en-GB", { style: "percent" }).format(scale)}
          </span>
          <button onClick={() => onZoom(0.1)}>+</button>
        </div>
      </div>
  
      {action === Action.Writing && (
        <textarea
          ref={textareaRef}
          name="text"
          style={{
            position: "fixed",
            top: selectedElement?.y1 ? `${selectedElement.y1 * scale + panOffset.x * scale - scaleOffset.x}px` : '0',
            left: selectedElement?.x1 ? `${selectedElement.x1 * scale + panOffset.y * scale - scaleOffset.y}px` : '0',
            font: `${24 * scale}px sans-serif`,
            margin: 0,
            padding: 0,
            border: 0,
            outline: "none",
            overflow: "hidden",
            whiteSpace: "pre-wrap",
            background: "transparent",
            zIndex: 30,
          }}
          onBlur={handleBlur}
        />
      )}
      
      <canvas
        id="canvas"
        width={window.innerWidth}
        height={window.innerHeight}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        style={{ position: "absolute", top: 0, left: 0, zIndex: 10 }}
      />
    </div>
  )

}
export default WhiteBoard;