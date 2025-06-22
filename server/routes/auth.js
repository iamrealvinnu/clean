const express = require('express');
const router = express.Router();

// In-memory user storage (replace with database later)
const users = [
  {
    id: 1,
    username: 'admin',
    password: 'admin123',
    role: 'admin',
    name: 'Admin User',
    email: 'admin@waste.com'
  },
  {
    id: 2,
    username: 'driver',
    password: 'driver123',
    role: 'driver',
    name: 'Driver User',
    email: 'driver@waste.com'
  },
  {
    id: 3,
    username: 'resident',
    password: 'resident123',
    role: 'resident',
    name: 'Resident User',
    email: 'resident@waste.com'
  }
];

// Login endpoint
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  const user = users.find(u => u.username === username && u.password === password);
  
  if (user) {
    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        name: user.name,
        email: user.email
      },
      message: 'Login successful'
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }
});

// Register endpoint
router.post('/register', (req, res) => {
  const { username, password, email, role } = req.body;
  
  const existingUser = users.find(u => u.username === username);
  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: 'Username already exists'
    });
  }
  
  const newUser = {
    id: users.length + 1,
    username,
    password,
    email,
    role: role || 'resident',
    name: username
  };
  
  users.push(newUser);
  
  res.json({
    success: true,
    user: {
      id: newUser.id,
      username: newUser.username,
      role: newUser.role,
      name: newUser.name,
      email: newUser.email
    },
    message: 'Registration successful'
  });
});

// Get user profile
router.get('/profile/:id', (req, res) => {
  const user = users.find(u => u.id === parseInt(req.params.id));
  
  if (user) {
    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        name: user.name,
        email: user.email
      }
    });
  } else {
    res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }
});

module.exports = router;