// import WhiteBoard from './components/whiteboard/Whiteboard';
import { useEffect } from 'react';
import {
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
  Route
} from "react-router-dom";
import '@mantine/core/styles.css';
// import WhiteBoard from './components/whiteboard/Whiteboard';
import WhiteboardWrapper from './components/whiteboard/WhiteboardWrapper';
import Landing from './components/landing/Landing';
const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="/">
        <Route index element={<Landing />} />
        <Route path='/board' element={<WhiteboardWrapper />} />
        <Route path='/board/:roomId' element={<WhiteboardWrapper />} />
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