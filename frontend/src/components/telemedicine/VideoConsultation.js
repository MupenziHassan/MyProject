import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import Peer from 'simple-peer';

const VideoConsultation = ({ appointmentId, patientId, doctorId, isDoctor }) => {
  const [stream, setStream] = useState(null);
  const [receivingCall, setReceivingCall] = useState(false);
  const [caller, setCaller] = useState("");
  const [callerSignal, setCallerSignal] = useState();
  const [callAccepted, setCallAccepted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  
  const myVideo = useRef();
  const userVideo = useRef();
  const connectionRef = useRef();
  const socketRef = useRef();

  // Initialize WebRTC connection
  useEffect(() => {
    // Request camera & mic permissions
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((currentStream) => {
        setStream(currentStream);
        if (myVideo.current) {
          myVideo.current.srcObject = currentStream;
        }
      });

    // Connect to signaling server
    socketRef.current = io(process.env.REACT_APP_SOCKET_SERVER);
    
    // Initialize socket connection
    // ...existing code...
    
    return () => {
      // Clean up
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  // Call functions
  const callUser = () => {
    // Initiate WebRTC call
    // ...existing code...
  };

  const answerCall = () => {
    // Answer incoming call
    // ...existing code...
  };

  const endCall = () => {
    // End current call
    // ...existing code...
  };

  return (
    <div className="video-consultation">
      <h2>Video Consultation</h2>
      
      <div className="video-container">
        <div className="video-panel my-video">
          <video playsInline muted ref={myVideo} autoPlay />
          <div className="name-tag">{isDoctor ? "Doctor (You)" : "You"}</div>
        </div>
        
        {callAccepted && !callEnded && (
          <div className="video-panel remote-video">
            <video playsInline ref={userVideo} autoPlay />
            <div className="name-tag">{isDoctor ? "Patient" : "Doctor"}</div>
          </div>
        )}
      </div>
      
      <div className="call-controls">
        {!callAccepted && !isDoctor && (
          <button className="btn btn-primary" onClick={callUser}>
            <i className="fas fa-phone-alt"></i> Call Doctor
          </button>
        )}
        
        {receivingCall && !callAccepted && (
          <button className="btn btn-success" onClick={answerCall}>
            <i className="fas fa-phone"></i> Answer Call
          </button>
        )}
        
        {callAccepted && !callEnded && (
          <button className="btn btn-danger" onClick={endCall}>
            <i className="fas fa-phone-slash"></i> End Call
          </button>
        )}
      </div>
    </div>
  );
};

export default VideoConsultation;
