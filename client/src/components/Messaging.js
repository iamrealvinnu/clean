import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Chip,
  IconButton,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  Fade,
  Badge,
  FormControl,
  InputLabel,
  Select
} from '@mui/material';
import {
  Send as SendIcon,
  Message as MessageIcon,
  Notifications as NotificationsIcon,
  Close as CloseIcon,
  Person as PersonIcon,
  AdminPanelSettings as AdminIcon,
  DirectionsCar as DriverIcon,
  Home as ResidentIcon
} from '@mui/icons-material';
import { communicationAPI } from '../api';

export default function Messaging({ user, isOpen, onClose }) {
  const [messages, setMessages] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedRecipient, setSelectedRecipient] = useState('');
  const [recipients, setRecipients] = useState([]);
  const [activeTab, setActiveTab] = useState('messages');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      fetchData();
      // Set up real-time updates every 10 seconds
      const interval = setInterval(fetchData, 10000);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchData = async () => {
    try {
      const [messagesRes, notificationsRes] = await Promise.all([
        communicationAPI.getMessages(user.id),
        communicationAPI.getNotifications(user.id)
      ]);
      setMessages(messagesRes);
      setNotifications(notificationsRes);
      
      // Get available recipients based on user role
      const availableRecipients = getAvailableRecipients();
      setRecipients(availableRecipients);
    } catch (err) {
      console.error('Failed to fetch communication data:', err);
    }
  };

  const getAvailableRecipients = () => {
    const allUsers = [
      { id: 1, name: 'Nitesh Kumar', role: 'resident', email: 'nitesh@example.com' },
      { id: 2, name: 'Asha Patel', role: 'resident', email: 'asha@example.com' },
      { id: 3, name: 'Ravi Singh', role: 'driver', email: 'ravi@example.com' },
      { id: 4, name: 'Admin User', role: 'admin', email: 'admin@example.com' }
    ];

    // Filter out current user and show relevant recipients based on role
    return allUsers.filter(u => u.id !== user.id);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedRecipient) return;

    try {
      const messageData = {
        from: { id: user.id, name: user.name, role: user.role },
        to: { id: selectedRecipient, name: recipients.find(r => r.id === selectedRecipient)?.name, role: recipients.find(r => r.id === selectedRecipient)?.role },
        content: newMessage.trim(),
        type: 'message'
      };

      await communicationAPI.sendMessage(messageData);
      setNewMessage('');
      setSelectedRecipient('');
      fetchData(); // Refresh messages
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin': return <AdminIcon />;
      case 'driver': return <DriverIcon />;
      case 'resident': return <ResidentIcon />;
      default: return <PersonIcon />;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'error';
      case 'driver': return 'warning';
      case 'resident': return 'success';
      default: return 'default';
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const unreadCount = messages.filter(m => !m.read && m.to.id === user.id).length;
  const notificationCount = notifications.filter(n => !n.read).length;

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          height: '80vh',
          display: 'flex',
          flexDirection: 'column'
        }
      }}
    >
      <DialogTitle sx={{ 
        bgcolor: 'primary.main', 
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Box display="flex" alignItems="center" gap={2}>
          <MessageIcon />
          <Typography variant="h6" fontWeight={600}>
            Communication Center
          </Typography>
          <Chip 
            icon={getRoleIcon(user.role)}
            label={user.role.charAt(0).toUpperCase() + user.role.slice(1)}
            color={getRoleColor(user.role)}
            size="small"
            sx={{ color: 'white', borderColor: 'white' }}
          />
        </Box>
        <IconButton onClick={onClose} sx={{ color: 'white' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ flexGrow: 1, p: 0 }}>
        <Box sx={{ display: 'flex', height: '100%' }}>
          {/* Tabs */}
          <Box sx={{ width: 200, borderRight: 1, borderColor: 'divider' }}>
            <List sx={{ p: 0 }}>
              <ListItem 
                button 
                selected={activeTab === 'messages'}
                onClick={() => setActiveTab('messages')}
              >
                <ListItemAvatar>
                  <Badge badgeContent={unreadCount} color="error">
                    <MessageIcon />
                  </Badge>
                </ListItemAvatar>
                <ListItemText primary="Messages" />
              </ListItem>
              <ListItem 
                button 
                selected={activeTab === 'notifications'}
                onClick={() => setActiveTab('notifications')}
              >
                <ListItemAvatar>
                  <Badge badgeContent={notificationCount} color="error">
                    <NotificationsIcon />
                  </Badge>
                </ListItemAvatar>
                <ListItemText primary="Notifications" />
              </ListItem>
            </List>
          </Box>

          {/* Content */}
          <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
            {activeTab === 'messages' ? (
              <>
                {/* Messages List */}
                <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
                  {messages.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <MessageIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                      <Typography variant="h6" color="text.secondary">
                        No messages yet
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Start a conversation with other users
                      </Typography>
                    </Box>
                  ) : (
                    <List>
                      {messages.map((message, index) => (
                        <Fade in={true} timeout={300 + index * 100} key={message.id}>
                          <ListItem sx={{ 
                            mb: 2, 
                            flexDirection: 'column',
                            alignItems: message.from.id === user.id ? 'flex-end' : 'flex-start'
                          }}>
                            <Paper sx={{
                              p: 2,
                              maxWidth: '70%',
                              bgcolor: message.from.id === user.id ? 'primary.main' : 'grey.100',
                              color: message.from.id === user.id ? 'white' : 'text.primary',
                              borderRadius: 2,
                              position: 'relative'
                            }}>
                              <Box display="flex" alignItems="center" gap={1} mb={1}>
                                <Avatar sx={{ width: 24, height: 24, bgcolor: message.from.id === user.id ? 'white' : 'primary.main' }}>
                                  {getRoleIcon(message.from.role)}
                                </Avatar>
                                <Typography variant="caption" fontWeight={600}>
                                  {message.from.name}
                                </Typography>
                                <Chip 
                                  label={message.from.role} 
                                  size="small" 
                                  color={getRoleColor(message.from.role)}
                                  sx={{ 
                                    color: message.from.id === user.id ? 'white' : 'inherit',
                                    borderColor: message.from.id === user.id ? 'white' : 'inherit'
                                  }}
                                />
                              </Box>
                              <Typography variant="body2" sx={{ mb: 1 }}>
                                {message.content}
                              </Typography>
                              <Typography variant="caption" sx={{ opacity: 0.7 }}>
                                {formatTime(message.timestamp)}
                                {!message.read && message.to.id === user.id && ' • Unread'}
                              </Typography>
                            </Paper>
                          </ListItem>
                        </Fade>
                      ))}
                      <div ref={messagesEndRef} />
                    </List>
                  )}
                </Box>

                {/* Send Message */}
                <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
                  <Box display="flex" gap={1} mb={2}>
                    <FormControl size="small" sx={{ minWidth: 200 }}>
                      <InputLabel>Send to</InputLabel>
                      <Select
                        value={selectedRecipient}
                        onChange={(e) => setSelectedRecipient(e.target.value)}
                        label="Send to"
                      >
                        {recipients.map((recipient) => (
                          <MenuItem key={recipient.id} value={recipient.id}>
                            <Box display="flex" alignItems="center" gap={1}>
                              {getRoleIcon(recipient.role)}
                              {recipient.name} ({recipient.role})
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                  <Box display="flex" gap={1}>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      multiline
                      maxRows={3}
                    />
                    <Button
                      variant="contained"
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim() || !selectedRecipient}
                      sx={{ minWidth: 'auto', px: 2 }}
                    >
                      <SendIcon />
                    </Button>
                  </Box>
                </Box>
              </>
            ) : (
              /* Notifications */
              <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
                {notifications.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <NotificationsIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">
                      No notifications
                    </Typography>
                  </Box>
                ) : (
                  <List>
                    {notifications.map((notification, index) => (
                      <Fade in={true} timeout={300 + index * 100} key={notification.id}>
                        <ListItem sx={{ mb: 2 }}>
                          <Paper sx={{
                            p: 2,
                            width: '100%',
                            bgcolor: notification.read ? 'grey.50' : 'white',
                            border: notification.read ? 0 : 2,
                            borderColor: 'primary.main',
                            borderRadius: 2
                          }}>
                            <Box display="flex" alignItems="center" gap={2} mb={1}>
                              <Chip 
                                label={notification.type} 
                                color={notification.type === 'success' ? 'success' : 
                                       notification.type === 'warning' ? 'warning' : 'info'}
                                size="small"
                              />
                              <Typography variant="caption" color="text.secondary">
                                {formatTime(notification.timestamp)}
                              </Typography>
                            </Box>
                            <Typography variant="h6" fontWeight={600} gutterBottom>
                              {notification.title}
                            </Typography>
                            <Typography variant="body2">
                              {notification.message}
                            </Typography>
                          </Paper>
                        </ListItem>
                      </Fade>
                    ))}
                  </List>
                )}
              </Box>
            )}
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
} 