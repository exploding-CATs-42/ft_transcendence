import { useEffect, useState, type SubmitEventHandler } from "react";
import { io } from "socket.io-client";

import s from "./ChatPage.module.css";

const socket = io(import.meta.env["VITE_WS_BASE_URL"]);

const ChatPage = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<string[]>([]);

  useEffect(() => {
    // Listen for messages from server
    socket.on("receive_message", (data: string) => {
      setMessages((prev) => [...prev, data]);
    });

    // Cleanup once the component is unmounted
    return () => {
      socket.off("receive_message");
    };
  }, []);

  const sendMessage: SubmitEventHandler = (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    socket.emit("send_message", message);
    setMessage("");
  };

  return (
    <>
      <h1 className={s.title}>Socket.IO Demo</h1>
      <ul className={s.messages}>
        {messages.map((message, i) => (
          <li key={i}>{message}</li>
        ))}
      </ul>
      <form className={s.form} onSubmit={sendMessage}>
        <input
          className={s.input}
          autoComplete="off"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button>Send</button>
      </form>
    </>
  );
};

export default ChatPage;
