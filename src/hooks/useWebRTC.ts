import { useState, useRef, useEffect } from "react"

export const useWebRTC = () => {
    // RTCConnection을 담을 객체 생성
    const peerConnectionRef = useRef<RTCPeerConnection | null>(null);

    // Media Stream State
    const [localMediaStream, setlocalMediaStream] = useState<MediaStream | null>(null);
    const [remoteMediaStream, setremoteMediaStram] = useState<MediaStream | null>(null);

    // ICE Candidate State
    const [iceCandidate, setIceCandidate] = useState<RTCIceCandidate | null>(null);

    useEffect(function init() {
        const peerConnection = new RTCPeerConnection({
            iceServers: [{ urls : "stun:stun.l.google.com:19302",}]
        });

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
        };

        peerConnectionRef.current = peerConnection;

        return () => {
            peerConnection.close();
        };
    }, [])

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

    return{
            localMediaStream,
        remoteMediaStream,

        setUpLocalStream,

        createOffer,
        setRemoteOffer,

        createAnswer,
        setRemoteAnswer,

        iceCandidate,
        addIceCandidate
    };
}