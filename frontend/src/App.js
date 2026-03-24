import React, { useState, useEffect } from "react";
import Speedometer from "./ui-components/Speedometer";
import "./App.css";

function App() {
  const [speed, setSpeed] = useState(0);
  const [timestamp, setTimestamp] = useState("");
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // Connect to SSE stream with proper error handling and reconnection
    let eventSource;
    let reconnectTimeout;

    const connectSSE = () => {
      try {
        eventSource = new EventSource("http://localhost:5000/api/speed/stream");

        eventSource.onopen = () => {
          setConnected(true);
          console.log("SSE connection established");
        };

        // Listen for speed updates
        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            // Only update if we have a speed value
            if (data.speed !== undefined && typeof data.speed === "number") {
              setSpeed(Math.max(0, Math.min(data.speed, 200)));
              if (data.timestamp) {
                setTimestamp(data.timestamp);
              }
            }
          } catch (error) {
            console.error("Error parsing SSE data:", error);
          }
        };

        // Handle errors and reconnect
        eventSource.onerror = () => {
          setConnected(false);
          console.error("SSE connection error - attempting to reconnect...");
          eventSource.close();

          // Reconnect after 3 seconds
          reconnectTimeout = setTimeout(() => {
            connectSSE();
          }, 3000);
        };
      } catch (error) {
        console.error("Failed to create EventSource:", error);
        setConnected(false);
      }
    };

    // Initial connection
    connectSSE();

    // Cleanup on component unmount
    return () => {
      if (eventSource) {
        eventSource.close();
      }
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
    };
  }, []);

  return (
    <div className="App">
      <h1>⏱️ Speedometer App</h1>

      <div className="status">
        <span
          className={`indicator ${connected ? "connected" : "disconnected"}`}
        >
          {connected ? "Connected" : "Disconnected"}
        </span>
      </div>

      <div className="tab-content">
        <Speedometer speed={speed} />
        {timestamp && (
          <p className="timestamp">
            Last update: {new Date(timestamp).toLocaleTimeString()}
          </p>
        )}
      </div>
    </div>
  );
}

export default App;
