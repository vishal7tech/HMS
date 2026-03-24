import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export interface WebSocketNotification {
  type: 'CREATED' | 'UPDATED' | 'CANCELLED' | 'COMPLETED';
  appointmentId: number;
  patientName: string;
  doctorName: string;
  slotTime: string;
  status: string;
  message: string;
}

class WebSocketService {
  private client: Client | null = null;
  private connected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 5000;
  private pendingSubscriptions: Array<() => void> = [];

  constructor() {
    this.connect();
  }

  connect(): void {
    if (this.client && this.connected) {
      return;
    }

    const socket = new SockJS('http://localhost:8080/ws');
    this.client = new Client({
      webSocketFactory: () => socket,
    });

    this.client.onConnect = () => {
      console.log('WebSocket connected');
      this.connected = true;
      this.reconnectAttempts = 0;
      if (this.pendingSubscriptions.length > 0) {
        this.pendingSubscriptions.forEach(fn => {
          try {
            fn();
          } catch (e) {
            console.error('Failed to run pending subscription', e);
          }
        });
        this.pendingSubscriptions = [];
      }
    };

    this.client.onDisconnect = () => {
      console.log('WebSocket disconnected');
      this.connected = false;
      this.attemptReconnect();
    };

    this.client.onStompError = (error) => {
      console.error('WebSocket error:', error);
      this.connected = false;
    };

    this.client.activate();
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

      setTimeout(() => {
        this.connect();
      }, this.reconnectDelay);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  subscribeToAppointments(callback: (notification: WebSocketNotification) => void): void {
    if (!this.client || !this.connected) {
      this.pendingSubscriptions.push(() => this.subscribeToAppointments(callback));
      return;
    }

    this.client.subscribe('/topic/appointments', (message) => {
      const notification: WebSocketNotification = JSON.parse(message.body);
      callback(notification);
    });
  }

  subscribeToUserNotifications(callback: (notification: WebSocketNotification) => void): void {
    if (!this.client || !this.connected) {
      this.pendingSubscriptions.push(() => this.subscribeToUserNotifications(callback));
      return;
    }

    this.client.subscribe('/user/queue/appointments', (message) => {
      const notification: WebSocketNotification = JSON.parse(message.body);
      callback(notification);
    });
  }

  subscribeToDoctorAvailability(doctorId: number, callback: (data: any) => void): void {
    if (!this.client || !this.connected) {
      this.pendingSubscriptions.push(() => this.subscribeToDoctorAvailability(doctorId, callback));
      return;
    }

    this.client.subscribe(`/topic/availability/${doctorId}`, (message) => {
      const data = JSON.parse(message.body);
      callback(data);
    });
  }

  subscribeToAvailability(callback: (data: any) => void): void {
    if (!this.client || !this.connected) {
      this.pendingSubscriptions.push(() => this.subscribeToAvailability(callback));
      return;
    }

    this.client.subscribe('/topic/availability', (message) => {
      const data = JSON.parse(message.body);
      callback(data);
    });
  }

  disconnect(): void {
    if (this.client) {
      this.client.deactivate();
      this.client = null;
      this.connected = false;
    }
  }

  isConnected(): boolean {
    return this.connected;
  }
}

export default new WebSocketService();
