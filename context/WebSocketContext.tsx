'use client';

import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { toast } from 'react-hot-toast';

interface WebSocketContextType {
    isConnected: boolean;
    lastMessage: any | null;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
    const { user, isLoggedIn } = useAuth();
    const [isConnected, setIsConnected] = useState(false);
    const [lastMessage, setLastMessage] = useState<any | null>(null);
    const wsRef = useRef<WebSocket | null>(null);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

    const connect = useCallback(() => {
        const token = localStorage.getItem('auth_token');
        if (!token || !isLoggedIn) return;

        // Determine WebSocket URL (dev vs prod)
        // Adjust this if you have a specific env var for WS URL
        const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        // For development, we often use localhost:8000 or similar. 
        // But the previous SkyPDV analysis showed "wss://api.skyvenda.com".
        // Use the same host as the API or a fixed one. 
        // Given SkyPDV uses "wss://api.skyvenda.com", we should probably use that or infer from current API config if possible.
        // However, generic "api.skyvenda.com" is safe if that's the production endpoint. 
        // For local dev, it might be different. 
        // Let's stick to the SkyPDV pattern of hardcoding or using a config.

        // Wait, SkyPDV had: const wsRoot = "wss://api.skyvenda.com";
        // I should probably check if there is an env var, but for now I'll use the same logic or make it dynamic if current host is localhost.

        let wsUrl = 'wss://api.skyvenda.com/ws';
        if (window.location.hostname === 'localhost') {
            wsUrl = 'ws://localhost:8000/ws';
        }

        const url = `${wsUrl}?token=${token}&app_type=FastFood`;

        console.log('Connecting to FastFood WebSocket...', url);
        const ws = new WebSocket(url);
        wsRef.current = ws;

        ws.onopen = () => {
            console.log('FastFood WebSocket connected');
            setIsConnected(true);
        };

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                console.log('WS Message:', data);
                setLastMessage(data);

                // Dispatch global event for flexibility
                window.dispatchEvent(new CustomEvent('fastfood-ws-message', { detail: data }));

                // Handle specific notification types
                if (data.type === 'notification' || data.type === 'notification_new') {
                    const notifData = data.data || {};
                    const notificationType = notifData.notification_type || notifData.type || data.tipo || '';
                    const referenceType = notifData.reference_type || '';
                    
                    // Check if it's an order-related notification
                    const isOrderNotification = 
                        notificationType.startsWith('order_') || 
                        referenceType === 'FastFoodOrder' ||
                        notifData.reference_type === 'FastFoodOrder';

                    if (isOrderNotification) {
                        const msg = notifData.message || data.message || '';
                        const orderId = notifData.reference_id || data.order_id || notifData.order_id;
                        
                        // Show toast notification
                        if (msg) {
                            toast(msg, {
                                icon: '🔔',
                                style: { borderRadius: '24px', background: '#333', color: '#fff' }
                            });
                        }

                        // Dispatch order update event with enriched data
                        window.dispatchEvent(new CustomEvent('fastfood-order-update', { 
                            detail: {
                                ...data,
                                order_id: orderId,
                                notification_type: notificationType,
                                reference_type: referenceType
                            }
                        }));

                        // Dispatch specific event for new orders
                        if (notificationType === 'order_created' || notificationType === 'order_new') {
                            window.dispatchEvent(new CustomEvent('fastfood-new-order', { 
                                detail: {
                                    ...data,
                                    order_id: orderId,
                                    notification_type: notificationType
                                }
                            }));
                        }

                        // Dispatch specific events for status updates
                        if (notificationType.includes('order_accepted') || notificationType === 'order_preparing') {
                            window.dispatchEvent(new CustomEvent('fastfood-order-status-update', { 
                                detail: {
                                    ...data,
                                    order_id: orderId,
                                    new_status: 'preparing',
                                    notification_type: notificationType
                                }
                            }));
                        } else if (notificationType.includes('order_ready')) {
                            window.dispatchEvent(new CustomEvent('fastfood-order-status-update', { 
                                detail: {
                                    ...data,
                                    order_id: orderId,
                                    new_status: 'ready',
                                    notification_type: notificationType
                                }
                            }));
                        } else if (notificationType.includes('order_delivering')) {
                            window.dispatchEvent(new CustomEvent('fastfood-order-status-update', { 
                                detail: {
                                    ...data,
                                    order_id: orderId,
                                    new_status: 'delivering',
                                    notification_type: notificationType
                                }
                            }));
                        } else if (notificationType.includes('order_completed')) {
                            window.dispatchEvent(new CustomEvent('fastfood-order-status-update', { 
                                detail: {
                                    ...data,
                                    order_id: orderId,
                                    new_status: 'completed',
                                    notification_type: notificationType
                                }
                            }));
                        }
                    }
                }

                // Also handle generic new-notification event for compatibility
                window.dispatchEvent(new CustomEvent('new-notification', { detail: data }));
            } catch (e) {
                console.error('Error parsing WS message:', e);
            }
        };

        ws.onclose = (event) => {
            console.log('FastFood WebSocket disconnected', event.code, event.reason);
            setIsConnected(false);
            if (isLoggedIn && event.code !== 1000) {
                reconnectTimeoutRef.current = setTimeout(connect, 3000);
            }
        };

        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
            ws.close();
        };

    }, [isLoggedIn]);

    useEffect(() => {
        if (isLoggedIn) {
            connect();
        } else {
            if (wsRef.current) {
                wsRef.current.close();
                wsRef.current = null;
            }
        }

        return () => {
            if (wsRef.current) {
                wsRef.current.close();
            }
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
        };
    }, [isLoggedIn, connect]);

    return (
        <WebSocketContext.Provider value={{ isConnected, lastMessage }}>
            {children}
        </WebSocketContext.Provider>
    );
}

export function useWebSocket() {
    const context = useContext(WebSocketContext);
    if (context === undefined) {
        throw new Error('useWebSocket must be used within a WebSocketProvider');
    }
    return context;
}
