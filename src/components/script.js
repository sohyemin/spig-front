import { WebSocket } from "k6/websockets";
import { sleep } from 'k6';

export const options = {
    vus: 1000, //가상 사용자 수
    duration: '30s', //총 테스트 시간
};

const SIGNALING_URL = "ws://localhost:8080/ws/signaling";

export default function () {
    const socket = new WebSocket(SIGNALING_URL);
    socketRef.current = socket;


    socket.onopen = () => {
      const joinMessage = {
        type : "JOIN",
        roomId : Math.random().toString(4000).substring(2, 10),
      };
    }
}