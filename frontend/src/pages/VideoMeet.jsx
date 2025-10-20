import React, { useEffect, useRef, useState } from "react";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import "./styles/videoComponent.css";

const server_url = "http://localhost:8000";
const peerConfigConnections = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

export default function VideoMeetComponent() {
  const socketRef = useRef();
  const socketIdRef = useRef();
  const localVideoRef = useRef();

  const [videoAvailable, setVideoAvailable] = useState(true);
  const [audioAvailable, setAudioAvailable] = useState(true);
  const [video, setVideo] = useState(true);
  const [audio, setAudio] = useState(true);
  const [askForUsername, setAskForUsername] = useState(true);
  const [username, setUsername] = useState("");

  // Get user media permissions
  const getPermissions = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setVideoAvailable(true);
      setAudioAvailable(true);
      window.localStream = stream;

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing media devices:", err);
      setVideoAvailable(false);
      setAudioAvailable(false);
    }
  };

  useEffect(() => {
    getPermissions();
  }, []);

  const connect = () => {
    if (username.trim() !== "") {
      setAskForUsername(false);
      // Later: connectToSocketServer();
    }
  };

  return (
    <div className="video-meet-container">
      {askForUsername ? (
        <div className="lobby">
          <h2>Enter into Lobby</h2>
          <TextField
            id="outlined-basic"
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            variant="outlined"
          />
          <Button variant="contained" onClick={connect} sx={{ marginTop: 2 }}>
            Connect
          </Button>

          <div style={{ marginTop: "1rem" }}>
            <video
              ref={localVideoRef}
              autoPlay
              muted
              width="300"
              height="200"
            ></video>
          </div>
        </div>
      ) : (
        <div className="meeting">
          <h2>Welcome {username}</h2>
          <video
            ref={localVideoRef}
            autoPlay
            muted
            width="300"
            height="200"
          ></video>
        </div>
      )}
    </div>
  );
}
