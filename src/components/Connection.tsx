import { useState } from "react";
import type { SubmitEventHandler } from "react";
import type { MatchCriteria } from "../types/signaling";

interface ConnectionProps {
  onJoin: (roomId: string, criteria?: MatchCriteria) => void;
}

export default function Connection({
  onJoin
}: ConnectionProps) {
  const [roomId, setRoomId] = useState("");
  const [interest, setInterest] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit: SubmitEventHandler<HTMLFormElement>  = (event) => {
    event.preventDefault();

    const trimmedRoomId = roomId.trim();

    if (!trimmedRoomId) {
      setErrorMessage("방 ID를 입력해주세요.")
      return;
    }

    const trimmedInterest = interest.trim();

    onJoin(
      trimmedRoomId,
      trimmedInterest ? { interest: trimmedInterest } : undefined
    );
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-pink-light/40 px-6 py-20">
      <div className="w-full max-w-sm rounded-2xl border border-brand-pink-light bg-white p-8 shadow-lg">
        <h1 className="text-center text-2xl font-bold text-gray-900">화상 채팅 입장</h1>
        <p className="mt-2 text-center text-sm text-gray-600">
          참여할 방 ID를 입력해주세요.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label htmlFor="roomId" className="mb-1 block text-sm font-medium text-gray-700">
              방 ID
            </label>
            <input
              id="roomId"
              value={roomId}
              onChange={(event) => {
                setRoomId(event.target.value);
                setErrorMessage("");
              }}
              placeholder="방 ID를 입력하세요"
              className="w-full rounded-full border border-gray-200 px-4 py-2 text-sm outline-none focus:border-brand-pink"
            />
          </div>

          <div>
            <label htmlFor="interest" className="mb-1 block text-sm font-medium text-gray-700">
              관심사 (선택, 추후 매칭 조건으로 활용 예정)
            </label>
            <input
              id="interest"
              value={interest}
              onChange={(event) => setInterest(event.target.value)}
              placeholder="예: 영어, 여행, 음악"
              className="w-full rounded-full border border-gray-200 px-4 py-2 text-sm outline-none focus:border-brand-pink"
            />
          </div>

          {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}

          <button
            type="submit"
            className="w-full rounded-full bg-brand-pink px-5 py-2 text-sm font-semibold text-white transition hover:bg-brand-pink-dark"
          >
            입장
          </button>
        </form>
      </div>
    </div>
  );
}
