import { useEffect, useRef } from "react";
import type { SignalingMessage } from "../types/signaling";
import { useWebRTC } from "../hooks/useWebRTC";

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
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);

  // 준비 전에 READY가 도착했는지 저장
  const readyReceivedRef = useRef(false);

  // 준비 전에 OFFER가 도착한 경우 저장
  const pendingOfferRef =
    useRef<RTCSessionDescriptionInit | null>(null);

  const mediaReadyRef = useRef(false);

  const {
    localMediaStream,
    remoteMediaStream,
  
    setUpLocalStream,
  
    createOffer,
    setRemoteOffer,
  
    createAnswer,
    setRemoteAnswer,
  
    iceCandidate,
    addIceCandidate
  } = useWebRTC();

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

    // 2. 로컬 MediaStream을 video 요소에 연결
    useEffect(() => {
      if(!localVideoRef.current){
        return;
      }

      localVideoRef.current.srcObject = localMediaStream;
    }, [localMediaStream]);

    // 3. 원격 mediaStream을 video 요소에 연결
    useEffect(() => {
      if(!remoteVideoRef.current){
        return;
      }

      remoteVideoRef.current.srcObject = remoteMediaStream;
    }, [remoteMediaStream]);

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
              console.log("상대방이 퇴장했습니다.")
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

  return (
    <section>
      <h1>화상 채팅방: {roomId}</h1>
      <p>역할: {role}</p>

      <video
        ref={localVideoRef}
        autoPlay
        muted
        playsInline
      />

      <video
        ref={remoteVideoRef}
        autoPlay
        playsInline
      />

      <button type="button" onClick={onLeave}>
        나가기
      </button>
    </section>
  );
}