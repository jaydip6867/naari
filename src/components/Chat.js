import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar.js';
import '../styles.css';
import { storage } from '../utils/storage';
import { chatAPI } from '../services/api';
import { FiSend, FiMoreVertical, FiSearch, FiPaperclip } from 'react-icons/fi';
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
  const [searchQuery, setSearchQuery] = useState('');
  const [showHeaderMenu, setShowHeaderMenu] = useState(false);
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
      setError(err.message || 'Failed to fetch chats');
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
      setError(err.message || 'Failed to fetch messages');
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
      setError(err.message || 'Failed to send message');
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
      setError(err.message || 'Failed to remove user from group');
    } finally {
      setLoading(false);
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

  // const getAvatarColor = (name) => {
  //   const colors = ['#00a884', '#25D366', '#128C7E', '#075E54', '#34B7F1', '#53Bdeb', '#A367FF', '#FF6B6B'];
  //   if (!name) return colors[0];
  //   const index = name.charCodeAt(0) % colors.length;
  //   return colors[index];
  // };

  const getCurrentUserId = () => {
    const user = storage.getUser();
    return user?._id || user?.id || null;
  };

  const normalizeMessages = (data) => {
    if (Array.isArray(data)) return data;
    if (!data) return [];
    if (Array.isArray(data.messages)) return data.messages;
    if (data._id && data.message) return [data];
    return [];
  };

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
        {/* <div className="page-header">
          <h1 className="page-title">Chat</h1>
        </div> */}

        <div className="chat-wrapper">
          {/* Left Sidebar - Chat List */}
          <div className="chat-sidebar">
            {/* <div className="chat-sidebar-header">
              <div className="chat-search">
                <FiSearch className="search-icon" />
                <input
                  type="text"
                  placeholder="Search or start new chat"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="chat-search-input"
                />
              </div>
            </div> */}

            <div className="chat-list">
              {loading && chats.length === 0 ? (
                <div className="chat-loading">Loading chats...</div>
              ) : error ? (
                <div className="chat-error">{error}</div>
              ) : chats.length === 0 ? (
                <div className="chat-empty">No chats found</div>
              ) : (
                chats.map((chat) => (
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
                  <div className="chat-header-actions" onClick={handleHeaderMenuToggle} style={{ position: 'relative', cursor: 'pointer' }}>
                    <FiMoreVertical className="chat-more-icon" />
                    {showHeaderMenu && (
                      <div className="chat-header-dropdown" onMouseLeave={closeHeaderMenu}>
                        <button type="button" className="add-btn chat-header-dropdown-item" onClick={removeCurrentUserFromGroup}>
                          Leave Group
                        </button>
                      </div>
                    )}
                  </div>
                </div>

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
                    messages.map((message, index) => {
                      const currentUserId = getCurrentUserId();
                      const isOwn = message.isOwn || message.senderId === currentUserId;
                      return (
                        <div key={message._id || index} className={`message-wrapper ${isOwn ? 'own' : 'other'}`}>
                          <div className={`message-bubble ${isOwn ? 'own' : 'other'}`}>
                            {/* {!isOwn && message.senderName && ( */}
                              <span className="message-sender">{message.senderId.fullName}</span>
                            {/* )} */}
                            <p className="message-text">{formatText(message.message)}</p>
                            <span className="message-time">
                              {formatTime(message.createdAt || message.timestamp)}
                              {isOwn && message.read && <span className="message-read">✓✓</span>}
                            </span>
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
