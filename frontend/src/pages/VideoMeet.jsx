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

  let getUserMediaSuccess = (stream) => {
    try {
      window.localStream.getTracks().forEach((track) => {
        track.stop();
      });

      window.localStream = stream;
      localVideoRef.current.srcObject = stream;

      for (let id in connections) {
        if (id === socketIdRef.current) continue;

        connections[id].addStream(window.localStream);

        connections[id].createOffer().then((description) => {
          connections[id]
            .setLocalDescription(description)
            .then(() => {
              socketRef.current.emit(
                "sdp",
                id,
                JSON.stringify({ sdp: connections[id].localDescription })
              );
            })
            .catch((err) => {
              console.error("Error setting local description:", err);
            });
        });
      }

      stream.getTracks().forEach(
        //when a track ends
        (track) =>
          (track.onended = () => {
            setVideo(false);
            setAudio(false);

            try {
              let tracks = localVideoRef.current.srcObject.getTracks();
              tracks.forEach((track) => track.stop());
            } catch (err) {
              console.error("Error stopping media tracks.", err);
            }

            let blackSilence = (...args) =>
              new MediaStream([black(...args), silence()]);
            window.localStream = blackSilence();
            localVideoRef.current.srcObject = window.localStream;

            for (let id in connections) {
              connections[id].addStream(window.localStream);
              connections[id]
                .createOffer()
                .then((offer) => {
                  connections[id].setLocalDescription(offer).then(() => {
                    socketRef.current.emit(
                      "signal",
                      id,
                      JSON.stringify({
                        sdp: connections[id].localDescription,
                      })
                    );
                  });
                })
                .catch((err) => {
                  console.error("Error setting local description:", err);
                });
            }
          })
      );
    } catch (e) {
      console.error("Error in getUserMediaSuccess:", e);
    }
  };

  let silence = () => {
    const ctx = new AudioContext();
    const oscillator = ctx.createOscillator();

    let dst = oscillator.connect(ctx.createMediaStreamDestination());
    oscillator.start();
    return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false });
  };

  let black = ({ width = 640, height = 480 }) => {
    let canvas = Object.assign(document.createElement("canvas"), {
      width,
      height,
    });
    canvas.getContext("2d").fillRect(0, 0, width, height);
    let stream = canvas.captureStream();
    stream.addTrack(silence());
    return stream;
  };

  let getUserMedia = async () => {
    if ((video && videoAvailable) || (audio && audioAvailable)) {
      navigator.mediaDevices
        .getUserMedia({
          video: video && videoAvailable,
          audio: audio && audioAvailable,
        })
        .then(getUserMediaSuccess) // media success (I muted my audio => Mute my audio in all connections)
        .then((stream) => {})
        .catch((err) => {
          console.error("Error accessing media devices.", err);
        });
    } else {
      try {
        let tracks = localVideoRef.current.srcObject.getTracks();
        tracks.forEach((track) => track.stop());
      } catch (err) {
        console.error("Error stopping media tracks.", err);
      }
    }
  };
  useEffect(() => {
    if (video !== undefined && audio !== undefined) getUserMedia();
  }, [audio, video]);

  let getMessageFromServer = (fromId, message) => {
    var signal = JSON.parse(message);

    if (fromId !== socketIdRef.current) {
      if (signal.sdp) {
        connections[fromId]
          .setRemoteDescription(
            //reading the offer letter
            new RTCSessionDescription(signal.sdp)
          )
          .then(() => {
            if (signal.sdp.type === "offer") {
              connections[fromId]
                .createAnswer()
                .then((answer) => {
                  //we send an answer letter which whnen received will set remote description
                  connections[fromId].setLocalDescription(answer);
                })
                .then(() => {
                  socketRef.current.emit(
                    "sdp",
                    fromId,
                    JSON.stringify({
                      sdp: connections[fromId].localDescription,
                    })
                  );
                })
                .catch((err) => {
                  console.error("Error creating answer:", err);
                })
                .catch((err) => {
                  console.error("Error setting remote description:", err);
                });
            }
          });
      }

      if (signal.ice) {
        connections[fromId]
          .addIceCandidate(
            //adding ice candidate to connection
            new RTCIceCandidate(signal.ice)
          )
          .catch((err) => {
            console.error("Error adding ICE candidate:", err);
          });
      }
    }
  };

  let addMessage = (data, sender, socketIdSender) => {};

  let connectToSocketServer = () => {
    socketRef.current = io.connect(server_url, { secure: false });
    socketRef.current.on("signal", gotMessageFromServer);
    socketRef.current.on("connect", () => {
      socketRef.current.emit("join-call", window.location.href);
      socketIdRef.current = socketRef.current.id;
      socketRef.current.on("chat-message", addMessage);

      socketRef.current.on("user-left", (id) => {
        setVideo((videos) => videos.filter((video) => video.socketId !== id)); //Get all videos except of that one id that has left
      });

      socketRef.current.on("user-joined", (id, clients) => {
        clients.forEach((socketListId) => {
          connections[socketListId] = new RTCPeerConnection(
            peerConfigConnections
          );

          connections[socketListId].onicecandidate = (event) => {
            if (event.candidate != null) {
              socketRef.current.emit(
                "signal",
                socketListId,
                JSON.stringify({ ice: event.candidate })
              );
            }
          };

          connections[socketListId].addStream = (event) => {
            let videoExists = localVideoRef.current.find(
              (video) => video.socketId === socketListId
            ); //if video exists
            if (videoExists) {
              setVideo((videos) => {
                const updatedVideos = videos.map((video) => {
                  video.socketId === socketListId
                    ? { ...video, srcObject: event.stream }
                    : video;
                });
                videoRef.current = updatedVideos;
                return updatedVideos;
              });
            } else {
              let newVideo = {
                socketId: socketListId,
                stream: event.stream,
                autoPlay: true,
                playsinline: true,
              };

              setVideo((videos) => {
                const updatedVideos = [...videos, newVideo]; // ... => for pushing back (CRUD operator)
                videoRef.current = updatedVideos;
                return updatedVideos;
              });
            }
          };
          if (window.localStream !== undefined && window.localStream !== null) {
            connections[socketListId].addStream(window.localStream);
          } else {
            let blackSilence = (...args) =>
              new MediaStream([black(...args), silence()]);
            window.localStream = blackSilence();
            connections[socketListId].addStream(window.localStream);
          }
        });

        if (id === socketIdRef.current) {
          for (let id2 in connections) {
            // create an offer letter to connect with new user
            if (id2 === socketIdRef.current) continue; //Same person skip

            try {
              connections[id2].addStream(window.localStream); // add my stream to connection
            } catch (err) {
              console.error("Error creating offer:", err);
            }
            connections[id2]
              .createOffer()
              .then((offer) => {
                connections[id2].setLocalDescription(offer); // set my offer as local description
              })
              .then(() => {
                socketRef.current.emit(
                  "sdp",
                  id2,
                  JSON.stringify({ sdp: connections[id2].localDescription }) //handshake between peers
                );
              })
              .catch((err) => {
                console.error("Error setting local description:", err);
              });
          }
        }
      });
    });
  };

  const getMedia = () => {
    setVideo(videoAvailable);
    setAudio(audioAvailable);
    connectToSocketServer();
  };

  let connect = () => {
    setAskForUsername(false);
    getMedia();
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
            <video ref={localVideoRef} autoPlay muted></video>
          </div>
        </div>
      ) : (
        <div className="meeting">
          <h2>Welcome {username}</h2>
          <video ref={localVideoRef} autoPlay muted></video>

          {videos.map((video) => (
            <div key={video.socketId} className="video-container"></div>
          ))}
        </div>
      )}
    </div>
  );
}
