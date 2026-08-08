import { useState, useRef, useEffect } from "react"
import type { Role } from "../types/signaling"
import type { ChatMessage } from "../types/chat"

export const useWebRTC = (role: Role) => {
    // RTCConnection을 담을 객체 생성
    const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
    const dataChannelRef = useRef<RTCDataChannel | null>(null);

    // Media Stream State
    const [localMediaStream, setlocalMediaStream] = useState<MediaStream | null>(null);
    const [remoteMediaStream, setremoteMediaStram] = useState<MediaStream | null>(null);

    // ICE Candidate State
    const [iceCandidate, setIceCandidate] = useState<RTCIceCandidate | null>(null);

    // ICE 연결 상태 (상대방 이탈 감지용)
    const [iceConnectionState, setIceConnectionState] =
        useState<RTCIceConnectionState>("new");

    // 일반채팅(DataChannel) 상태
    const [isChatChannelOpen, setIsChatChannelOpen] = useState(false);
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

    useEffect(function init() {
        const peerConnection = new RTCPeerConnection({
            iceServers: [{ urls : "stun:stun.l.google.com:19302",}]
        });

        const setupDataChannel = (channel: RTCDataChannel) => {
            dataChannelRef.current = channel;

            channel.onopen = () => setIsChatChannelOpen(true);
            channel.onclose = () => setIsChatChannelOpen(false);
            channel.onmessage = (event: MessageEvent<string>) => {
                setChatMessages((prev) => [
                    ...prev,
                    {
                        id: crypto.randomUUID(),
                        sender: "peer",
                        text: event.data,
                        timestamp: Date.now(),
                    },
                ]);
            };
        };

        // CALLER는 offer 생성 전에 채널을 만들어야 SDP 협상에 자동으로 포함됨
        if (role === "CALLER") {
            setupDataChannel(peerConnection.createDataChannel("chat"));
        } else {
            peerConnection.ondatachannel = (event) => {
                setupDataChannel(event.channel);
            };
        }

        //handle remote media steam when receive from peer
        peerConnection.ontrack = (event) => {
            const remoteStream = event.streams[0];
            setremoteMediaStram(remoteStream);
        };

        peerConnection.onicecandidate = (event) => {
            if (!event.candidate) {
              console.log("ICE 후보 수집 완료");
              return;
            }

            setIceCandidate(event.candidate);
        };

        peerConnection.oniceconnectionstatechange =
        () => {
            console.log(
                "iceConnectionState : ",
                peerConnection.iceConnectionState
            );
            setIceConnectionState(peerConnection.iceConnectionState);
        };

        peerConnectionRef.current = peerConnection;

        return () => {
            dataChannelRef.current = null;
            peerConnection.close();
        };
    }, [role])

    const setUpLocalStream = async () => {
        const constraints = {
            video : true,
            audio : true,
        };

        const localStream =
        await navigator.mediaDevices.getUserMedia(constraints);
        setlocalMediaStream(localStream)

        localStream
            .getTracks()
            .forEach( track => {
                peerConnectionRef.current?.addTrack(track, localStream);
            });
    }

    useEffect(function cleanUp(){
        return() => {
            if(localMediaStream){
                localMediaStream.getTracks().forEach(track => track.stop());
            }
        }
    }, [localMediaStream])

    // SDP offer 생성
    // local Description에 설정
    const createOffer = async (): Promise<RTCSessionDescriptionInit> => {
        const offer = await peerConnectionRef.current!.createOffer();
        await peerConnectionRef.current!.setLocalDescription(offer);

        return offer;
    };

    // Peer Connection에서 입력 받은 SDP offer를 RemoteDescription에 설정
    const setRemoteOffer = async (offer: RTCSessionDescriptionInit) => {
        await peerConnectionRef.current!.setRemoteDescription(offer);
    };


    // SDP answer 생성
    // Local Description에 설정
    const createAnswer = async (): Promise<RTCSessionDescriptionInit> => {
        const answer = await peerConnectionRef.current!.createAnswer();
        await peerConnectionRef.current!.setLocalDescription(answer);

        return answer;
    };

     // Peer Connection에서 입력 받은 SDP answer를 RemoteDescription에 설정
    const setRemoteAnswer = async (answer: RTCSessionDescriptionInit) => {
        await peerConnectionRef.current!.setRemoteDescription(answer);
    };


    // peer Connection에서 입력 받은 ICE Candidate 추가를 다룸
    const addIceCandidate = async (candidate: RTCIceCandidate) => {
        await peerConnectionRef.current?.addIceCandidate(candidate);
    };

    // 상대방에게 일반채팅 메시지 전송 (DataChannel)
    const sendChatMessage = (text: string) => {
        const trimmed = text.trim();
        if (!trimmed) {
            return;
        }

        const channel = dataChannelRef.current;
        if (!channel || channel.readyState !== "open") {
            console.warn("데이터 채널이 아직 열려있지 않습니다.");
            return;
        }

        channel.send(trimmed);
        setChatMessages((prev) => [
            ...prev,
            {
                id: crypto.randomUUID(),
                sender: "me",
                text: trimmed,
                timestamp: Date.now(),
            },
        ]);
    };

    return{
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
    };
}
