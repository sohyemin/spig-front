import { useRef, useState } from "react";
import Connection from "../../components/Connection";
import ChatRoom from "../../components/ChatRoom";

const SIGNALING_URL = "ws://localhost:8080/ws/signaling";


export default function RoomPage() {
  // WebSocket
  const socketRef = useRef<WebSocket | null>(null);
  
  // join 정보
  const [joinedRoomId, setJoinRoomId] = useState<string | null>(null);

  // OFFER, ANSWER 제어를 위해 역할 부여
  const [role, setRole] =
  useState<"CALLER" | "CALLEE" | null>(null);

  const handleJoinSuccess = (roomId: string) => {
    
    if (
      socketRef.current?.readyState === WebSocket.OPEN ||
      socketRef.current?.readyState === WebSocket.CONNECTING
    ) {
      return;
    }

    const socket = new WebSocket(SIGNALING_URL);
    socketRef.current = socket;

    socket.onopen = () => {
      const joinMessage = {
        type : "JOIN",
        roomId,
      };  

      socket.send(JSON.stringify(joinMessage));
    };

    socket.onmessage = (event: MessageEvent) => {
        console.log("받은 메시지 : ", event.data);

        const message = JSON.parse(event.data);

        if(message.type="JOIN_SUCCESS"){
          setJoinRoomId(message.roomId ?? roomId);
          if(message.role){
            setRole(message.role);
          }
        }
    };
    

    socket.onerror = () => {
      console.error("연결 실패")
    }
  }

  const handleLeave = () => {
    setJoinRoomId(null);
  };

  
  return (
    <div>
      <div>
        {joinedRoomId === null ? (
          <Connection 
            onJoin={handleJoinSuccess} />
        ) : socketRef.current !== null && role !== null ? (
          <ChatRoom
            socket={socketRef.current}
            roomId={joinedRoomId}
            role={role}
            onLeave={handleLeave}
          />
        ) : (
          <p>채팅방 연결을 준비하고 있습니다.</p>
        )}
      </div>
    </div>
  )
}