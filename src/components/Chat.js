import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar.js';
import '../styles.css';
import { storage } from '../utils/storage';
import { chatAPI } from '../services/api';
import { FiSend, FiMoreVertical, FiSearch, FiPaperclip } from 'react-icons/fi';
import { format } from 'date-fns';

const Chat = ({ onLogout }) => {
  const navigate = useNavigate();
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
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
      const chatsData = await chatAPI.getChats(searchQuery);
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
      setMessages(messagesData || []);
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError(err.message || 'Failed to fetch messages');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedChat) return;

    try {
      setLoading(true);
      setError('');
      await chatAPI.sendMessage(selectedChat._id || selectedChat.groupId, newMessage);
      setNewMessage('');
      await fetchMessages(selectedChat._id || selectedChat.groupId);
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
    fetchMessages(chat._id || chat.groupId);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    fetchChats();
  }, [searchQuery]);

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

  const getAvatarColor = (name) => {
    const colors = ['#00a884', '#25D366', '#128C7E', '#075E54', '#34B7F1', '#53Bdeb', '#A367FF', '#FF6B6B'];
    if (!name) return colors[0];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <div className="settings-container">
      <Sidebar onLogout={handleLogout} />

      <div className="main-content chat-container">
        <div className="page-header">
          <h1 className="page-title">Chat</h1>
        </div>

        <div className="chat-wrapper">
          {/* Left Sidebar - Chat List */}
          <div className="chat-sidebar">
            <div className="chat-sidebar-header">
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
            </div>

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
                      style={{ backgroundColor: getAvatarColor(chat.name || chat.groupName) }}
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
                            {chat.lastMessage}
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
                    style={{ backgroundColor: getAvatarColor(selectedChat.name || selectedChat.groupName) }}
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
                  <div className="chat-header-actions">
                    <FiMoreVertical className="chat-more-icon" />
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
                      const isOwn = message.isOwn || message.senderId === storage.getAuthData()?.user?._id;
                      return (
                        <div key={message._id || index} className={`message-wrapper ${isOwn ? 'own' : 'other'}`}>
                          <div className={`message-bubble ${isOwn ? 'own' : 'other'}`}>
                            {!isOwn && message.senderName && (
                              <span className="message-sender">{message.senderName}</span>
                            )}
                            <p className="message-text">{message.message}</p>
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
                  <button className="chat-attach-btn">
                    <FiPaperclip size={20} />
                  </button>
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
                    <svg viewBox="0 0 303 172" width="303" height="172">
                      <path fill="#36C5F0" d="M229.565 160.229c-1.167.693-2.393 1.303-3.653 1.836-8.887 3.876-18.796 5.935-28.8 5.935-22.083 0-42.236-8.019-57.378-21.252-15.142-13.233-24.5-31.622-24.5-52.019 0-20.397 9.358-38.786 24.5-52.019 15.142-13.233 35.295-21.252 57.378-21.252 22.083 0 42.236 8.019 57.378 21.252 15.142 13.233 24.5 31.622 24.5 52.019 0 6.525-.876 12.905-2.563 19.053-1.687 6.148-4.187 11.965-7.437 17.329-3.25 5.364-7.25 10.274-11.875 14.583-4.625 4.309-9.875 8.016-15.625 11.031-5.75 3.015-12 5.334-18.625 6.857-6.625 1.523-13.625 2.25-20.875 2.25-7.25 0-14.25-.727-20.875-2.25-6.625-1.523-12.875-3.842-18.625-6.857-5.75-3.015-11-6.722-15.625-11.031-4.625-4.309-8.625-9.219-11.875-14.583-3.25-5.364-5.75-11.181-7.437-17.329-1.687-6.148-2.563-12.528-2.563-19.053 0-20.397 9.358-38.786 24.5-52.019 15.142-13.233 35.295-21.252 57.378-21.252 22.083 0 42.236 8.019 57.378 21.252 15.142 13.233 24.5 31.622 24.5 52.019 0 6.525-.876 12.905-2.563 19.053-1.687 6.148-4.187 11.965-7.437 17.329-3.25 5.364-7.25 10.274-11.875 14.583-4.625 4.309-9.875 8.016-15.625 11.031-5.75 3.015-12 5.334-18.625 6.857-6.625 1.523-13.625 2.25-20.875 2.25z"></path>
                      <path fill="#2AB0ED" d="M229.565 160.229c-1.167.693-2.393 1.303-3.653 1.836-8.887 3.876-18.796 5.935-28.8 5.935-22.083 0-42.236-8.019-57.378-21.252-15.142-13.233-24.5-31.622-24.5-52.019 0-20.397 9.358-38.786 24.5-52.019 15.142-13.233 35.295-21.252 57.378-21.252 22.083 0 42.236 8.019 57.378 21.252 15.142 13.233 24.5 31.622 24.5 52.019 0 6.525-.876 12.905-2.563 19.053-1.687 6.148-4.187 11.965-7.437 17.329-3.25 5.364-7.25 10.274-11.875 14.583-4.625 4.309-9.875 8.016-15.625 11.031-5.75 3.015-12 5.334-18.625 6.857-6.625 1.523-13.625 2.25-20.875 2.25-7.25 0-14.25-.727-20.875-2.25-6.625-1.523-12.875-3.842-18.625-6.857-5.75-3.015-11-6.722-15.625-11.031-4.625-4.309-8.625-9.219-11.875-14.583-3.25-5.364-5.75-11.181-7.437-17.329-1.687-6.148-2.563-12.528-2.563-19.053 0-20.397 9.358-38.786 24.5-52.019 15.142-13.233 35.295-21.252 57.378-21.252 22.083 0 42.236 8.019 57.378 21.252 15.142 13.233 24.5 31.622 24.5 52.019 0 6.525-.876 12.905-2.563 19.053-1.687 6.148-4.187 11.965-7.437 17.329-3.25 5.364-7.25 10.274-11.875 14.583-4.625 4.309-9.875 8.016-15.625 11.031-5.75 3.015-12 5.334-18.625 6.857-6.625 1.523-13.625 2.25-20.875 2.25z"></path>
                    </svg>
                  </div>
                  <h2>WhatsApp Web</h2>
                  <p>Send and receive messages without keeping your phone online.</p>
                  <p>Use WhatsApp on up to 4 linked devices and 1 phone at the same time.</p>
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
