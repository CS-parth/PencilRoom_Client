import { useEffect, useRef } from 'react';
import WhiteBoard from './Whiteboard';
import {socket} from '../../utils/socket'
import useClassStore from '../../store/classStore';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useHistoryStore } from '../../hooks/useHistoryStore'

const WhiteboardWrapper = () => {
    const { roomId } = useParams();
    const [user, room, updateRoom, joinRoom, exitRoom,updateUser, loading, error] = useClassStore(
      (state) => [
        state.user,
        state.room,
        state.updateRoom,
        state.joinRoom,
        state.exitRoom,
        state.updateUser,
        state.loading,
        state.error,
      ]
    );
    const {elements,setElements} = useHistoryStore((state) => ({
      elements: state.history[state.index],
      setElements: state.setHistory
    }));

    const [params] = useSearchParams();
    const navigate = useNavigate();
    const hasJoinedRoom = useRef(false);
    const socketId = "";

    //Socket Events
    useEffect(() => {
      socket.on('updateUser',(socketId) => {
        updateUser(socketId);
        socketId = socketId;
        // store in localStorage if not alreay stored 
        const storedId = localStorage.getItem('socketId');
        if(!storedId){
          localStorage.setItem('socketId',socketId);
        }
      })

      socket.on('updateRoom', (room) => {
        updateRoom(room);
        if (!room?.users || room?.users?.length === 0) {
          navigate('/');
        }
      });

      socket.on('roomError', (error) => {
        console.log(error);
        navigate('/');
      });

      socket.on('updateElements',(action,overwite) => {
        if(action !== null){
          setElements(action,overwite);
        }else{
          console.error("We got null elements");
        }
      })

      return () => {
        // exitRoom();
        socket.off('updateRoom');
        socket.off('roomError');
        socket.off('updateElements');
      };
    }, []);
    
    //Handles Room Id
    useEffect(() => {
      (async () => {
        console.log("RoomId ", roomId);
        if (roomId && !hasJoinedRoom.current && user.socketId) {
            console.log("roomId from params", roomId);
            
            try {
                const elements = await joinRoom(roomId, user);
                localStorage.removeItem('pencilRoom_history');
                setElements(elements);
                hasJoinedRoom.current = true;
            } catch (error) {
                console.error("Error joining room: ", error);
            }
        }
      })();
    }, [params,joinRoom,hasJoinedRoom,user]);
    
    return (
        <div>
            <WhiteBoard roomId={roomId} socketId={socketId}/>
        </div>
    )
}

export default WhiteboardWrapper