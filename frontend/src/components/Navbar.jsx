import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  Search,
  UserCircle,
  Check,
  Trash2,
  CheckCheck,
  Wifi,
  WifiOff,
} from "lucide-react";

import api from "../api";

function Navbar({ user }) {
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);

  const notificationRef = useRef(null);
  const socketRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const shouldReconnectRef = useRef(true);

  // ==========================================
  // Load existing notifications
  // ==========================================

  const fetchNotifications = async () => {
    try {
      const response = await api.get("/notifications/");

      setNotifications(response.data);
    } catch (error) {
      console.error("Failed to load notifications:", error);
    }
  };

  // ==========================================
  // WebSocket connection
  // ==========================================

  const connectWebSocket = () => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      return;
    }

    // Already connected or connecting
    if (
      socketRef.current &&
      (socketRef.current.readyState === WebSocket.OPEN ||
        socketRef.current.readyState === WebSocket.CONNECTING)
    ) {
      return;
    }

    const ws = new WebSocket(
      `ws://127.0.0.1:8000/ws/notifications/?token=${token}`,
    );

    socketRef.current = ws;

    ws.onopen = () => {
      console.log("WebSocket connected");

      setWsConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const notification = JSON.parse(event.data);

        setNotifications((previous) => [notification, ...previous]);

        if ("Notification" in window && Notification.permission === "granted") {
          new Notification(notification.title, {
            body: notification.message,
          });
        }
      } catch (error) {
        console.error("Invalid WebSocket notification:", error);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);

      setWsConnected(false);
    };

    ws.onclose = () => {
      console.log("WebSocket disconnected");

      // Ignore old/stale socket
      if (socketRef.current !== ws) {
        return;
      }

      socketRef.current = null;

      setWsConnected(false);

      if (!shouldReconnectRef.current) {
        return;
      }

      reconnectTimeoutRef.current = setTimeout(() => {
        connectWebSocket();
      }, 5000);
    };
  };
  // ==========================================
  // Initialize notifications + WebSocket
  // ==========================================

  useEffect(() => {
    fetchNotifications();

    connectWebSocket();

    // Ask browser notification permission
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }

    return () => {
      shouldReconnectRef.current = false;

      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }

      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, []);

  // ==========================================
  // Close dropdown when clicking outside
  // ==========================================

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // ==========================================
  // Mark notification as read
  // ==========================================

  const markAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read/`);

      setNotifications((previous) =>
        previous.map((notification) =>
          notification.id === id
            ? {
                ...notification,
                is_read: true,
              }
            : notification,
        ),
      );
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  // ==========================================
  // Delete notification
  // ==========================================

  const deleteNotification = async (id) => {
    try {
      await api.delete(`/notifications/${id}/`);

      setNotifications((previous) =>
        previous.filter((notification) => notification.id !== id),
      );
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  };

  // ==========================================
  // Mark all as read
  // ==========================================

  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(
        (notification) => !notification.is_read,
      );

      await Promise.all(
        unreadNotifications.map((notification) =>
          api.patch(`/notifications/${notification.id}/read/`),
        ),
      );

      setNotifications((previous) =>
        previous.map((notification) => ({
          ...notification,
          is_read: true,
        })),
      );
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  };

  const unreadCount = notifications.filter(
    (notification) => !notification.is_read,
  ).length;

  // ==========================================
  // Global Search
  // ==========================================

  const handleSearch = async (value) => {
    setSearchQuery(value);

    if (!value.trim()) {
      setSearchResults(null);
      return;
    }

    try {
      setSearchLoading(true);

      const response = await api.get(`/search/?q=${encodeURIComponent(value)}`);

      setSearchResults(response.data);
    } catch (error) {
      console.error("Global search error:", error);

      setSearchResults(null);
    } finally {
      setSearchLoading(false);
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6">
      {/* ================================
                Search
            ================================= */}

      <div className="relative w-96">
        <div className="flex items-center gap-3">
          <Search size={19} className="text-slate-400" />

          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search products, customers..."
            className="w-full outline-none text-sm text-slate-700 placeholder:text-slate-400"
          />

          {searchLoading && (
            <span className="text-xs text-slate-400">Searching...</span>
          )}
        </div>

        {/* Search Results */}

        {searchResults && searchQuery.trim() && (
          <div className="absolute top-10 left-0 w-full bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden">
            {/* Products */}

            {searchResults.products?.length > 0 && (
              <div>
                <div className="px-4 py-2 bg-slate-50 text-xs font-semibold text-slate-500 uppercase">
                  Products
                </div>

                {searchResults.products.map((product) => (
                  <div
                    key={`product-${product.id}`}
                    onClick={() => {
                      navigate("/products");
                      setSearchQuery("");
                      setSearchResults(null);
                    }}
                    className="px-4 py-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100"
                  >
                    <p className="text-sm font-medium text-slate-800">
                      {product.name}
                    </p>

                    <p className="text-xs text-slate-400 mt-1">
                      {product.product_code}
                      {" • "}
                      Stock: {product.current_stock}
                      {" • "}₹{product.mrp}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Customers */}

            {searchResults.customers?.length > 0 && (
              <div>
                <div className="px-4 py-2 bg-slate-50 text-xs font-semibold text-slate-500 uppercase">
                  Customers
                </div>

                {searchResults.customers.map((customer) => (
                  <div
                    key={`customer-${customer.id}`}
                    onClick={() => {
                      navigate("/customers");
                      setSearchQuery("");
                      setSearchResults(null);
                    }}
                    className="px-4 py-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100"
                  >
                    <p className="text-sm font-medium text-slate-800">
                      {customer.name}
                    </p>

                    <p className="text-xs text-slate-400 mt-1">
                      {customer.phone}

                      {customer.city && ` • ${customer.city}`}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Purchases */}

            {searchResults.purchases?.length > 0 && (
              <div>
                <div className="px-4 py-2 bg-slate-50 text-xs font-semibold text-slate-500 uppercase">
                  Purchases
                </div>

                {searchResults.purchases.map((purchase) => (
                  <div
                    key={`purchase-${purchase.id}`}
                    onClick={() => {
                      navigate("/purchases");
                      setSearchQuery("");
                      setSearchResults(null);
                    }}
                    className="px-4 py-3 hover:bg-slate-50 cursor-pointer"
                  >
                    <p className="text-sm font-medium text-slate-800">
                      {purchase.product__name}
                    </p>

                    <p className="text-xs text-slate-400 mt-1">
                      {purchase.customer__name}
                      {" • "}
                      Qty: {purchase.quantity}
                      {" • "}₹{purchase.total_amount}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* No Results */}

            {searchResults.products?.length === 0 &&
              searchResults.customers?.length === 0 &&
              searchResults.purchases?.length === 0 && (
                <div className="px-4 py-8 text-center">
                  <Search size={24} className="mx-auto text-slate-300 mb-2" />

                  <p className="text-sm text-slate-500">No results found</p>

                  <p className="text-xs text-slate-400 mt-1">
                    Try another search term.
                  </p>
                </div>
              )}
          </div>
        )}
      </div>

      {/* ================================
                Right Side
            ================================= */}

      <div className="flex items-center gap-5">
        {/* =================================
                    Notification
                ================================= */}

        <div className="relative" ref={notificationRef}>
          <button
            onClick={() => setShowNotifications((previous) => !previous)}
            className="relative p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
            title="Notifications"
          >
            <Bell size={20} />

            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-4.5 h-4.5 px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>

          {/* Notification Dropdown */}

          {showNotifications && (
            <div className="absolute right-0 top-12 w-95 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden">
              {/* Header */}

              <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-slate-800">
                    Notifications
                  </h3>

                  <p className="text-xs text-slate-400 mt-0.5">
                    {unreadCount} unread
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`flex items-center gap-1 text-[11px] ${
                      wsConnected ? "text-emerald-600" : "text-slate-400"
                    }`}
                  >
                    {wsConnected ? (
                      <>
                        <Wifi size={13} />
                        Live
                      </>
                    ) : (
                      <>
                        <WifiOff size={13} />
                        Offline
                      </>
                    )}
                  </span>

                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                    >
                      <CheckCheck size={14} />
                      Mark all
                    </button>
                  )}
                </div>
              </div>

              {/* Notification List */}

              <div className="max-h-105 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="py-12 text-center">
                    <Bell size={28} className="mx-auto text-slate-300 mb-2" />

                    <p className="text-sm text-slate-500">No notifications</p>

                    <p className="text-xs text-slate-400 mt-1">
                      You're all caught up.
                    </p>
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`px-4 py-3 border-b border-slate-100 hover:bg-slate-50 transition ${
                        !notification.is_read ? "bg-blue-50/40" : ""
                      }`}
                    >
                      <div className="flex gap-3">
                        {/* Status */}

                        <div
                          className={`mt-1 w-2 h-2 rounded-full shrink-0 ${
                            notification.is_read
                              ? "bg-slate-300"
                              : "bg-blue-500"
                          }`}
                        />

                        {/* Content */}

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="text-sm font-semibold text-slate-800">
                              {notification.title}
                            </h4>

                            {!notification.is_read && (
                              <span className="text-[10px] text-blue-600 font-medium">
                                NEW
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                            {notification.message}
                          </p>

                          <div className="flex items-center justify-between mt-2">
                            <span className="text-[10px] text-slate-400">
                              {new Date(
                                notification.created_at,
                              ).toLocaleString()}
                            </span>

                            <div className="flex items-center gap-1">
                              {!notification.is_read && (
                                <button
                                  onClick={() => markAsRead(notification.id)}
                                  className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                                  title="Mark as read"
                                >
                                  <Check size={14} />
                                </button>
                              )}

                              <button
                                onClick={() =>
                                  deleteNotification(notification.id)
                                }
                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                                title="Delete notification"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* =================================
                    User
                ================================= */}

        <div className="flex items-center gap-3 border-l border-slate-200 pl-5">
          <UserCircle size={34} className="text-slate-500" />

          <div>
            <p className="text-sm font-semibold text-slate-800">
              {user?.username || "Admin"}
            </p>

            <p className="text-xs text-slate-400">Administrator</p>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
