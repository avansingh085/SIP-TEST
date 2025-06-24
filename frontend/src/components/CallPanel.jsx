import React, { useEffect, useRef, useState } from "react";
import JsSIP from "jssip";



const SIP_DOMAIN = import.meta.env.VITE_BACKEND_DOMAIN; 
const CallPanel = ({ sipCreds }) => {
  const [ua, setUa] = useState(null);
  const [target, setTarget] = useState("");
  const [status, setStatus] = useState("Disconnected");
  const [incomingCall, setIncomingCall] = useState(null);
  const [callControls, setCallControls] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const sessionRef = useRef(null);
  const localStreamRef = useRef(null);

  useEffect(() => {
    const socket = new JsSIP.WebSocketInterface(`wss://${SIP_DOMAIN}:8089/ws`);

    const configuration = {
      sockets: [socket],
      uri: `sip:${sipCreds.username}@${SIP_DOMAIN}`,
      password: sipCreds.password,
      registrar_server: `sip:${SIP_DOMAIN}`,
      contact_uri: `sip:${sipCreds.username}@${SIP_DOMAIN};transport=wss`,
      session_timers: false,
      register: true,
    };

    const uaInstance = new JsSIP.UA(configuration);

    uaInstance.on("connected", () => {
      console.log("WebSocket connected");
    });

    uaInstance.on("disconnected", () => {
      console.log("WebSocket disconnected");
      setStatus("Disconnected");
    });

    uaInstance.on("registered", () => {
      setStatus(`Registered as ${sipCreds.username}`);
    });

    uaInstance.on("registrationFailed", (e) => {
      console.error("Registration failed", e.cause);
      setStatus(`Registration failed: ${e.cause}`);
    });

    uaInstance.on("newRTCSession", (e) => {
      const session = e.session;

      if (session.direction === "incoming") {
        if (sessionRef.current) {
          session.terminate();
          return;
        }

        setIncomingCall({
          from: session.remote_identity.uri.user,
          session,
        });

        sessionRef.current = session;
      }
    });

    uaInstance.start();
    setUa(uaInstance);

    return () => {
      uaInstance.stop();
    };
  }, [sipCreds]);

  const setupSessionEvents = (session) => {
    session.on("confirmed", () => {
      const peer = session.remote_identity.uri.user;
      setStatus(`In call with ${peer}`);
      setCallControls(true);
    });

    session.on("ended", () => {
      setStatus("Call ended");
      sessionRef.current = null;
      setCallControls(false);
      setIncomingCall(null);
    });

    session.on("failed", (e) => {
      console.error("Call failed:", e.cause);
      setStatus(`Call failed: ${e.cause}`);
      sessionRef.current = null;
      setCallControls(false);
      setIncomingCall(null);
    });

    session.connection.addEventListener("track", (event) => {
      const remoteAudio = document.getElementById("remoteAudio");
      if (remoteAudio) {
        remoteAudio.srcObject = event.streams[0];
        remoteAudio.play().catch((err) =>
          console.error("Audio play failed:", err)
        );
      }
    });
  };

  const call = () => {
    if (!ua) return alert("UA not connected");
    if (!target.trim()) return alert("Enter a valid SIP username");
    if (sessionRef.current) return alert("Already in a call");

    const session = ua.call(`sip:${target}@${SIP_DOMAIN}`, {
      mediaConstraints: { audio: true, video: false },
      pcConfig: {
        iceServers: [{ urls: ["stun:stun.l.google.com:19302"] }],
      },
    });

    sessionRef.current = session;
    setupSessionEvents(session);
  };

  const answerCall = () => {
    if (!incomingCall || !incomingCall.session) return;

    incomingCall.session.answer({
      mediaConstraints: { audio: true, video: false },
      pcConfig: {
        iceServers: [{ urls: ["stun:stun.l.google.com:19302"] }],
      },
    });

    setupSessionEvents(incomingCall.session);
    setIncomingCall(null);
  };

  const endCall = () => {
    if (sessionRef.current) {
      sessionRef.current.terminate();
    }
  };

  const toggleMute = () => {
    const pc = sessionRef.current?.connection;
    if (pc) {
      pc.getSenders().forEach((sender) => {
        if (sender.track?.kind === "audio") {
          sender.track.enabled = isMuted;
        }
      });
      setIsMuted(!isMuted);
    }
  };

  return (
    <div className="p-4 mt-4 bg-gray-900 rounded text-white relative">
      <h2 className="text-lg mb-2 font-semibold">Call a User</h2>
      <input
        className="p-2 mb-3 w-full rounded bg-gray-700 text-white placeholder-gray-400"
        placeholder="Enter SIP username (e.g., 6002)"
        value={target}
        onChange={(e) => setTarget(e.target.value)}
      />
      <button
        onClick={call}
        className="w-full bg-blue-600 hover:bg-blue-700 p-2 rounded font-medium"
      >
        Call
      </button>
      <p className="mt-4 text-sm text-green-400">{status}</p>

      {/* Audio Output */}
      <audio id="remoteAudio" autoPlay hidden />

      {/* Incoming Call Modal */}
      {incomingCall && (
        <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded shadow-lg text-center">
            <h3 className="text-lg mb-2">Incoming Call</h3>
            <p className="mb-4">From: <strong>{incomingCall.from}</strong></p>
            <button
              onClick={answerCall}
              className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded mr-4"
            >
              Accept
            </button>
            <button
              onClick={endCall}
              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
            >
              Reject
            </button>
          </div>
        </div>
      )}

      {/* Call Controls */}
      {callControls && (
        <div className="mt-6 flex justify-around">
          <button
            onClick={toggleMute}
            className="bg-yellow-500 hover:bg-yellow-600 px-4 py-2 rounded"
          >
            {isMuted ? "Unmute" : "Mute"}
          </button>
          <button
            onClick={endCall}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
          >
            End Call
          </button>
        </div>
      )}
    </div>
  );
};

export default CallPanel;
