import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Avatar,
  Fade,
  List,
  ListItem,
  ListItemText,
  Chip,
  IconButton,
  Paper,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Animated typing indicator
function TypingDots() {
  const [dotCount, setDotCount] = useState(1);
  useEffect(() => {
    const interval = setInterval(() => setDotCount(d => (d % 3) + 1), 400);
    return () => clearInterval(interval);
  }, []);
  return <span style={{ letterSpacing: 2 }}>{'.'.repeat(dotCount)}</span>;
}

// Eco facts and motivational quotes
const ecoFacts = [
  '🌳 One tree can absorb as much as 48 pounds of CO2 per year.',
  '♻️ Recycling one aluminum can saves enough energy to run a TV for 3 hours.',
  '🚰 Turning off the tap while brushing your teeth can save 8 gallons of water a day.',
  '🍃 Composting food waste reduces landfill methane emissions.'
];
const motivationalQuotes = [
  '“The greatest threat to our planet is the belief that someone else will save it.” – Robert Swan',
  '“Small acts, when multiplied by millions, can transform the world.” – Howard Zinn',
  '“Every day is Earth Day.”',
  '“Be the change you wish to see in the world.” – Mahatma Gandhi'
];

const roleGreetings = {
  resident: [
    '👋 Hi there! How can I help you with your waste management today?',
    '🌱 Hello! Need help with your schedule or want some eco tips?',
    '😊 Hey! I\'m here to make your waste management easier.'
  ],
  driver: [
    '🚚 Hello Driver! Ready for your route or need to report something?',
    '👷‍♂️ Hi! How\'s your day on the road?',
    '🛣️ Welcome! Need to update your status or report an incident?'
  ],
  admin: [
    '🛠️ Hello Admin! Need analytics, user management, or system status?',
    '📊 Hi Admin! How can I assist you in managing the system?',
    '👨‍💼 Welcome back, Admin!'
  ]
};

const roleQuickActions = {
  resident: [
    { text: 'View Schedule', action: 'schedule' },
    { text: 'Report Issue', action: 'report' },
    { text: 'Recycling Tips', action: 'recycle' },
    { text: 'Leaderboard', action: 'leaderboard' },
    { text: 'Eco Fact', action: 'ecofact' },
    { text: 'Motivation', action: 'motivation' },
    { text: 'Play a Game', action: 'game' }
  ],
  driver: [
    { text: 'View Route', action: 'route' },
    { text: 'Report Incident', action: 'incident' },
    { text: 'Vehicle Status', action: 'vehicle' },
    { text: 'Eco Fact', action: 'ecofact' },
    { text: 'Motivation', action: 'motivation' },
    { text: 'Play a Game', action: 'game' }
  ],
  admin: [
    { text: 'View Analytics', action: 'analytics' },
    { text: 'User Management', action: 'users' },
    { text: 'System Status', action: 'system' },
    { text: 'Eco Fact', action: 'ecofact' },
    { text: 'Motivation', action: 'motivation' },
    { text: 'Play a Game', action: 'game' }
  ]
};

const roleResponses = {
  schedule: [
    '🗓️ Your next waste collection is on Monday at 7:00 AM.',
    '📅 The next pickup is scheduled for Monday morning. Anything else you want to know?'
  ],
  recycle: [
    '♻️ Tip: Rinse containers before recycling and separate dry/wet waste.',
    '🌍 Remember to compost your kitchen waste for a greener planet!'
  ],
  leaderboard: [
    '🏆 Check the Eco Challenges page for the latest leaderboard!',
    '🥇 Want to climb the leaderboard? Join more challenges!'
  ],
  route: [
    '🗺️ Your route today covers Ward 1, 2, and 3. Drive safe!',
    '🚦 Remember to check your vehicle before starting your route.'
  ],
  vehicle: [
    '🚗 Your vehicle is in good condition. Status: On Route.',
    '🔧 All systems are operational. Have a safe drive!'
  ],
  analytics: [
    '📊 Waste collection is up 10% this month. Great job!',
    '📈 The system is running smoothly. Want more details?'
  ],
  users: [
    '👥 You can manage users from the Admin Dashboard.',
    '🧑‍💻 User management tools are available in your admin panel.'
  ],
  system: [
    '🖥️ All systems operational. No issues detected.',
    '✅ Everything looks good on the system status.'
  ]
};

const empathyReplies = {
  happy: [
    "I'm glad to help! 😊",
    "Awesome! Let me know if you need anything else.",
    "Yay! Always here for you."
  ],
  neutral: [
    "I'm here for you! 😊",
    "Let me help you with that.",
    "I understand, let's get this sorted.",
    "Thanks for sharing!"
  ],
  frustrated: [
    "I'm really sorry you're having trouble. Let's fix this together.",
    "I understand this can be frustrating. I'm here to help.",
    "Thank you for your patience. We'll get this sorted!"
  ]
};

const smallTalk = {
  resident: [
    "How's your day going?",
    "Is there anything else I can help you with?",
    "Would you like to hear a recycling tip?",
    "Let me know if you want to play a quick eco quiz!"
  ],
  driver: [
    "How's your route today?",
    "Stay safe on the road! Need anything else?",
    "Want a quick eco fact for the road?",
    "Let me know if you want to play a quick quiz!"
  ],
  admin: [
    "How's the system running today?",
    "Need any analytics or reports?",
    "Would you like a motivational quote?",
    "Let me know if you want to play a quick quiz!"
  ]
};

// Quiz questions for the game
const quizQuestions = [
  {
    question: 'Which of these items is recyclable?',
    options: ['Plastic bottle', 'Food waste', 'Ceramic plate', 'Battery'],
    answer: 0
  },
  {
    question: 'What color bin is usually for organic waste?',
    options: ['Blue', 'Green', 'Red', 'Yellow'],
    answer: 1
  },
  {
    question: 'What should you do before recycling a can?',
    options: ['Crush it', 'Rinse it', 'Throw it as is', 'Paint it'],
    answer: 1
  }
];

export default function Chatbot({ user = { role: 'resident', name: 'User' } }) {
  const [isOpen, setIsOpen] = useState(false);
  const greetingsArr = roleGreetings[user.role] || roleGreetings['resident'];
  const [messages, setMessages] = useState([
    { 
      text: pickRandom(greetingsArr),
      isBot: true,
      timestamp: new Date(),
      emoji: '🤖',
      mood: 'neutral'
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [gameMode, setGameMode] = useState(false);
  const [quizStep, setQuizStep] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [context, setContext] = useState(null); // e.g. 'report', 'incident', etc.
  const [sessionMood, setSessionMood] = useState('neutral'); // happy, neutral, frustrated
  const [showConfetti, setShowConfetti] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  // Confetti/emoji burst effect
  useEffect(() => {
    if (showConfetti) {
      const timer = setTimeout(() => setShowConfetti(false), 1800);
      return () => clearTimeout(timer);
    }
  }, [showConfetti]);

  // Detect mood from user message
  function detectMood(msg) {
    const lower = msg.toLowerCase();
    if (lower.includes('not working') || lower.includes('angry') || lower.includes('bad') || lower.includes('frustrated') || lower.includes('problem') || lower.includes('complaint')) return 'frustrated';
    if (lower.includes('thank') || lower.includes('great') || lower.includes('awesome') || lower.includes('good') || lower.includes('love')) return 'happy';
    return 'neutral';
  }

  // Handle sending a message
  const handleSend = () => {
    if (!input.trim()) return;
    const userMessage = input;
    const timestamp = new Date();
    const mood = detectMood(userMessage);
    setSessionMood(mood);
    setMessages(prev => [
      ...prev,
      { text: userMessage, isBot: false, timestamp, emoji: '🧑', mood }
    ]);
    setInput('');
    setIsTyping(true);
    setTimeout(() => {
      handleBotResponse(userMessage, mood);
      setIsTyping(false);
    }, 900);
  };

  // Bot response logic
  const handleBotResponse = (msg, userMood = 'neutral') => {
    const lowerMsg = msg.toLowerCase();
    // Contextual follow-up for reporting
    if (context === 'report') {
      setMessages(prev => [
        ...prev,
        { text: `Thank you for reporting: "${msg}". Our team will look into it. ${pickRandom(empathyReplies[userMood])}`, isBot: true, timestamp: new Date(), emoji: '🤖', mood: userMood }
      ]);
      setContext(null);
      setTimeout(() => addSmallTalk(), 1200);
      setShowConfetti(true);
      return;
    }
    if (context === 'incident') {
      setMessages(prev => [
        ...prev,
        { text: `Incident noted: "${msg}". Stay safe! ${pickRandom(empathyReplies[userMood])}`, isBot: true, timestamp: new Date(), emoji: '🤖', mood: userMood }
      ]);
      setContext(null);
      setTimeout(() => addSmallTalk(), 1200);
      setShowConfetti(true);
      return;
    }
    // Detect intent
    if (lowerMsg.includes('report')) {
      setContext('report');
      setMessages(prev => [
        ...prev,
        { text: `📝 What issue would you like to report, ${user.name}?`, isBot: true, timestamp: new Date(), emoji: '🤖', mood: userMood }
      ]);
      return;
    }
    if (lowerMsg.includes('incident')) {
      setContext('incident');
      setMessages(prev => [
        ...prev,
        { text: `🚨 Please describe the incident, ${user.name}.`, isBot: true, timestamp: new Date(), emoji: '🤖', mood: userMood }
      ]);
      return;
    }
    // Role-based quick responses
    let found = false;
    Object.keys(roleResponses).forEach(key => {
      if (lowerMsg.includes(key)) {
        setMessages(prev => [
          ...prev,
          { text: pickRandom(roleResponses[key]), isBot: true, timestamp: new Date(), emoji: '🤖', mood: userMood }
        ]);
        found = true;
      }
    });
    if (found) {
      setTimeout(() => addSmallTalk(), 1200);
      return;
    }
    // Small talk
    if (lowerMsg.includes('hello') || lowerMsg.includes('hi') || lowerMsg.includes('hey')) {
      setMessages(prev => [
        ...prev,
        { text: pickRandom(greetingsArr), isBot: true, timestamp: new Date(), emoji: '🤖', mood: userMood }
      ]);
      setTimeout(() => addSmallTalk(), 1200);
      return;
    }
    // Default fallback
    setMessages(prev => [
      ...prev,
      { text: `🤖 I can help you with schedules, reporting, tips, and more! Try a quick action below.`, isBot: true, timestamp: new Date(), emoji: '🤖', mood: userMood }
    ]);
    setTimeout(() => addSmallTalk(), 1200);
  };

  // Bot-initiated small talk
  const addSmallTalk = () => {
    setMessages(prev => [
      ...prev,
      { text: pickRandom(smallTalk[user.role] || smallTalk['resident']), isBot: true, timestamp: new Date(), emoji: '🤖', mood: sessionMood }
    ]);
  };

  // Handle quick actions
  const handleQuickAction = (action) => {
    if (action === 'game') {
      setGameMode(true);
      setQuizStep(0);
      setQuizScore(0);
      setQuizFinished(false);
      return;
    }
    if (action === 'report') {
      setContext('report');
      setMessages(prev => [
        ...prev,
        { text: `📝 What issue would you like to report, ${user.name}?`, isBot: true, timestamp: new Date(), emoji: '🤖', mood: sessionMood }
      ]);
      return;
    }
    if (action === 'incident') {
      setContext('incident');
      setMessages(prev => [
        ...prev,
        { text: `🚨 Please describe the incident, ${user.name}.`, isBot: true, timestamp: new Date(), emoji: '🤖', mood: sessionMood }
      ]);
      return;
    }
    if (action === 'ecofact') {
      setMessages(prev => [
        ...prev,
        { text: pickRandom(ecoFacts), isBot: true, timestamp: new Date(), emoji: '🌎', mood: sessionMood }
      ]);
      return;
    }
    if (action === 'motivation') {
      setMessages(prev => [
        ...prev,
        { text: pickRandom(motivationalQuotes), isBot: true, timestamp: new Date(), emoji: '💡', mood: sessionMood }
      ]);
      return;
    }
    let responseArr = roleResponses[action];
    let response = responseArr ? pickRandom(responseArr) : '🤖 Feature coming soon!';
    setMessages(prev => [
      ...prev,
      { text: response, isBot: true, timestamp: new Date(), emoji: '🤖', mood: sessionMood }
    ]);
    setTimeout(() => addSmallTalk(), 1200);
  };

  // Quiz game logic
  const handleQuizAnswer = (selected) => {
    const correct = quizQuestions[quizStep].answer === selected;
    if (correct) setQuizScore(s => s + 1);
    if (quizStep + 1 < quizQuestions.length) {
      setQuizStep(q => q + 1);
    } else {
      setQuizFinished(true);
      setShowConfetti(true);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Emoji burst effect
  function EmojiBurst() {
    const emojis = ['🎉', '✨', '🌟', '🥳', '🎊', '💚', '🌱'];
    return (
      <Box sx={{
        position: 'fixed',
        pointerEvents: 'none',
        left: 0,
        top: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 2000,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: { xs: 40, md: 60 },
        animation: 'fadeOut 1.8s forwards'
      }}>
        {emojis.map((e, i) => (
          <span key={i} style={{
            margin: 10,
            opacity: 0.8,
            transform: `translateY(${Math.random() * 100 - 50}px) scale(${1 + Math.random() * 0.5}) rotate(${Math.random() * 360}deg)`
          }}>{e}</span>
        ))}
      </Box>
    );
  }

  // UI
  return (
    <>
      {showConfetti && <EmojiBurst />}
      <Fab
        color="primary"
        aria-label="chat"
        onClick={() => setIsOpen(!isOpen)}
        sx={{ 
          position: 'fixed', 
          bottom: 16, 
          right: 16, 
          zIndex: 1000,
          background: 'linear-gradient(135deg, #1a365d 0%, #2d5a87 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #0f1f2e 0%, #1a365d 100%)',
          }
        }}
      >
        <span role="img" aria-label={isOpen ? 'close chatbot' : 'open chatbot'}>{isOpen ? '❌' : '💬'}</span>
      </Fab>
      <Dialog
        open={isOpen}
        onClose={() => { setIsOpen(false); setGameMode(false); setContext(null); }}
        PaperProps={{
          sx: {
            position: 'fixed',
            bottom: 80,
            right: 16,
            width: 'calc(100vw - 32px)',
            maxWidth: 400,
            height: 540,
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 3,
            overflow: 'hidden',
            boxShadow: 6
          }
        }}
      >
        <DialogTitle
          sx={{
            p: 2,
            bgcolor: 'primary.main',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            background: 'linear-gradient(135deg, #1a365d 0%, #2d5a87 100%)'
          }}
        >
          <Avatar sx={{ mr: 2, bgcolor: 'white', color: 'primary.main', fontSize: 28 }}>
            <span role="img" aria-label="bot">🤖</span>
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight={600}>
              Smart Waste Bot
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.8 }}>
              {user.role.charAt(0).toUpperCase() + user.role.slice(1)} Assistant
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ flexGrow: 1, overflow: 'auto', p: 1, bgcolor: 'grey.50' }}>
          {!gameMode ? (
            <List>
          {messages.map((msg, index) => (
                <Fade in key={index} timeout={600}>
                  <ListItem sx={{
              justifyContent: msg.isBot ? 'flex-start' : 'flex-end',
              px: 1,
              py: 0.5
            }}>
              <Paper
                sx={{
                  p: 1.5,
                  maxWidth: '80%',
                  bgcolor: msg.isBot ? 'white' : 'primary.main',
                  color: msg.isBot ? 'text.primary' : 'white',
                  borderRadius: 2,
                  boxShadow: 1,
                        position: 'relative',
                        fontSize: 16,
                        transition: 'box-shadow 0.3s'
                }}
              >
                      {msg.isBot && (
                  <Box sx={{ 
                    position: 'absolute', 
                    top: -8, 
                    left: -8, 
                    bgcolor: 'primary.main',
                    borderRadius: '50%',
                    p: 0.5,
                          color: 'white',
                          fontSize: 18
                  }}>
                          <span role="img" aria-label="bot">{msg.emoji}</span>
                  </Box>
                )}
                <ListItemText 
                  primary={msg.text} 
                  secondary={formatTime(msg.timestamp)}
                  secondaryTypographyProps={{ 
                    fontSize: '0.75rem',
                    color: msg.isBot ? 'text.secondary' : 'rgba(255,255,255,0.7)'
                  }}
                />
              </Paper>
            </ListItem>
                </Fade>
          ))}
          {isTyping && (
            <ListItem sx={{ justifyContent: 'flex-start', px: 1, py: 0.5 }}>
              <Paper sx={{ p: 1.5, bgcolor: 'white', borderRadius: 2, boxShadow: 1 }}>
                <Typography variant="body2" color="text.secondary">
                      <TypingDots />
                </Typography>
              </Paper>
            </ListItem>
          )}
          <div ref={messagesEndRef} />
            </List>
          ) : (
            <Box textAlign="center" mt={2}>
              {!quizFinished ? (
                <>
                  <Typography variant="h6" mb={2} fontWeight={700}>
                    🧩 Eco Quiz
                  </Typography>
                  <Typography mb={2}>{quizQuestions[quizStep].question}</Typography>
                  <Box display="flex" flexDirection="column" gap={1}>
                    {quizQuestions[quizStep].options.map((opt, idx) => (
                      <Button
                        key={idx}
                        variant="contained"
                        color="primary"
                        onClick={() => handleQuizAnswer(idx)}
                        sx={{ borderRadius: 2, fontWeight: 600 }}
                      >
                        {opt}
                      </Button>
                    ))}
                  </Box>
                  <Typography mt={2} variant="caption" color="text.secondary">
                    Question {quizStep + 1} of {quizQuestions.length}
                  </Typography>
                </>
              ) : (
                <>
                  <Typography variant="h6" mb={2} fontWeight={700}>
                    🎉 Quiz Complete!
                  </Typography>
                  <Typography mb={2}>Your Score: {quizScore} / {quizQuestions.length}</Typography>
                  <Button
                    variant="contained"
                    color="success"
                    onClick={() => setGameMode(false)}
                    sx={{ borderRadius: 2, fontWeight: 600 }}
                  >
                    Back to Chat
                  </Button>
                </>
              )}
            </Box>
          )}
        </DialogContent>
        {!gameMode && (
        <DialogActions sx={{ p: 1, bgcolor: 'white', borderTop: 1, borderColor: 'grey.200' }}>
          <Typography variant="caption" color="text.secondary" sx={{ px: 1, display: 'block', mb: 1 }}>
            Quick actions:
          </Typography>
          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
              {(roleQuickActions[user.role] || roleQuickActions.resident).map((action, index) => (
              <Chip
                key={index}
                label={action.text}
                size="small"
                onClick={() => handleQuickAction(action.action)}
                sx={{ 
                  cursor: 'pointer',
                  '&:hover': { bgcolor: 'primary.light', color: 'white' }
                }}
              />
            ))}
          </Box>
        </DialogActions>
        )}
        {!gameMode && (
        <DialogActions>
          <TextField
            fullWidth
            size="small"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            multiline
            maxRows={3}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              }
            }}
          />
          <IconButton 
            onClick={handleSend} 
            color="primary"
            disabled={!input.trim()}
            sx={{ 
              bgcolor: 'primary.main',
              color: 'white',
              '&:hover': { bgcolor: 'primary.dark' },
              '&.Mui-disabled': { bgcolor: 'grey.300', color: 'grey.500' }
            }}
          >
              <span role="img" aria-label="send">➡️</span>
          </IconButton>
        </DialogActions>
        )}
      </Dialog>
    </>
  );
} 