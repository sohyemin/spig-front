import { useEffect, useRef, useState } from "react";
import type { SignalingMessage } from "../types/signaling";
import { useWebRTC } from "../hooks/useWebRTC";
import LoadingScreen from "./common/LoadingScreen";
import ErrorScreen from "./common/ErrorScreen";
import ChatPanel from "./ChatPanel";

interface ChatRoomProps {
  socket: WebSocket;
  roomId: string;
  role: "CALLER" | "CALLEE";
  onLeave: () => void;
}


export default function ChatRoom({
  socket,
  roomId,
  role,
  onLeave,
}: ChatRoomProps) {
  const mainVideoRef = useRef<HTMLVideoElement | null>(null);
  const pipVideoRef = useRef<HTMLVideoElement | null>(null);

  // "remote"면 상대방 화면이 크게(메인), "local"이면 내 화면이 크게(메인)
  const [mainStreamKey, setMainStreamKey] = useState<"remote" | "local">("remote");

  // 준비 전에 READY가 도착했는지 저장
  const readyReceivedRef = useRef(false);

  // 준비 전에 OFFER가 도착한 경우 저장
  const pendingOfferRef =
    useRef<RTCSessionDescriptionInit | null>(null);

  const mediaReadyRef = useRef(false);

  const [mediaError, setMediaError] = useState<string | null>(null);

  // 상대방 이탈 감지 + 자동 퇴장
  const [peerLeft, setPeerLeft] = useState(false);
  const [secondsUntilLeave, setSecondsUntilLeave] = useState(60);

  const {
    localMediaStream,
    remoteMediaStream,

    setUpLocalStream,

    createOffer,
    setRemoteOffer,

    createAnswer,
    setRemoteAnswer,

    iceCandidate,
    addIceCandidate,

    iceConnectionState,
    isChatChannelOpen,
    chatMessages,
    sendChatMessage,
  } = useWebRTC(role);

  const sendMessage = (message: SignalingMessage) => {
    if (socket.readyState !== WebSocket.OPEN) {
      console.warn("WebSocket이 열려 있지 않습니다.");
      return;
    }

    socket.send(JSON.stringify(message));
  };

  const sendOffer = async () => {
    if (!mediaReadyRef.current) {
      console.log("미디어 준비 전이므로 OFFER 생성을 보류합니다.");
      readyReceivedRef.current = true;
      return;
    }

    const offer = await createOffer();

    sendMessage({
      type: "OFFER",
      roomId,
      data: offer,
    });

    console.log("OFFER 전송 완료");
  };

  const handleOffer = async(
    offer: RTCSessionDescriptionInit,
  ) => {
    if(!mediaReadyRef.current){
      console.log("미디어 준비 전이므로 OFFER을 저장합니다.")
      pendingOfferRef.current = offer;
      return;
    }

    await setRemoteOffer(offer);

    const answer = await createAnswer();

    sendMessage({
      type:"ANSWER",
      roomId,
      data : answer
    })

    console.log("ANSWER 전송 완료");
  }

  const handleAnswer = async(
    answer: RTCSessionDescriptionInit,
  ) => {
    await setRemoteAnswer(answer);
    console.log("ANSWER 적용 완료")
  }

  const handleLeaveClick = () => {
    sendMessage({ type: "LEAVE", roomId });
    onLeave();
  };

  // 1. 로컬 카메라와 마이크 준비

  useEffect(() => {
    let disposed = false;

    const InitializeMedia = async () => {
      try {
        await setUpLocalStream();

        if(disposed){
          return;
        }

        mediaReadyRef.current = true;

        // 미디어 준비 전에 OFFER가 도착한 경우
        if(pendingOfferRef.current){
          const offer = pendingOfferRef.current;
          pendingOfferRef.current = null;

          await handleOffer(offer);
          return;
        }

        // 미디어 준비 전에 READY가 도착한 경우
        if (
          role === "CALLER" &&
          readyReceivedRef.current
        ) {
          readyReceivedRef.current = false
          await sendOffer();
        }
      } catch (error) {
        console.error("로컬 미디어 초기화 실패 : ", error);
        setMediaError("카메라/마이크에 접근할 수 없어요. 권한을 확인해주세요.");
      }
    };

      void InitializeMedia();

      return() => {
        disposed = true;
        mediaReadyRef.current = false;
        readyReceivedRef.current = false;
        pendingOfferRef.current = null;
      };
    }, [role]);

    // 2. 메인 슬롯 video 요소에 스트림 바인딩 (mainStreamKey에 따라 로컬/원격 결정)
    useEffect(() => {
      if(!mainVideoRef.current){
        return;
      }

      mainVideoRef.current.srcObject =
        mainStreamKey === "remote" ? remoteMediaStream : localMediaStream;
    }, [mainStreamKey, remoteMediaStream, localMediaStream]);

    // 3. PIP 슬롯 video 요소에 스트림 바인딩 (메인의 반대)
    useEffect(() => {
      if(!pipVideoRef.current){
        return;
      }

      pipVideoRef.current.srcObject =
        mainStreamKey === "remote" ? localMediaStream : remoteMediaStream;
    }, [mainStreamKey, remoteMediaStream, localMediaStream]);

    // 4. Hook에서 ICE 후보가 생성되어 상대방에게 전달
    useEffect(() => {
      if(!iceCandidate){
        return;
      }

      sendMessage({
        type:"ICE_CANDIDATE",
        roomId,
        data:iceCandidate
      });
    }, [iceCandidate, roomId, socket]);

    // 5. WebSocket 시그널링 메시지 처리
    useEffect(() => {
      const handleSocketMessage = async(
        event:MessageEvent<string>,
      ) => {
        try{
          const message = JSON.parse(event.data) as SignalingMessage;

          switch(message.type){
            case "READY":
              if(role!=="CALLER"){
                break;
              }

              if(!mediaReadyRef.current){
                readyReceivedRef.current = true;
                break;
              }

              await sendOffer();
              break;
            case "OFFER":
              await handleOffer(
                message.data as RTCSessionDescription
              );
              break;
            case "ANSWER":
              await handleAnswer(
                message.data as RTCSessionDescription
              )
              break;
            case "ICE_CANDIDATE":
              await addIceCandidate(
                message.data as RTCIceCandidate
              )
              break;
            case "LEAVE":
              setPeerLeft(true);
              break;
          }
        } catch(error){
          console.error(error);
        };
      }

      socket.addEventListener(
        "message",
        handleSocketMessage
      );

      return () => {
        socket.removeEventListener(
          "message",
          handleSocketMessage
        );
      };
    }, [socket, roomId, role]);

    // 6. ICE 연결 상태로 상대방 이탈을 감지 (비정상 종료 대비 fallback)
    useEffect(() => {
      if (
        iceConnectionState === "disconnected" ||
        iceConnectionState === "failed" ||
        iceConnectionState === "closed"
      ) {
        setPeerLeft(true);
      }
    }, [iceConnectionState]);

    // 7. 상대방 이탈 시 1분 카운트다운 후 자동 퇴장
    useEffect(() => {
      if (!peerLeft) {
        return;
      }

      setSecondsUntilLeave(60);

      const intervalId = window.setInterval(() => {
        setSecondsUntilLeave((prev) => Math.max(prev - 1, 0));
      }, 1000);

      const timeoutId = window.setTimeout(onLeave, 60_000);

      return () => {
        window.clearInterval(intervalId);
        window.clearTimeout(timeoutId);
      };
    }, [peerLeft, onLeave]);

  if (mediaError) {
    return (
      <ErrorScreen
        title="카메라/마이크에 연결할 수 없어요"
        message={mediaError}
        onRetry={onLeave}
        retryLabel="나가기"
      />
    );
  }

  if (!localMediaStream) {
    return (
      <LoadingScreen
        title="카메라와 마이크를 준비하고 있어요"
        description="브라우저에서 권한 요청이 뜨면 허용해주세요."
      />
    );
  }

  return (
    <section className="flex h-screen flex-col gap-4 bg-brand-pink-light/40 p-4">
      <header className="text-center">
        <h1 className="text-xl font-bold text-gray-900">화상 채팅방: {roomId}</h1>
      </header>

      <div className="flex min-h-0 flex-1 flex-col gap-4 lg:flex-row">
        <div className="group relative min-h-0 flex-1 overflow-hidden rounded-2xl border border-brand-pink-light bg-black shadow-lg">
          <video
            ref={mainVideoRef}
            autoPlay
            playsInline
            muted={mainStreamKey === "local"}
            className="h-full w-full object-cover"
          />

          <video
            ref={pipVideoRef}
            autoPlay
            playsInline
            muted={mainStreamKey === "remote"}
            onClick={() =>
              setMainStreamKey((key) => (key === "remote" ? "local" : "remote"))
            }
            className="absolute bottom-4 left-4 h-32 w-48 cursor-pointer rounded-xl border-2 border-white object-cover shadow-xl transition hover:scale-105"
          />

          <button
            type="button"
            onClick={handleLeaveClick}
            className="absolute bottom-4 right-4 rounded-full bg-brand-pink px-5 py-2 text-sm font-semibold text-white opacity-0 shadow-lg transition-opacity duration-200 hover:bg-brand-pink-dark focus-visible:opacity-100 group-hover:opacity-100"
          >
            연결 종료
          </button>

          {!remoteMediaStream && (
            <p className="absolute inset-x-0 top-4 text-center text-sm font-medium text-white">
              상대방을 기다리는 중이에요...
            </p>
          )}

          {peerLeft && (
            <div className="absolute inset-x-0 top-0 flex items-center justify-between gap-3 bg-red-600/90 px-4 py-2 text-sm text-white">
              <span>
                상대방이 채팅방을 나갔어요. {secondsUntilLeave}초 후 자동으로 나가집니다.
              </span>
              <button
                type="button"
                onClick={onLeave}
                className="shrink-0 rounded-full bg-white/20 px-3 py-1 font-semibold transition hover:bg-white/30"
              >
                지금 나가기
              </button>
            </div>
          )}
        </div>

        <ChatPanel
          className="flex w-full flex-col lg:w-96"
          chatMessages={chatMessages}
          onSendChatMessage={sendChatMessage}
          isChatChannelOpen={isChatChannelOpen}
        />
      </div>
    </section>
  );
}
