import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import { useNavigate, useParams } from "react-router-dom";
import { getLocalStorage } from "@/utills/LocalStorageUtills";

// Replace with your ngrok URL or server URL
const SOCKET_SERVER_URL = "https://backend-avatar-local.onrender.com/";
const socket = io(SOCKET_SERVER_URL);
import Images from "@/constant/Images";

const Room = () => {
  const [videoDevices, setVideoDevices] = useState([]);
  const localVideoRef = useRef(null);
  const videosContainerRef = useRef(null);
  const [joinId, setJoinId] = useState("");
  const [viewers, setViewers] = useState(null);
  const [roomId, setRoomId] = useState("");
  const [localStream, setLocalStream] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [peerConnections, setPeerConnections] = useState({});
  const [isBroadcaster, setIsBroadcaster] = useState(false);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const params = useParams();
  const navigate = useNavigate();

  // const configuration = {
  //   iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  // };

  const configuration = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" }, // Free STUN server
      {
        urls: "relay1.expressturn.com:3478", // Replace with your TURN server URL
        username: "efFB27U3UQZAO4UJTS",         // TURN server username
        credential: "ZFL8IlpiPjMDT4uT",       // TURN server password
      },
    ],
  };
  

  useEffect(() => {
    // Fetch the available media devices
    navigator.mediaDevices
      .enumerateDevices()
      .then((devices) => {
        const videoInputDevices = devices.filter(
          (device) => device.kind === "videoinput"
        );
        setVideoDevices(videoInputDevices);
      })
      .catch((error) => {
        console.error("Error accessing devices:", error);
      });
  }, []);

  useEffect(() => {
    // Check connection status and handle errors
    const handleConnectionError = (error) => {
      console.error("Socket connection error:", error);
      setErrorMessage("Socket connection error. Please try again.");
    };

    socket.on("connect", () => {
      console.log("Connected to server");
      setErrorMessage("");
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from server");
      setErrorMessage(
        "Disconnected from server. Please check your connection."
      );
    });

    socket.on("connect_error", handleConnectionError);
    socket.on("connect_timeout", handleConnectionError);

    socket.on("created", async (room) => {
      setIsBroadcaster(true);
      const stream = await getUserMedia();
      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    });

    socket.on("joined", async (room) => {
      setIsBroadcaster(false);
      const stream = await getUserMedia(false);
      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    });

    socket.on("viewer", (viewerId) => handleViewerJoined(viewerId));
    socket.on("offer", (offer, broadcasterId) =>
      handleOffer(offer, broadcasterId)
    );
    socket.on("answer", (answer, viewerId) => handleAnswer(answer, viewerId));
    socket.on("ice-candidate", (candidate, viewerId) =>
      handleICECandidate(candidate, viewerId)
    );
    socket.on("stop", handleStop);
    socket.on("total", (total) => {
      setViewers(total);
    });
    socket.on("broadcaster-left", handleBroadcasterLeft);
    socket.on("viewer-left", handleViewerLeft);
    socket.on("new-message", handleNewMessage);

    return () => {
      // Cleanup socket events on unmount
      socket.off("created");
      socket.off("joined");
      socket.off("viewer");
      socket.off("offer");
      socket.off("answer");
      socket.off("ice-candidate");
      socket.off("stop");
      socket.off("broadcaster-left");
      socket.off("viewer-left");
      socket.off("connect_error");
      socket.off("connect_timeout");
      socket.off("new-message", handleNewMessage);
    };
  }, [peerConnections, localStream]);

  const getUserMedia = async (audio = true) => {
    try {
      return await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: audio,
      });
    } catch (error) {
      handleMediaError(error);
    }
  };

  const handleNewMessage = (data) => {
    const { viewerId, message, user } = data;
    setMessages((prevMessages) => [...prevMessages, { user, message }]);
  };

  const createRoom = () => {
    const generatedRoomId = params?.id;
    setRoomId(generatedRoomId);
    socket.emit("create", generatedRoomId);
  };

  const joinRoom = () => {
    const roomid = params?.id;
    setJoinId(roomid);
    if (roomid) {
      socket.emit("join", roomid);
    }
  };

  const stopStream = () => {
    if (roomId) {
      socket.emit("stop", roomId);
      localStream.getTracks().forEach((track) => track.stop());
      if (localVideoRef.current) localVideoRef.current.srcObject = null;
    }
  };

  const exitRoom = () => {
    if (roomId) {
      socket.emit("exit", roomId);
      localStream.getTracks().forEach((track) => track.stop());
      navigate("/user/dashboard");
    }
  };

  const handleViewerJoined = (viewerId) => {
    const peerConnection = new RTCPeerConnection(configuration);
    setPeerConnections((prev) => ({ ...prev, [viewerId]: peerConnection }));

    localStream
      .getTracks()
      .forEach((track) => peerConnection.addTrack(track, localStream));

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", event.candidate, roomId, viewerId);
      }
    };

    peerConnection
      .createOffer()
      .then((offer) => peerConnection.setLocalDescription(offer))
      .then(() => {
        socket.emit("offer", peerConnection.localDescription, roomId, viewerId);
      });
  };

  const handleOffer = async (offer, broadcasterId) => {
    const peerConnection = new RTCPeerConnection(configuration);
    setPeerConnections((prev) => ({
      ...prev,
      [broadcasterId]: peerConnection,
    }));

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", event.candidate, roomId, broadcasterId);
      }
    };

    peerConnection.ontrack = (event) => {
      const remoteVideo = document.createElement("video");
      remoteVideo.srcObject = event.streams[0];
      remoteVideo.autoplay = true;
      remoteVideo.playsInline = true;
      if (videosContainerRef.current) {
        videosContainerRef.current.appendChild(remoteVideo);
      }
    };

    await peerConnection.setRemoteDescription(offer);
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    socket.emit("answer", answer, roomId, broadcasterId);
  };

  const handleAnswer = (answer, viewerId) => {
    const peerConnection = peerConnections[viewerId];
    peerConnection.setRemoteDescription(answer);
  };

  const handleICECandidate = (candidate, viewerId) => {
    const peerConnection = peerConnections[viewerId];
    peerConnection.addIceCandidate(candidate);
  };

  const handleStop = () => {
    localStream.getTracks().forEach((track) => track.stop());
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (videosContainerRef.current) videosContainerRef.current.innerHTML = "";
  };

  const handleBroadcasterLeft = () => {
    setErrorMessage("Broadcaster has left the room.");
    exitRoom();
  };

  const handleViewerLeft = (viewerId) => {
    const peerConnection = peerConnections[viewerId];
    if (peerConnection) {
      peerConnection.close();
      setPeerConnections((prev) => {
        const { [viewerId]: removed, ...remaining } = prev;
        return remaining;
      });
    }
  };

  const handleMediaError = (error) => {
    setErrorMessage(`Media Error: ${error.message}`);
  };

  const handleCameraChange = async (event) => {
    const selectedDeviceId = event.target.value;
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
    }

    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        deviceId: { exact: selectedDeviceId },
        width: { ideal: 1920 },
        height: { ideal: 1080 },
      },
      audio: true,
    });

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
    }

    setLocalStream(stream);

    Object.values(peerConnections).forEach((peerConnection) => {
      const videoSender = peerConnection
        .getSenders()
        .find((sender) => sender.track.kind === "video");
      if (videoSender) {
        videoSender.replaceTrack(stream.getVideoTracks()[0]);
      }
    });
  };

  useEffect(() => {
    const currentPath = window.location.pathname;
    if (currentPath.includes("room_create")) {
      createRoom();
    } else if (currentPath.includes("room_join")) {
      joinRoom();
    }
  }, []);

  const handleSendMessage = (e) => {
    e.preventDefault();
    const user = getLocalStorage("user")?.userName;
    const roomId = params?.id;
    if (messageInput.trim()) {
      socket.emit("send-message", {
        roomId,
        viewerId: socket.id,
        message: messageInput,
        user,
      });
      setMessageInput("");
    }
  };

  useEffect(() => {
    const scrollingMessages = document.querySelector("#scrolling-messages");
    scrollingMessages.scrollTo(0, scrollingMessages.scrollHeight);
  }, [messages]);

  return (
    <div className="relative z-[1] before:block before:absolute before:-inset-0 before:bg-black/10 before:z-[-1] overflow-hidden">
      <div className="flex flex-col items-center space-y-4 absolute top-[20px] sm:top-[10px] left-auto right-[20px] sm:right-[10px]">
        {isBroadcaster && (
          <button
            className="bg-[#2d2d2d] text-white font-semibold py-2 px-4 shadow-l rounded-full sm:text-xs sm:py-[8px]"
            onClick={stopStream}
          >
            Stop Stream
          </button>
        )}
      </div>
      <div id="error-message" style={{ color: "red", fontWeight: "bold" }}>
        {errorMessage}
      </div>

      <div
        id="videos"
        className="has-video flex flex-wrap flex-col justify-between h-svh px-[20px] pt-[20px] sm:px-[10px] sm:pt-[10px]"
      >
        {isBroadcaster ? (
          <>
            <div className="sm:text-xs sm:mt-[8px]">
              <label className="mr-[10px] text-white">Select Camera:</label>
              <select onChange={handleCameraChange}>
                {videoDevices.map((device) => (
                  <option key={device.deviceId} value={device.deviceId}>
                    {device.label || `Camera ${device.deviceId}`}
                  </option>
                ))}
              </select>
            </div>

            <video
              className="videoStyle absolute top-0 left-0 w-screen h-svh z-[-2] object-cover has-video"
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
            ></video>
            <div className="watching-live-count text-white inline-flex items-center gap-[5px] text-lg sm:text-base absolute top-auto left-auto bottom-[80px] right-[20px] leading-none">
              <img src={Images.iconEyeLight} alt="" />
              {viewers}
            </div>
          </>
        ) : (
          <div
            className="videoStyle absolute top-0 left-0 w-screen h-svh z-[-2] object-cover"
            ref={videosContainerRef}
          ></div>
        )}
        <div className="mt-auto">
          <div
            id="scrolling-messages"
            className="scrollbar-hidden h-48 overflow-y-auto mb-[20px] pr-[40%] md:pr-[20%] sm:pr-[100px] text-white"
          >
            {messages.map((msg, index) => (
              <div key={index} className="mb-[20px]">
                <strong className="font-semibold text-lg sm:text-base line-clamp-1 drop-shadow-md leading-none mb-[6px] sm:mb-[4px] capitalize">
                  {msg.user}:
                </strong>{" "}
                <p className="text-sm sm:text-xs line-clamp-3 drop-shadow-md">
                  {msg.message}
                </p>
              </div>
            ))}
          </div>
          <form
            className="flex flex-wrap justify-between pb-[20px] sm:pb-[10px]"
            onSubmit={handleSendMessage}
          >
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder="Type a message..."
              className="bg-[#E5E5E5]/30 border-2 px-4 placeholder-white font-medium border-white rounded-full text-base sm:text-sm text-white w-[calc(100%-80px)] h-[46px]"
            />
            <button
              onClick={handleSendMessage}
              className="bg-[#2d2d2d] hover:bg-[#2d2d2d] text-white font-bold h-[46px] px-4 rounded-full"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Room;