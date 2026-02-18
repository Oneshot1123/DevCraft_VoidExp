from fastapi import WebSocket
from typing import List, Dict

class ConnectionManager:
    def __init__(self):
        # Active connections: { "department_name": [websocket1, websocket2], "admin": [ws3] }
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, channel: str):
        await websocket.accept()
        if channel not in self.active_connections:
            self.active_connections[channel] = []
        self.active_connections[channel].append(websocket)
        print(f"WS client connected to channel: {channel}")

    def disconnect(self, websocket: WebSocket, channel: str):
        if channel in self.active_connections:
            self.active_connections[channel].remove(websocket)
            print(f"WS client disconnected from channel: {channel}")

    async def broadcast_to_channel(self, channel: str, message: dict):
        if channel in self.active_connections:
            for connection in self.active_connections[channel]:
                try:
                    await connection.send_json(message)
                except Exception as e:
                    print(f"Failed to send WS message: {e}")
        
        # Always broadcast to admin
        if channel != "admin" and "admin" in self.active_connections:
            for connection in self.active_connections["admin"]:
                try:
                    await connection.send_json(message)
                except Exception:
                    pass

manager = ConnectionManager()
