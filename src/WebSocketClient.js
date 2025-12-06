// WebSocketClient.js
import { useEffect } from 'react';

const WebSocketClient = () => {
  useEffect(() => {
    // WebSocket connection disabled - will be enabled when backend WebSocket server is ready
    // const socket = new WebSocket('ws://localhost:3000/ws'); // Update with your correct WebSocket server URL

    // socket.onopen = () => {
    //   console.log('Connected to WebSocket server');
    // };

    // socket.onmessage = (event) => {
    //   console.log('Message from server:', event.data);
    // };

    // socket.onerror = (error) => {
    //   console.log('WebSocket error:', error);
    // };

    // socket.onclose = () => {
    //   console.log('WebSocket connection closed');
    // };

    // Cleanup on unmount
    // return () => {
    //   socket.close();
    // };
  }, []);

  return <div>WebSocket Client (Disabled - awaiting backend implementation)</div>;
};

export default WebSocketClient;
