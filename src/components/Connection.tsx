import { useState } from "react";
import type { SubmitEventHandler } from "react";

interface ConnectionProps {
  onJoin: (roomId:string) => void;
}

export default function Connection({
  onJoin
}: ConnectionProps) {
  const [roomId, setRoomId] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit: SubmitEventHandler<HTMLFormElement>  = (event) => {
    event.preventDefault();

    const trimmedRoomId = roomId.trim();

    if (!trimmedRoomId) {
      setErrorMessage("방 ID를 입력해주세요.")
      return;
    }


    console.log("onJoin 실행")
    onJoin(roomId);
  };

  return (
    <section>
      <h1>화상 채팅 입장</h1>

      <form onSubmit={handleSubmit}>
        <label htmlFor="roomId">방 ID</label>

        <input
          id="roomId"
          value={roomId}
          onChange={(event) => {
            setRoomId(event.target.value);
            setErrorMessage("");
          }}
          placeholder="방 ID를 입력하세요"
        />

        <button type="submit">입장</button>
      </form>

      {errorMessage && <p>{errorMessage}</p>}
    </section>
  );
}