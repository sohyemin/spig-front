import { useEffect, useRef, useState } from "react";

const WebSocketTest = () => {
    const socketRef = useRef<WebSocket | null>(null);

    const [connected, setConnected] = useState<boolean>(false);
    const [message, setMessage] = useState<string>("");
    const [logs, setLogs] = useState<string[]>([]);

    const addLog = (log: string) => {
        setLogs(prev => [...prev, log]);
    };

    const connect = () => {
        if (socketRef.current) return;

        const socket = new WebSocket("ws://localhost:8080/ws/signaling");

        socket.onopen = () => {
            addLog("🟢 연결 성공");
            setConnected(true);
        };

        socket.onmessage = (event: MessageEvent) => {
            addLog(`📨 수신 : ${event.data}`);
        };

        socket.onclose = () => {
            addLog("🔴 연결 종료");
            setConnected(false);
            socketRef.current = null;
        };

        socket.onerror = () => {
            addLog("❌ WebSocket 에러");
        };

        socketRef.current = socket;
    };

    const disconnect = () => {
        socketRef.current?.close();
    };

    const send = () => {
        if (!socketRef.current || !connected) return;

        socketRef.current.send(message);
        addLog(`📤 송신 : ${message}`);

        setMessage("");
    };

    useEffect(() => {
        return () => {
            socketRef.current?.close();
        };
    }, []);

    return (
        <div style={{ padding: "30px" }}>
            <h2>WebSocket Test</h2>

            <button onClick={connect} disabled={connected}>
                연결
            </button>

            <button
                onClick={disconnect}
                disabled={!connected}
                style={{ marginLeft: "10px" }}
            >
                종료
            </button>

            <hr />

            <input
                type="text"
                value={message}
                placeholder="메시지를 입력하세요."
                onChange={(e) => setMessage(e.target.value)}
                style={{ width: "300px" }}
            />

            <button
                onClick={send}
                disabled={!connected}
                style={{ marginLeft: "10px" }}
            >
                보내기
            </button>

            <hr />

            <h3>로그</h3>

            <div
                style={{
                    border: "1px solid #ccc",
                    height: "300px",
                    overflowY: "auto",
                    padding: "10px",
                    borderRadius: "5px",
                }}
            >
                {logs.map((log, index) => (
                    <div key={index}>{log}</div>
                ))}
            </div>
        </div>
    );
};

export default WebSocketTest;