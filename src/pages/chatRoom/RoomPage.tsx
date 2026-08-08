import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Connection from "../../components/Connection";
import ChatRoom from "../../components/ChatRoom";
import LoadingScreen from "../../components/common/LoadingScreen";
import ErrorScreen from "../../components/common/ErrorScreen";
import { useAuth } from "../../context/AuthContext";
import type {
  MatchCriteria,
  Role,
  SignalingMessage,
} from "../../types/signaling";

const SIGNALING_URL =
  import.meta.env.VITE_SIGNALING_URL || "ws://localhost:8080/ws/signaling";

type RoomState =
  | { status: "form" }
  | { status: "connecting"; roomId: string }
  | { status: "connected"; roomId: string; role: Role }
  | { status: "error"; roomId: string; message: string };

export default function RoomPage() {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  const socketRef = useRef<WebSocket | null>(null);
  // 사용자가 직접 나가서 닫은 소켓인지, 예기치 않게 끊어진 것인지 구분하기 위한 플래그
  const leavingRef = useRef(false);

  const [state, setState] = useState<RoomState>({ status: "form" });

  const connectToRoom = (roomId: string, criteria?: MatchCriteria) => {
    if (
      socketRef.current?.readyState === WebSocket.OPEN ||
      socketRef.current?.readyState === WebSocket.CONNECTING
    ) {
      return;
    }

    leavingRef.current = false;
    setState({ status: "connecting", roomId });

    const socket = new WebSocket(SIGNALING_URL);
    socketRef.current = socket;

    socket.onopen = () => {
      const joinMessage: SignalingMessage = criteria
        ? { type: "JOIN", roomId, criteria }
        : { type: "JOIN", roomId };

      socket.send(JSON.stringify(joinMessage));
    };

    socket.onmessage = (event: MessageEvent<string>) => {
      const message = JSON.parse(event.data) as SignalingMessage;

      if (message.type === "JOIN_SUCCESS") {
        setState({
          status: "connected",
          roomId: message.roomId,
          role: message.role,
        });
      }
    };

    socket.onerror = () => {
      setState({
        status: "error",
        roomId,
        message: "채팅 서버에 연결할 수 없어요. 잠시 후 다시 시도해주세요.",
      });
    };

    socket.onclose = () => {
      if (leavingRef.current) {
        return;
      }

      setState((prev) =>
        prev.status === "connecting" || prev.status === "connected"
          ? {
              status: "error",
              roomId,
              message: "채팅 서버와의 연결이 끊어졌어요.",
            }
          : prev,
      );
    };
  };

  const handleLeave = () => {
    leavingRef.current = true;
    socketRef.current?.close();
    socketRef.current = null;
    setState({ status: "form" });
  };

  useEffect(() => {
    return () => {
      leavingRef.current = true;
      socketRef.current?.close();
    };
  }, []);

  if (!isLoggedIn) {
    return (
      <ErrorScreen
        title="로그인이 필요해요"
        message="화상채팅은 로그인 후 이용할 수 있어요."
        onRetry={() => navigate("/login")}
        retryLabel="로그인하러 가기"
      />
    );
  }

  switch (state.status) {
    case "form":
      return <Connection onJoin={connectToRoom} />;

    case "connecting":
      return (
        <LoadingScreen
          title="채팅방에 연결하는 중이에요"
          description={`방 ${state.roomId}에 참여하고 있어요.`}
        />
      );

    case "connected": {
      const socket = socketRef.current;

      if (!socket) {
        return (
          <ErrorScreen
            message="연결이 끊어졌어요. 다시 시도해주세요."
            onRetry={() => setState({ status: "form" })}
            retryLabel="처음으로"
          />
        );
      }

      return (
        <ChatRoom
          socket={socket}
          roomId={state.roomId}
          role={state.role}
          onLeave={handleLeave}
        />
      );
    }

    case "error":
      return (
        <ErrorScreen
          message={state.message}
          onRetry={() => connectToRoom(state.roomId)}
        >
          <button
            type="button"
            onClick={() => setState({ status: "form" })}
            className="text-sm text-brand-pink-dark hover:underline"
          >
            다른 방 입력하기
          </button>
        </ErrorScreen>
      );
  }
}
