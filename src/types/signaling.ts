export type Role = "CALLER" | "CALLEE";

export type SignalingMessage =
  | {
      type: "JOIN";
      roomId: string;
    }
  | {
      type: "JOIN_SUCCESS";
      roomId: string;
      data: {
        role: Role;
      };
    }
  | {
      type: "READY";
      roomId: string;
    }
  | {
      type: "OFFER";
      roomId: string;
      data: RTCSessionDescriptionInit;
    }
  | {
      type: "ANSWER";
      roomId: string;
      data: RTCSessionDescriptionInit;
    }
  | {
      type: "ICE_CANDIDATE";
      roomId: string;
      data: RTCIceCandidateInit;
    }
  | {
      type: "LEAVE";
      roomId: string;
    };
