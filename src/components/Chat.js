import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar.js';
import '../styles.css';
import { storage } from '../utils/storage';
import api, { chatAPI, staffAPI } from '../services/api';
import { io } from 'socket.io-client';
import { FiSend, FiMoreVertical, FiSearch, FiPaperclip, FiPlusSquare } from 'react-icons/fi';
import { format } from 'date-fns';
import { IoLogoWechat } from 'react-icons/io5';

const Chat = ({ onLogout }) => {
  const navigate = useNavigate();
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showHeaderMenu, setShowHeaderMenu] = useState(false);
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [staffList, setStaffList] = useState([]);
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [modalError, setModalError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [staffLoading, setStaffLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [socketStatus, setSocketStatus] = useState('disconnected');
  const [notification, setNotification] = useState('');
  const [activeRoom, setActiveRoom] = useState(null);
  const socketRef = useRef(null);
  const selectedChatRef = useRef(null);
  const messagesEndRef = useRef(null);

  const handleLogout = () => {
    storage.clearAuthData();
    onLogout();
    navigate('/');
  };

  const fetchChats = async () => {
    try {
      setLoading(true);
      setError('');
      const chatsData = await chatAPI.getChats();
      setChats(chatsData || []);
    } catch (err) {
      console.error('Error fetching chats:', err);
      setError(err.response.data.Message || 'Failed to fetch chats');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (groupId) => {
    try {
      setLoading(true);
      setError('');
      const messagesData = await chatAPI.getChatDetails(groupId);
      setMessages(normalizeMessages(messagesData));
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError(err.response.data.Message || 'Failed to fetch messages');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedChat) return;

    const chatId = selectedChat.groupId || selectedChat._id;
    if (!chatId) return;

    try {
      setLoading(true);
      setError('');
      await chatAPI.sendMessage(chatId, newMessage);
      setNewMessage('');
      await fetchMessages(chatId);
    } catch (err) {
      console.error('Error sending message:', err);
      setError(err.response.data.Message || 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const selectChat = (chat) => {
    setSelectedChat(chat);
    setShowHeaderMenu(false);
    fetchMessages(chat._id || chat.groupId);
    
    // Clear unread count from local state
    const groupId = chat._id || chat.groupId;
    setChats((prevChats) =>
      prevChats.map((c) =>
        c._id === groupId || c.groupId === groupId
          ? { ...c, unreadMessageCount: 0 }
          : c
      )
    );
  };

  const handleHeaderMenuToggle = () => {
    setShowHeaderMenu(prev => !prev);
  };

  const closeHeaderMenu = () => {
    setShowHeaderMenu(false);
  };

  const removeCurrentUserFromGroup = async () => {
    if (!selectedChat) return;
    const currentUserId = getCurrentUserId();
    if (!currentUserId) {
      setError('Unable to identify current user. Please login again.');
      return;
    }

    const groupId = selectedChat.groupId || selectedChat._id;
    if (!groupId) return;

    try {
      setLoading(true);
      setError('');
      await chatAPI.removeUserFromGroup(groupId, currentUserId);
      setSelectedChat(null);
      setMessages([]);
      setShowHeaderMenu(false);
      await fetchChats();
    } catch (err) {
      console.error('Error removing user from group:', err);
      setError(err.response.data.Message || 'Failed to remove user from group');
    } finally {
      setLoading(false);
    }
  };

  const openStaffModal = async () => {
    if (!selectedChat) {
      setError('Please select a chat first.');
      return;
    }

    setModalError('');
    setSuccessMessage('');
    setSelectedStaffId('');
    setIsStaffModalOpen(true);
    setStaffLoading(true);

    try {
      const staff = await staffAPI.getStaff();
      let staffListData = [];
      if (Array.isArray(staff)) {
        staffListData = staff;
      } else if (staff && Array.isArray(staff.data)) {
        staffListData = staff.data;
      } else if (staff && Array.isArray(staff.staffList)) {
        staffListData = staff.staffList;
      } else if (staff && typeof staff === 'object') {
        staffListData = Object.values(staff).find(Array.isArray) || [];
      }
      setStaffList(staffListData);
    } catch (err) {
      console.error('Error fetching staff list:', err);
      setModalError(err.response.data.Message || 'Failed to fetch staff list');
      setStaffList([]);
    } finally {
      setStaffLoading(false);
    }
  };

  const closeStaffModal = () => {
    setIsStaffModalOpen(false);
    setModalError('');
    setSelectedStaffId('');
  };

  const handleAddUserToGroup = async () => {
    if (!selectedStaffId) {
      setModalError('Please select a staff member.');
      return;
    }

    if (!selectedChat) {
      setModalError('No chat selected.');
      return;
    }

    const groupId = selectedChat.groupId || selectedChat._id;
    if (!groupId) {
      setModalError('Invalid group selected.');
      return;
    }

    try {
      setStaffLoading(true);
      setModalError('');
      await chatAPI.addUserToGroup(groupId, selectedStaffId);
      setSuccessMessage('User added successfully.');
      setIsStaffModalOpen(false);
      setSelectedStaffId('');
      setShowHeaderMenu(false);
      await fetchChats();
      await fetchMessages(groupId);
    } catch (err) {
      console.error('Error adding user to group:', err);
      setModalError(err.response.data.Message || 'Failed to add user to group');
    } finally {
      setStaffLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    fetchChats();
  }, []);

  useEffect(() => {
    if (selectedChat) {
      setShowHeaderMenu(false);
    }
  }, [selectedChat]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!successMessage) return;
    const timer = setTimeout(() => setSuccessMessage(''), 4000);
    return () => clearTimeout(timer);
  }, [successMessage]);

  const filteredChats = searchTerm.trim()
  ? chats.filter((chat) =>
      (chat.name || chat.groupName || '')
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    )
  : chats;

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return format(date, 'HH:mm');
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return format(date, 'HH:mm');
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return format(date, 'dd/MM/yyyy');
    }
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getCurrentUserId = () => {
    const user = storage.getUser();
    return user?._id || user?.id || null;
  };

  const getSocketUrl = () => api?.defaults?.baseURL || window.location.origin;

  const requestBrowserNotificationPermission = () => {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    if (Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }
  };

  const pushBrowserNotification = (title, body) => {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    if (Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body,
          icon: '/favicon.ico',
        });
      } catch (err) {
        console.warn('Browser notification error:', err);
      }
    }
  };

  const showNewMessageNotification = (title, body) => {
    setNotification(`${title}: ${body}`);
    pushBrowserNotification(title, body);
  };

  const normalizeMessages = (data) => {
    if (Array.isArray(data)) return data;
    if (!data) return [];
    if (Array.isArray(data.messages)) return data.messages;
    if (data._id && data.message) return [data];
    return [];
  };

  const normalizeIncomingMessage = (payload) => {
    const messages = normalizeMessages(payload);
    if (messages.length > 0) return messages[0];
    if (payload && typeof payload === 'object') return payload;
    return { message: payload };
  };

  const joinChatRoom = (roomId) => {
    if (!socketRef.current || !roomId) return;
    socketRef.current.emit('joinRoom', { roomId });
    socketRef.current.emit('joinChat', { roomId });
  };

  const leaveChatRoom = (roomId) => {
    if (!socketRef.current || !roomId) return;
    socketRef.current.emit('leaveRoom', { roomId });
  };

  const handleSocketMessage = (payload) => {
    const incomingMessage = normalizeIncomingMessage(payload);
    const roomId = payload?.groupId || payload?.chatId || incomingMessage.groupId || incomingMessage.chatId;
    const senderName = payload?.senderName || incomingMessage.senderName || incomingMessage.senderId?.fullName || 'New message';
    const content = formatText(incomingMessage.message || incomingMessage.text || '');
    const title = `New message from ${senderName}`;

    const currentSelectedChat = selectedChatRef.current;
    const isActiveChat = currentSelectedChat && (currentSelectedChat._id === roomId || currentSelectedChat.groupId === roomId);

    if (isActiveChat) {
      setMessages((prev) => [...prev, incomingMessage]);
    }

    setChats((prevChats) =>
      prevChats.map((chat) => {
        if (chat._id === roomId || chat.groupId === roomId) {
          const updatedChat = {
            ...chat,
            lastMessage: content,
            lastMessageTime: incomingMessage.createdAt || incomingMessage.timestamp || new Date().toISOString(),
          };
          // Only increment unread count for inactive chats
          // Never reset unread count (only selectChat should do that)
          if (!isActiveChat) {
            updatedChat.unreadMessageCount = (chat.unreadMessageCount || 0) + 1;
          }
          return updatedChat;
        }
        return chat;
      })
    );

    if (!isActiveChat) {
      showNewMessageNotification(title, content);
    }
  };

  useEffect(() => {
    selectedChatRef.current = selectedChat;
  }, [selectedChat]);

  useEffect(() => {
    requestBrowserNotificationPermission();

    const token = localStorage.getItem('naari_token');
    const userId = getCurrentUserId();
    if (!token || !userId) return;

    const socket = io(getSocketUrl(), {
      transports: ['websocket', 'polling'],
      auth: { token, userId },
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setSocketStatus('connected');
      // console.log(getSocketUrl());
    });

    socket.on('disconnect', (reason) => {
      setSocketStatus('disconnected');
      console.warn('Socket disconnected:', reason);
    });

    socket.on('connect_error', (error) => {
      setSocketStatus('error');
      console.error('Socket connect error:', error);
    });

    socket.on('message', handleSocketMessage);
    socket.on('newMessage', handleSocketMessage);
    socket.on('chatMessage', handleSocketMessage);
    socket.on('notify', handleSocketMessage);

    return () => {
      socket.off();
      socket.disconnect();
      socketRef.current = null;
      setSocketStatus('disconnected');
    };
  }, []);

  useEffect(() => {
    const roomId = selectedChat?.groupId || selectedChat?._id;
    if (!socketRef.current) return;

    if (!roomId) {
      if (activeRoom) {
        leaveChatRoom(activeRoom);
        setActiveRoom(null);
      }
      return;
    }

    if (activeRoom === roomId) return;
    if (activeRoom) {
      leaveChatRoom(activeRoom);
    }

    joinChatRoom(roomId);
    setActiveRoom(roomId);
  }, [selectedChat]);

  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => setNotification(''), 5000);
    return () => clearTimeout(timer);
  }, [notification]);

  const formatText = (value) => {
    if (value === null || value === undefined) return '';
    if (typeof value === 'string' || typeof value === 'number') return value;
    if (typeof value === 'object') {
      return value.message || value.text || JSON.stringify(value);
    }
    return String(value);
  };

  return (
    <div className="settings-container">
      <Sidebar onLogout={handleLogout} />

      <div className="main-content chat-container">

        <div className="chat-wrapper">
          {/* Left Sidebar - Chat List */}
          <div className="chat-sidebar">
            <div className="form-group chat_search">
              <input
                type='text'
                className='input-field'
                placeholder='find order Chats'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="chat-list">
              {loading && chats.length === 0 ? (
                <div className="chat-loading">Loading chats...</div>
              ) : error ? (
                <div className="chat-error">{error}</div>
              ) : filteredChats.length === 0 ? (
                <div className="chat-empty">No chats found</div>
              ) : (
                filteredChats.map((chat) => (
                  <div
                    key={chat._id || chat.groupId}
                    className={`chat-item ${selectedChat?._id === chat._id || selectedChat?.groupId === chat.groupId ? 'active' : ''}`}
                    onClick={() => selectChat(chat)}
                  >
                    <div
                      className="chat-avatar"
                    >
                      {chat.avatar ? (
                        <img src={chat.avatar} alt={chat.name || chat.groupName} />
                      ) : (
                        <span>{getInitials(chat.name || chat.groupName)}</span>
                      )}
                    </div>
                    <div className="chat-info">
                      <div className="chat-header">
                        <span className="chat-name">{chat.name || chat.groupName || 'Unknown'}</span>
                        {chat.lastMessageTime && (
                          <span className="chat-time">{formatDate(chat.lastMessageTime)}</span>
                        )}
                        {chat.unreadMessageCount > 0 && (
                          <span className="chat-unread">
                            {chat.unreadMessageCount}
                          </span>
                        )}
                      </div>
                      <div className="chat-preview">
                        {chat.lastMessage && (
                          <span className="chat-last-message">
                            {formatText(chat.lastMessage)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right Panel - Chat Messages */}
          <div className="chat-main">
            {notification && (
              <div className="chat-notification-banner">{notification}</div>
            )}
            {selectedChat ? (
              <>
                {/* Chat Header */}
                <div className="chat-main-header">
                  <div
                    className="chat-avatar"
                  >
                    {selectedChat.avatar ? (
                      <img src={selectedChat.avatar} alt={selectedChat.name || selectedChat.groupName} />
                    ) : (
                      <span>{getInitials(selectedChat.name || selectedChat.groupName)}</span>
                    )}
                  </div>
                  <div className="chat-header-info">
                    <span className="chat-name">{selectedChat.name || selectedChat.groupName || 'Unknown'}</span>
                    {selectedChat.participants && (
                      <span className="chat-participants">{selectedChat.participants.length} participants</span>
                    )}
                  </div>

                  <div className="chat-header-actions" style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      type="button"
                      className="add-btn"
                      style={{ padding: '8px', minWidth: 'auto' }}
                      onClick={openStaffModal}
                    >
                      <FiPlusSquare />
                    </button>
                    <div style={{ position: 'relative', cursor: 'pointer' }}>
                      <FiMoreVertical className="chat-more-icon" onClick={handleHeaderMenuToggle} />
                      {showHeaderMenu && (
                        <div className="chat-header-dropdown" onMouseLeave={closeHeaderMenu}>
                          <button type="button" className="add-btn chat-header-dropdown-item" onClick={removeCurrentUserFromGroup}>
                            Leave Group
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {isStaffModalOpen && (
                  <div className="modal-overlay" onClick={closeStaffModal}>
                    <div className="modal small" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '460px', width: '95%' }}>
                      <div className="modal-header">
                        <h3 className="modal-title">Add Staff to Group</h3>
                      </div>
                      <div className="modal-body">
                        {modalError && <div className="modal-error">{modalError}</div>}
                        <div className="form-group">
                          <label htmlFor="staff-select" className="form-label">Select staff member</label>
                          <select
                            id="staff-select"
                            className="input-field"
                            value={selectedStaffId}
                            onChange={(e) => setSelectedStaffId(e.target.value)}
                            disabled={staffLoading}
                          >
                            <option value="">Choose a staff member</option>
                            {staffList && staffList.length > 0 ? (
                              staffList.map((staff) => (
                                <option key={staff._id || staff.id} value={staff._id || staff.id}>
                                  {staff.fullName || staff.name || staff.userName || staff.email || 'Staff Member'}
                                </option>
                              ))
                            ) : (
                              <option value="" disabled>{staffLoading ? 'Loading staff...' : 'No staff members found'}</option>
                            )}
                          </select>
                        </div>
                      </div>
                      <div className="modal-footer" style={{ justifyContent: 'flex-end', gap: '10px' }}>
                        <button type="button" className="btn btn-cancel" onClick={closeStaffModal} disabled={staffLoading}>
                          Cancel
                        </button>
                        <button type="button" className="add-btn" onClick={handleAddUserToGroup} disabled={!selectedStaffId || staffLoading}>
                          {staffLoading ? 'Submitting...' : 'Submit'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {successMessage && (
                  <div className="chat-success" style={{ color: 'var(--success-color)', margin: '10px 0' }}>
                    {successMessage}
                  </div>
                )}

                {/* Messages Area */}
                <div className="chat-messages">
                  {loading && messages.length === 0 ? (
                    <div className="chat-loading">Loading messages...</div>
                  ) : error ? (
                    <div className="chat-error">{error}</div>
                  ) : messages.length === 0 ? (
                    <div className="chat-empty-messages">
                      <p>No messages yet. Start the conversation!</p>
                    </div>
                  ) : (
                    // messages.map((message, index) => {
                    //   const currentUserId = getCurrentUserId();
                    //   const isOwn = message.isOwn || message.senderId === currentUserId;
                    //   return (
                    //     <div key={message._id || index} className={`message-wrapper ${isOwn ? 'own' : 'other'}`}>
                    //       <div className={`message-bubble ${isOwn ? 'own' : 'other'}`}>
                    //         {/* {!isOwn && message.senderName && ( */}
                    //           <span className="message-sender">{message.senderId.fullName}</span>
                    //         {/* )} */}
                    //         <p className="message-text">{formatText(message.message)}</p>
                    //         <span className="message-time">
                    //           {formatTime(message.createdAt || message.timestamp)}
                    //           {isOwn && message.read && <span className="message-read">✓✓</span>}
                    //         </span>
                    //       </div>
                    //     </div>
                    //   );
                    // })
                    messages.map((message, index) => {
                      const currentUserId = getCurrentUserId();
                      const isOwn =
                        message.isOwn || message.senderId === currentUserId;

                      // Previous message
                      const prevMessage = messages[index - 1];

                      // Same sender check
                      const isSameSender =
                        prevMessage &&
                        prevMessage.senderId?._id === message.senderId?._id;

                      return (
                        <div key={index}>
                          <div
                            key={message._id || index}
                            className="message-wrapper">

                            {/* First Letter Circle */}
                            {!isOwn && (
                              <div className="avatar-wrapper">
                                {!isSameSender ? (
                                  <div className="avatar-circle">
                                    {message.senderId?.fullName?.charAt(0).toUpperCase()}
                                  </div>
                                ) : (
                                  <div className="avatar-space"></div>
                                )}
                              </div>
                            )}

                            <div className="message-content">

                              {/* Name show only first msg */}
                              {!isOwn && !isSameSender && (
                                <span className="message-sender">
                                  {message.senderId.fullName}
                                </span>
                              )}

                              <div
                                className={`message-bubble ${isOwn ? "own" : "other"}`}
                              >
                                <p className="message-text">
                                  {formatText(message.message)}
                                </p>

                                <span className="message-time">
                                  {formatTime(
                                    message.createdAt || message.timestamp
                                  )}

                                  {isOwn && message.read && (
                                    <span className="message-read">
                                      ✓✓
                                    </span>
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="chat-input-area">
                  {/* <button className="chat-attach-btn">
                    <FiPaperclip size={20} />
                  </button> */}
                  <input
                    type="text"
                    placeholder="Type a message"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="chat-message-input"
                    disabled={loading}
                  />
                  <button
                    className="chat-send-btn"
                    onClick={sendMessage}
                    disabled={!newMessage.trim() || loading}
                  >
                    <FiSend size={20} />
                  </button>
                </div>
              </>
            ) : (
              <div className="chat-placeholder">
                <div className="chat-placeholder-content">
                  <div className="chat-placeholder-icon">
                    <IoLogoWechat />
                  </div>
                  <h2>NaariArt Chat</h2>
                  <p>Send and receive messages without keeping your phone online.</p>
                  {/* <p>Use WhatsApp on up to 4 linked devices and 1 phone at the same time.</p> */}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
