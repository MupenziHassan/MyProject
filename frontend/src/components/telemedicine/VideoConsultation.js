import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import Peer from 'simple-peer';
import axios from 'axios';
import LoadingSpinner from '../common/LoadingSpinner';

const VideoConsultation = ({ appointmentId, patientId, doctorId, isDoctor }) => {
  const [stream, setStream] = useState(null);
  const [receivingCall, setReceivingCall] = useState(false);
  const [caller, setCaller] = useState("");
  const [callerSignal, setCallerSignal] = useState();
  const [callAccepted, setCallAccepted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [error, setError] = useState('');
  
  const myVideo = useRef();
  const userVideo = useRef();
  const connectionRef = useRef();
  const socketRef = useRef();

  // Initialize WebRTC connection
  useEffect(() => {
    if (!appointmentId) {
      setError('Appointment ID is required to start a consultation');
      return;
    }

    const setupCall = async () => {
      try {
        // Request camera & mic permissions
        const currentStream = await navigator.mediaDevices.getUserMedia({ 
          video: true, 
          audio: true 
        });
        
        setStream(currentStream);
        
        if (myVideo.current) {
          myVideo.current.srcObject = currentStream;
        }

        // Connect to signaling server
        socketRef.current = io(process.env.REACT_APP_SOCKET_SERVER || 'http://localhost:5000');
        
        // Room setup based on appointment
        socketRef.current.emit('join-room', appointmentId);
        
        // Socket event handlers
        socketRef.current.on('user-connected', userId => {
          // Handle new user joined
        });
        
        socketRef.current.on('user-disconnected', userId => {
          // Handle user left
        });
        
        socketRef.current.on('call-user', data => {
          setReceivingCall(true);
          setCaller(data.from);
          setCallerSignal(data.signal);
        });
        
      } catch (err) {
        setError(`Failed to access camera and microphone: ${err.message}`);
      }
    };
    
    setupCall();
    
    return () => {
      // Clean up resources on unmount
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      
      if (connectionRef.current) {
        connectionRef.current.destroy();
      }
    };
  }, [appointmentId]);

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
      {error && <div className="error-message">{error}</div>}
      {!stream && !error && <LoadingSpinner message="Setting up video connection..." />}
      
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
