export type Role = "CALLER" | "CALLEE";

export interface MatchCriteria {
  interest?: string; // TODO: 실제 매칭 조건 필드는 백엔드 스펙 확정 후 확장
}

export type SignalingMessage =
  | {
      type: "JOIN";
      roomId: string;
      criteria?: MatchCriteria;
    }
  | {
      type: "JOIN_SUCCESS";
      roomId: string;
      role: Role;
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
