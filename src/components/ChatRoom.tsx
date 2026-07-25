import { useEffect, useRef } from "react";
import type { SignalingMessage } from "../types/signaling";

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
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);

  const localStreamRef = useRef<MediaStream | null>(null);

  const localVideoRef = useRef<HTMLVideoElement | null>(null);

  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);

  // PeerConnection과 미디어가 준비됐는지 확인
  const peerReadyRef = useRef(false);

  // 준비 전에 READY가 도착했는지 저장
  const readyReceivedRef = useRef(false);

  // 준비 전에 OFFER가 도착한 경우 저장
  const pendingOfferRef =
    useRef<RTCSessionDescriptionInit | null>(null);

  // remoteDescription 전에 도착한 ICE 저장
  const pendingIceCandidatesRef =
    useRef<RTCIceCandidateInit[]>([]);

  useEffect(() => {
    let disposed = false;

    const sendMessage = (message: SignalingMessage) => {
      if (socket.readyState !== WebSocket.OPEN) {
        console.warn("WebSocket이 열려 있지 않습니다.");
        return; 
      }

      socket.send(JSON.stringify(message));
    };

    const flushPendingIceCandidates = async (
      peerConnection: RTCPeerConnection,
    ) => {
      const candidates =
        pendingIceCandidatesRef.current;

      pendingIceCandidatesRef.current = [];

      for (const candidate of candidates) {
        await peerConnection.addIceCandidate(candidate);
      }
    };

    const createOffer = async () => {
      const peerConnection = peerConnectionRef.current;

      if (!peerConnection || !peerReadyRef.current) {
        console.log("PeerConnection 준비 전이므로 OFFER 보류");
        readyReceivedRef.current = true;
        return;
      }

      console.log(
        "OFFER 생성 전 Sender:",
        peerConnection.getSenders().map((sender) => ({
          kind: sender.track?.kind,
          readyState: sender.track?.readyState,
        })),
      );

      const offer = await peerConnection.createOffer();

      await peerConnection.setLocalDescription(offer);

      if (!peerConnection.localDescription) {
        throw new Error("LocalDescription 생성 실패");
      }

      sendMessage({
        type: "OFFER",
        roomId,
        data: peerConnection.localDescription,
      });

      console.log("OFFER 전송 완료");
    };

    const handleOffer = async (
      offer: RTCSessionDescriptionInit,
    ) => {
      const peerConnection = peerConnectionRef.current;

      if (!peerConnection || !peerReadyRef.current) {
        console.log("PeerConnection 준비 전이므로 OFFER 저장");
        pendingOfferRef.current = offer;
        return;
      }

      await peerConnection.setRemoteDescription(offer);

      await flushPendingIceCandidates(peerConnection);

      const answer = await peerConnection.createAnswer();

      await peerConnection.setLocalDescription(answer);

      if (!peerConnection.localDescription) {
        throw new Error("ANSWER LocalDescription 생성 실패");
      }

      sendMessage({
        type: "ANSWER",
        roomId,
        data: peerConnection.localDescription,
      });

      console.log("ANSWER 전송 완료");
    };

    const handleAnswer = async (
      answer: RTCSessionDescriptionInit,
    ) => {
      const peerConnection = peerConnectionRef.current;

      if (!peerConnection) {
        console.warn("ANSWER 처리 시 PeerConnection이 없습니다.");
        return;
      }

      await peerConnection.setRemoteDescription(answer);

      await flushPendingIceCandidates(peerConnection);

      console.log("ANSWER 적용 완료");
    };

    const handleIceCandidate = async (
      candidate: RTCIceCandidateInit,
    ) => {
      const peerConnection = peerConnectionRef.current;

      if (!peerConnection) {
        pendingIceCandidatesRef.current.push(candidate);
        return;
      }

      // RemoteDescription 전에 addIceCandidate를 호출하면
      // 오류가 발생할 수 있으므로 임시 저장
      if (!peerConnection.remoteDescription) {
        console.log("RemoteDescription 전 ICE 후보 저장");
        pendingIceCandidatesRef.current.push(candidate);
        return;
      }

      await peerConnection.addIceCandidate(candidate);

      console.log("ICE Candidate 적용 완료");
    };

    const handleSocketMessage = async (
      event: MessageEvent<string>,
    ) => {
      try {
        const message =
          JSON.parse(event.data) as SignalingMessage;

        switch (message.type) {
          case "READY":
            if (role === "CALLER") {
              readyReceivedRef.current = true;

              if (peerReadyRef.current) {
                await createOffer();
              }
            }
            break;

          case "OFFER":
            await handleOffer(message.data);
            break;

          case "ANSWER":
            await handleAnswer(message.data);
            break;

          case "ICE_CANDIDATE":
            await handleIceCandidate(message.data);
            break;

          case "LEAVE":
            console.log("상대방이 퇴장했습니다.");
            break;

          default:
            break;
        }
      } catch (error) {
        console.error(
          "시그널링 메시지 처리 실패:",
          error,
        );
      }
    };

    socket.addEventListener(
      "message",
      handleSocketMessage,
    );

    const initializePeerConnection = async () => {
      try {
        const peerConnection =
          new RTCPeerConnection({
            iceServers: [
              {
                urls: "stun:stun.l.google.com:19302",
              },
            ],
          });

        peerConnectionRef.current = peerConnection;

        peerConnection.ontrack = (event) => {
          console.log(
            "ontrack 실행:",
            event.track.kind,
            event.streams,
          );

          const remoteStream = event.streams[0];

          if (
            remoteVideoRef.current &&
            remoteStream
          ) {
            remoteVideoRef.current.srcObject =
              remoteStream;

            void remoteVideoRef.current
              .play()
              .catch((error) => {
                console.warn(
                  "원격 영상 자동 재생 실패:",
                  error,
                );
              });
          }
        };

        peerConnection.onicecandidate = (event) => {
          if (!event.candidate) {
            console.log("ICE 후보 수집 완료");
            return;
          }

          sendMessage({
            type: "ICE_CANDIDATE",
            roomId,
            data: event.candidate.toJSON(),
          });
        };

        peerConnection.onconnectionstatechange = () => {
          console.log(
            "connectionState:",
            peerConnection.connectionState,
          );
        };

        peerConnection.oniceconnectionstatechange =
          () => {
            console.log(
              "iceConnectionState:",
              peerConnection.iceConnectionState,
            );
          };

        const localStream =
          await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
          });

        if (disposed) {
          localStream
            .getTracks()
            .forEach((track) => track.stop());

          peerConnection.close();
          return;
        }

        localStreamRef.current = localStream;

        if (localVideoRef.current) {
          localVideoRef.current.srcObject =
            localStream;
        }

        localStream.getTracks().forEach((track) => {
          peerConnection.addTrack(
            track,
            localStream,
          );
        });

        peerReadyRef.current = true;

        console.log(
          "등록된 Sender:",
          peerConnection.getSenders().map(
            (sender) => ({
              kind: sender.track?.kind,
              readyState:
                sender.track?.readyState,
            }),
          ),
        );

        // 초기화 전에 OFFER가 도착한 경우 처리
        if (pendingOfferRef.current) {
          const pendingOffer =
            pendingOfferRef.current;

          pendingOfferRef.current = null;

          await handleOffer(pendingOffer);
        }

        // 초기화 전에 READY가 도착한 경우 처리
        if (
          role === "CALLER" &&
          readyReceivedRef.current
        ) {
          await createOffer();
        }
      } catch (error) {
        console.error(
          "PeerConnection 초기화 실패:",
          error,
        );
      }
    };

    void initializePeerConnection();

    return () => {
      disposed = true;

      socket.removeEventListener(
        "message",
        handleSocketMessage,
      );

      peerReadyRef.current = false;
      readyReceivedRef.current = false;
      pendingOfferRef.current = null;
      pendingIceCandidatesRef.current = [];

      localStreamRef.current
        ?.getTracks()
        .forEach((track) => track.stop());

      localStreamRef.current = null;

      peerConnectionRef.current?.close();
      peerConnectionRef.current = null;
    };
  }, [roomId, role, socket]);

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