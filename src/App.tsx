// import WhiteBoard from './components/whiteboard/Whiteboard';
import { useEffect } from 'react';
import {
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
  Route
} from "react-router-dom";
// import WhiteBoard from './components/whiteboard/Whiteboard';
import WhiteboardWrapper from './components/whiteboard/WhiteboardWrapper';
const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="/">
        <Route index element={<WhiteboardWrapper />} />
        <Route path=':roomId' element={<WhiteboardWrapper />} />
      </Route>
    </>
  )
);
// All the types for the
function App() {
  useEffect(()=>{
    console.log("App started running");
  })
  return (  
    <RouterProvider router={router} />
  )

}
export default App;