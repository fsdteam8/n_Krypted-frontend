"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { io, type Socket } from "socket.io-client"
import { useSession } from "next-auth/react"

export interface Deal {
  _id: string
  title: string
  description: string
  participationsLimit: number
  price: number
  location?: string
  images?: string[]
  offers?: string[]
  status?: string
  category?:
    | string
    | {
        _id: string
        categoryName: string
        image: string
        createdAt: string
        updatedAt: string
      }
  time?: number
  createdAt?: string
  updatedAt?: string
  __v?: number
}

export interface Notification {
  _id: string
  message: string
  createdAt: string
  updatedAt: string
  userId: string
  isRead: boolean
  type: string
  dealId?: Deal | string
  auction?: {
    title: string
  }
}

interface SocketContextType {
  socket: Socket | null
  isConnected: boolean
  notifications: Notification[]
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>
  notificationCount: number
  setNotificationCount: React.Dispatch<React.SetStateAction<number>>
}

const SocketContext = createContext<SocketContextType | undefined>(undefined)

export const useSocketContext = () => {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error("useSocketContext must be used within a SocketProvider")
  }
  return context
}

interface SocketProviderProps {
  children: ReactNode
}

export const SocketProvider = ({ children }: SocketProviderProps) => {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [notificationCount, setNotificationCount] = useState(0)

  const session = useSession()
  const userId = session?.data?.user?.id

  // Load notification count from localStorage on initial render
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedCount = localStorage.getItem("notificationCount")
      if (savedCount) {
        setNotificationCount(Number.parseInt(savedCount, 10))
      }
    }
  }, [])

  // Update localStorage when notification count changes
  useEffect(() => {
    if (typeof window !== "undefined" && notificationCount > 0) {
      localStorage.setItem("notificationCount", notificationCount.toString())
    }
  }, [notificationCount])

  useEffect(() => {
    if (!userId) return

    console.log("Initializing socket connection...")

    // Initialize socket connection
    const socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL || "", {
      transports: ["websocket"],
      autoConnect: true,
    })

    setSocket(socketInstance)

    // Connection event handlers
    socketInstance.on("connect", () => {
      console.log("Connected to socket server:", socketInstance.id)
      setIsConnected(true)

      // Authenticate and join rooms
      socketInstance.emit("authenticate", userId)
      socketInstance.emit("join", "new_deals") // Join any specific rooms
    })

    // Handle pending notifications when user connects
    socketInstance.on("pending_notifications", (pendingNotifications: Notification[]) => {
      console.log("Received pending notifications:", pendingNotifications)

      if (pendingNotifications && pendingNotifications.length > 0) {
        setNotifications((prev) => {
          // Merge with existing notifications, avoiding duplicates
          const existingIds = new Set(prev.map((n) => n._id))
          const newNotifications = pendingNotifications.filter((n) => !existingIds.has(n._id))
          const merged = [...newNotifications, ...prev]

          // Update notification count based on unread notifications
          const unreadCount = merged.filter((n) => !n.isRead).length
          setNotificationCount(unreadCount)

          return merged
        })
      }
    })

    // Handle new deal notifications
    socketInstance.on("new_deal", (data: { message: string; deal: Deal }) => {
      console.log("Received new deal notification:", data)

      if (data && data.deal) {
        const newNotification: Notification = {
          _id: `temp_${Date.now()}`, // Temporary ID until we get the real one from server
          message: data.message,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          userId: userId,
          isRead: false,
          type: "new_deal",
          dealId: data.deal,
        }

        setNotifications((prev) => [newNotification, ...prev])
        setNotificationCount((prev) => prev + 1)

        // Show browser notification if permission is granted
        if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
          new Notification("New Deal Available!", {
            body: data.message,
            icon: "/favicon.ico",
          })
        }
      }
    })

    // Handle deal status change notifications - Updated to handle full deal object
    socketInstance.on("deal_status_change", (data: { message: string; deal: Deal; newStatus: string, id:string }) => {
      console.log("Received deal status change notification:", data)

      if (data && data.deal) {
        const newNotification: Notification = {
          _id: data.id, 
          message: data.message,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          userId: userId,
          isRead: false,
          type: "deal_status_change",
          dealId: data.deal, // Now storing the full deal object
        }

        setNotifications((prev) => [newNotification, ...prev])
        setNotificationCount((prev) => prev + 1)

        // Show browser notification if permission is granted
        if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
          new Notification("Deal Status Updated", {
            body: data.message,
            icon: "/favicon.ico",
          })
        }
      }
    })

    // Handle connection errors
    socketInstance.on("connect_error", (error) => {
      console.error("Socket connection error:", error)
      setIsConnected(false)
    })

    socketInstance.on("disconnect", () => {
      console.log("Disconnected from socket server")
      setIsConnected(false)
    })

    // Cleanup on unmount
    return () => {
      console.log("Cleaning up socket connection")
      socketInstance.disconnect()
      setSocket(null)
      setIsConnected(false)
    }
  }, [userId])

  // Request notification permission on mount
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "default") {
        Notification.requestPermission()
      }
    }
  }, [])

  const value: SocketContextType = {
    socket,
    isConnected,
    notifications,
    setNotifications,
    notificationCount,
    setNotificationCount,
  }

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
}
