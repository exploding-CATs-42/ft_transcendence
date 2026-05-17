import { useEffect, useState } from "react";
import { io } from "socket.io-client";

import { Button, Input, Section } from "components";

import s from "./JoinLeaveGamePage.module.css";
import clsx from "clsx";
import { toast } from "react-toastify";

const TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI4NmQ3MmRiNy1iZTdmLTQ2MzQtYTliOS01M2ZjMjYzODBhZmEiLCJ0eXBlIjoiYWNjZXNzIiwiaWF0IjoxNzc5MDI2NjkxLCJleHAiOjE3NzkwMjc1OTF9.XL1Aql2kaIpXo2NbjfuyuMh9b6DvoJOZ5LO8U6jFj1I";
const socket = io(import.meta.env["VITE_WS_BASE_URL"], {
  auth: {
    token: TOKEN
  }
});

const JoinLeaveGamePage = () => {
  const [gameId, setGameId] = useState("");
  const [gameName, setGameName] = useState("");
  const [gamePlayersAmount, setGamePlayersAmount] = useState(0);

  const createGame = async () => {
    const res = await fetch("/api/lobby/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${TOKEN}`
      },
      body: JSON.stringify({
        gameName: gameName,
        playersAmount: gamePlayersAmount
      })
    });

    if (!res.ok) {
      const error = await res.json();

      toast(error.errors);

      if (error.errors) {
        error.errors.forEach((issue: any) => {
          toast(issue.message);
        });
      }
      return;
    }
    const data = await res.json();
    toast(`Game ${data.name} [${data.gameId}] was successfully created`);
  };

  const handleJoin = () => {
    socket.emit("join-table", {
      gameId: gameId
    });
  };

  const handleLeave = () => {
    socket.emit("leave-table", {
      gameId: gameId
    });
  };

  useEffect(() => {
    // Listen for messages from server
    socket.on("connect_error", (error) => {
      toast(error.message);
    });

    socket.on("join-table-response", (data: string) => {
      toast(data);
    });

    socket.on("join-table-error", (data: string) => {
      toast(data);
    });

    socket.on("leave-table-response", (data: string) => {
      toast(data);
    });

    socket.on("leave-table-error", (data: string) => {
      toast(data);
    });

    // Cleanup once the component is unmounted
    return () => {
      socket.off("join-table-response");
      socket.off("leave-table-response");

      socket.off("connect_error");

      socket.off("join-table-error");
      socket.off("leave-table-error");
    };
  }, []);

  return (
    <div className={s.pageContainer}>
      <Section className={s.listSection}>
        <Input
          type="text"
          placeholder="Enter game id"
          value={gameId}
          onChange={(e) => {
            setGameId(e.target.value);
          }}
        />
        <div className={s.buttons}>
          <Button className={s.button} onClick={handleLeave}>
            Leave game
          </Button>
          <Button className={clsx(s.button, s.color)} onClick={handleJoin}>
            Join game
          </Button>
        </div>
      </Section>

      <Section className={s.listSection}>
        <Input
          type="text"
          placeholder="Enter game name"
          value={gameName}
          onChange={(e) => {
            setGameName(e.target.value);
          }}
        />
        <Input
          placeholder="Enter max number players"
          value={gamePlayersAmount}
          type="number"
          onChange={(e) => {
            setGamePlayersAmount(Number(e.target.value));
          }}
        />
        <div className={s.buttons}>
          <Button className={s.button} onClick={createGame}>
            Create game
          </Button>
        </div>
      </Section>
    </div>
  );
};

export default JoinLeaveGamePage;
