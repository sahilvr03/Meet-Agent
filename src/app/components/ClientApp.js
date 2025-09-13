"use client";
import React, { useState, useEffect } from "react";
import MeetingItem from './MeetingItem';
import ActionItemDisplay from './ActionItemDisplay';
import ChatInterface from './ChatInterface';
import Sidebar from './Sidebar';
import MainContent from './MainContent';
import { auth, googleProvider } from '../config/firebase-config';
import { onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";

const languageOptions = [
  { value: "en", label: "English" },
  { value: "ur", label: "Urdu" },
  { value: "es", label: "Spanish" },
  { value: "ro", label: "Romanian" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "it", label: "Italian" },
  { value: "pt", label: "Portuguese" },
  { value: "ru", label: "Russian" },
  { value: "zh", label: "Chinese" },
  { value: "ja", label: "Japanese" },
  { value: "ko", label: "Korean" },
  { value: "ar", label: "Arabic" },
  { value: "hi", label: "Hindi" }
];

export default function ClientApp({ initialMeetings }) {
  const [file, setFile] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [status, setStatus] = useState(null);
  const [runId, setRunId] = useState(null);
  const [result, setResult] = useState(null);
  const [meetings, setMeetings] = useState(initialMeetings);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState("upload");
  const [showUpload, setShowUpload] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isLiveRecording, setIsLiveRecording] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState("");
  const [livePoints, setLivePoints] = useState({ key_points: [], action_items: [], sentiment: "neutral" });
  const [liveRunId, setLiveRunId] = useState(null);
  const [webSocket, setWebSocket] = useState(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [user, setUser] = useState(null);
  const MAX_RECONNECT_ATTEMPTS = 3;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        try {
          const idToken = await firebaseUser.getIdToken();
          await fetch("http://localhost:8000/auth/save-user", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              photoURL: firebaseUser.photoURL,
              provider: firebaseUser.providerData[0]?.providerId || "email"
            })
          });
          fetchMeetings(firebaseUser.uid);
        } catch (error) {
          console.error("Error saving user to backend:", error);
        }
      } else {
        setUser(null);
        setMeetings([]);
      }
    });
    return () => {
      unsubscribe();
      if (webSocket) {
        webSocket.close();
      }
    };
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login error:", error);
      alert("Failed to log in with Google. Please try again.");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout error:", error);
      alert("Failed to log out. Please try again.");
    }
  };

  const fetchMeetings = async (userId) => {
    if (!userId) return;
    try {
      const idToken = await auth.currentUser.getIdToken();
      const res = await fetch(`http://localhost:8000/meetings/${userId}`, {
        headers: { Authorization: `Bearer ${idToken}` }
      });
      if (!res.ok) throw new Error("Failed to fetch meetings");
      const data = await res.json();
      setMeetings(data.meetings || []);
    } catch (error) {
      console.error("Error fetching meetings:", error);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
    }
  };

  const upload = async () => {
    if (!file) {
      alert("Please select a file first!");
      return;
    }
    if (!user) {
      alert("You must be logged in to upload files!");
      return;
    }
    setLoading(true);
    setResult(null);
    setStatus(null);
    try {
      const idToken = await auth.currentUser.getIdToken();
      const fd = new FormData();
      fd.append("file", file);
      fd.append("language", selectedLanguage);
      const res = await fetch("http://localhost:8000/upload-audio", {
        method: "POST",
        headers: { Authorization: `Bearer ${idToken}` },
        body: fd,
      });
      if (!res.ok) throw new Error("Failed to upload file");
      const data = await res.json();
      setStatus(data);
      setRunId(data.run_id);
      pollStatus(data.run_id);
    } catch (err) {
      console.error("Upload error:", err);
      setLoading(false);
      alert("Failed to upload file. Please try again.");
    }
  };

  const pollStatus = async (id) => {
    if (!user) return;
    const interval = setInterval(async () => {
      try {
        const idToken = await auth.currentUser.getIdToken();
        const res = await fetch(`http://localhost:8000/status/${id}`, {
          headers: { Authorization: `Bearer ${idToken}` }
        });
        if (!res.ok) throw new Error("Failed to fetch status");
        const data = await res.json();
        setStatus(data);
        if (data.status === "done") {
          setResult(data.result);
          clearInterval(interval);
          setLoading(false);
          fetchMeetings(user.uid);
          setShowUpload(false);
        }
      } catch (err) {
        console.error("Polling error:", err);
        clearInterval(interval);
        setLoading(false);
      }
    }, 3000);
  };

  const openChat = (meeting) => {
    setSelectedMeeting(meeting);
    setView("chat");
  };

  const deleteConversation = async (run_id, chat_id) => {
    if (!user) {
      alert("You must be logged in to delete conversations!");
      return;
    }
    try {
      const idToken = await auth.currentUser.getIdToken();
      const res = await fetch(`http://localhost:8000/conversations/${run_id}/${chat_id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${idToken}` }
      });
      if (!res.ok) throw new Error("Failed to delete conversation");
      alert("Conversation deleted successfully");
      // Refresh the chat data
      setSelectedMeeting({ ...selectedMeeting, run_id });
    } catch (err) {
      console.error("Delete conversation error:", err);
      alert("Failed to delete conversation");
    }
  };

  const deleteAllConversations = async (run_id) => {
    if (!user) {
      alert("You must be logged in to delete conversations!");
      return;
    }
    if (!confirm("Are you sure you want to delete all conversations for this meeting?")) return;
    try {
      const idToken = await auth.currentUser.getIdToken();
      const res = await fetch(`http://localhost:8000/conversations/${run_id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${idToken}` }
      });
      if (!res.ok) throw new Error("Failed to delete conversations");
      alert("All conversations deleted successfully");
      setSelectedMeeting({ ...selectedMeeting, run_id });
    } catch (err) {
      console.error("Delete all conversations error:", err);
      alert("Failed to delete all conversations");
    }
  };

  const updateConversation = async (run_id, chat_id, message, response) => {
    if (!user) {
      alert("You must be logged in to update conversations!");
      return;
    }
    try {
      const idToken = await auth.currentUser.getIdToken();
      const res = await fetch(`http://localhost:8000/conversations/${run_id}/${chat_id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`
        },
        body: JSON.stringify({ message, response }),
      });
      if (!res.ok) throw new Error("Failed to update conversation");
      alert("Conversation updated successfully");
      setSelectedMeeting({ ...selectedMeeting, run_id });
    } catch (err) {
      console.error("Update conversation error:", err);
      alert("Failed to update conversation");
    }
  };

  const downloadConversations = async (run_id, format) => {
    if (!user) {
      alert("You must be logged in to download conversations!");
      return;
    }
    try {
      const idToken = await auth.currentUser.getIdToken();
      const res = await fetch(`http://localhost:8000/conversations/${run_id}/download/${format}`, {
        headers: { Authorization: `Bearer ${idToken}` }
      });
      if (!res.ok) throw new Error(`Failed to download ${format} file`);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `meeting_${run_id}.${format}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(`Download ${format} error:`, err);
      alert(`Failed to download ${format} file`);
    }
  };

  const deleteMeeting = async (run_id) => {
    if (!user) {
      alert("You must be logged in to delete meetings!");
      return;
    }
    try {
      const idToken = await auth.currentUser.getIdToken();
      const res = await fetch(`http://localhost:8000/meetings/${run_id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${idToken}` }
      });
      if (!res.ok) throw new Error("Failed to delete meeting");
      alert("Meeting deleted successfully");
      await fetchMeetings(user.uid);
      if (selectedMeeting && selectedMeeting.run_id === run_id) {
        setSelectedMeeting(null);
        setView("upload");
      }
    } catch (err) {
      console.error("Delete meeting error:", err);
      alert("Failed to delete meeting");
    }
  };

  const renameMeeting = async (run_id, filename) => {
    if (!user) {
      alert("You must be logged in to rename meetings!");
      return;
    }
    try {
      const idToken = await auth.currentUser.getIdToken();
      const res = await fetch(`http://localhost:8000/meetings/${run_id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`
        },
        body: JSON.stringify({ filename }),
      });
      if (!res.ok) throw new Error("Failed to rename meeting");
      alert("Meeting renamed successfully");
      await fetchMeetings(user.uid);
    } catch (err) {
      console.error("Rename meeting error:", err);
      alert("Failed to delete meeting");
    }
  };

  const downloadMeeting = async (run_id, format) => {
    if (!user) {
      alert("You must be logged in to download meetings!");
      return;
    }
    try {
      const idToken = await auth.currentUser.getIdToken();
      const res = await fetch(`http://localhost:8000/conversations/${run_id}/download/${format}`, {
        headers: { Authorization: `Bearer ${idToken}` }
      });
      if (!res.ok) throw new Error(`Failed to download ${format} file`);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `meeting_${run_id}.${format}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(`Download ${format} error:`, err);
      alert(`Failed to download ${format} file`);
    }
  };

  const attemptReconnect = async (stream, mediaRecorder) => {
    if (!user) {
      alert("You must be logged in to use live transcription!");
      return;
    }
    if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
      alert("Unable to connect to live transcription service after multiple attempts. Please ensure the backend server is running and try again.");
      setIsLiveRecording(false);
      setWebSocket(null);
      setReconnectAttempts(0);
      mediaRecorder.stop();
      stream.getTracks().forEach(track => track.stop());
      return;
    }
    setReconnectAttempts(prev => prev + 1);
    console.log(`Reconnecting WebSocket, attempt ${reconnectAttempts + 1}/${MAX_RECONNECT_ATTEMPTS}...`);
    const idToken = await auth.currentUser.getIdToken();
    const ws = new WebSocket(`ws://localhost:8000/live-transcribe?language=${selectedLanguage}&user_id=${user.uid}&token=${idToken}`);

    ws.onopen = () => {
      console.log("WebSocket reconnected successfully");
      setWebSocket(ws);
      setReconnectAttempts(0);
      mediaRecorder.start(1000);
    };
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setLiveTranscript((prev) => prev + (data.transcript || "") + " ");
        setLivePoints({
          key_points: data.key_points || [],
          action_items: data.action_items || [],
          sentiment: data.sentiment || "neutral"
        });
        if (!liveRunId && data.run_id) {
          setLiveRunId(data.run_id);
        }
      } catch (err) {
        console.error("Error parsing WebSocket message:", err);
      }
    };
    ws.onclose = () => {
      console.log("WebSocket closed during reconnect");
      mediaRecorder.stop();
      stream.getTracks().forEach(track => track.stop());
      setIsLiveRecording(false);
      setWebSocket(null);
      fetchMeetings(user.uid);
    };
    ws.onerror = (error) => {
      console.error(`WebSocket reconnect error (attempt ${reconnectAttempts + 1}):`, error);
      attemptReconnect(stream, mediaRecorder);
    };
    setWebSocket(ws);
  };

  const toggleLiveRecording = async () => {
    if (!user) {
      alert("You must be logged in to use live transcription!");
      return;
    }
    if (isLiveRecording) {
      if (webSocket) {
        webSocket.close();
        setWebSocket(null);
      }
      setIsLiveRecording(false);
      setLiveTranscript("");
      setLivePoints({ key_points: [], action_items: [], sentiment: "neutral" });
      setLiveRunId(null);
      setReconnectAttempts(0);
      fetchMeetings(user.uid);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
        const idToken = await auth.currentUser.getIdToken();

        const ws = new WebSocket(`ws://localhost:8000/live-transcribe?language=${selectedLanguage}&user_id=${user.uid}&token=${idToken}`);

        ws.onopen = () => {
          console.log("WebSocket connected");
          setWebSocket(ws);
          setIsLiveRecording(true);
          mediaRecorder.start(5000);
        };
        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            setLiveTranscript((prev) => prev + (data.transcript || "") + " ");
            setLivePoints({
              key_points: data.key_points || [],
              action_items: data.action_items || [],
              sentiment: data.sentiment || "neutral"
            });
            if (!liveRunId && data.run_id) {
              setLiveRunId(data.run_id);
            }
          } catch (err) {
            console.error("Error parsing WebSocket message:", err);
          }
        };
        ws.onclose = () => {
          console.log("WebSocket closed");
          mediaRecorder.stop();
          stream.getTracks().forEach(track => track.stop());
          setIsLiveRecording(false);
          setWebSocket(null);
          fetchMeetings(user.uid);
        };
        ws.onerror = (error) => {
          console.error("WebSocket error:", error);
          mediaRecorder.stop();
          stream.getTracks().forEach(track => track.stop());
          attemptReconnect(stream, mediaRecorder);
        };
        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0 && ws.readyState === WebSocket.OPEN) {
            ws.send(event.data);
          }
        };
        mediaRecorder.onstop = () => {
          stream.getTracks().forEach(track => track.stop());
        };
      } catch (error) {
        console.error("Error starting live recording:", error);
        alert("Failed to access microphone or connect to server. Please check permissions and server status.");
      }
    }
  };

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-blue-50/80 via-white to-purple-50/80">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please Log In</h1>
          <p>You need to be logged in to access TalkToText Pro.</p>
          <button
            onClick={handleLogin}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Sign in with Google
          </button>
        </div>
      </div>
    );
  }

  if (view === "chat" && selectedMeeting) {
    return (
      <ChatInterface
        meeting={selectedMeeting}
        user={user}
        onBack={() => {
          setView("upload");
          setSelectedMeeting(null);
          fetchMeetings(user.uid);
        }}
        deleteConversation={deleteConversation}
        deleteAllConversations={deleteAllConversations}
        updateConversation={updateConversation}
        downloadConversations={downloadConversations}
      />
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50/80 via-white to-purple-50/80">
      <Sidebar
        meetings={meetings}
        showUpload={showUpload}
        setShowUpload={setShowUpload}
        openChat={openChat}
        deleteMeeting={deleteMeeting}
        renameMeeting={renameMeeting}
        downloadMeeting={downloadMeeting}
        user={user}
        handleLogout={handleLogout}
      />
      <MainContent
        file={file}
        setFile={setFile}
        selectedLanguage={selectedLanguage}
        setSelectedLanguage={setSelectedLanguage}
        status={status}
        result={result}
        loading={loading}
        showUpload={showUpload}
        setShowUpload={setShowUpload}
        isDragging={isDragging}
        handleDragOver={handleDragOver}
        handleDragLeave={handleDragLeave}
        handleDrop={handleDrop}
        upload={upload}
        openChat={openChat}
        runId={runId}
        meetings={meetings}
        languageOptions={languageOptions}
        isLiveRecording={isLiveRecording}
        toggleLiveRecording={toggleLiveRecording}
        liveTranscript={liveTranscript}
        livePoints={livePoints}
        liveRunId={liveRunId}
      />
    </div>
  );
}