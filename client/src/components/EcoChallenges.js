import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Grid,
  LinearProgress,
  Avatar,
  Chip,
  Fade,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  useTheme
} from '@mui/material';

const challenges = [
  {
    id: 1,
    title: 'Plastic-Free Week',
    description: 'Avoid single-use plastics for a week. Share your progress and inspire others!',
    progress: 78,
    reward: 'Green Warrior Badge',
    emoji: '🌿',
    participants: 1200
  },
  {
    id: 2,
    title: 'Community Clean-Up',
    description: 'Join your neighbors for a weekend clean-up drive in your ward.',
    progress: 54,
    reward: 'Community Hero Badge',
    emoji: '🤝',
    participants: 850
  },
  {
    id: 3,
    title: 'Compost Challenge',
    description: 'Start composting your kitchen waste and reduce landfill contribution.',
    progress: 32,
    reward: 'Compost Champion Badge',
    emoji: '🌱',
    participants: 430
  }
];

const leaderboard = [
  { name: 'Asha Patel', points: 320, badge: 'Green Warrior', emoji: '🥇' },
  { name: 'Nitesh Kumar', points: 290, badge: 'Community Hero', emoji: '🥈' },
  { name: 'Ravi Singh', points: 250, badge: 'Compost Champion', emoji: '🥉' }
];

const getProgressColor = (progress) => {
  if (progress > 70) return 'success';
  if (progress > 40) return 'warning';
  return 'primary';
};

export default function EcoChallenges() {
  const [joined, setJoined] = useState([]);
  const theme = useTheme();

  const handleJoin = (id) => {
    setJoined((prev) => [...prev, id]);
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50', pb: 6 }}>
      {/* Hero Section */}
      <Fade in timeout={800}>
        <Box
          sx={{
            width: '100%',
            py: { xs: 5, md: 8 },
            px: 2,
            mb: 4,
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.success.light} 100%)`,
            color: 'white',
            borderRadius: 0,
            textAlign: 'center',
            boxShadow: 3
          }}
        >
          <Typography variant="h3" fontWeight={800} mb={2}>
            🌱 Join Eco Challenges!
          </Typography>
          <Typography variant="h6" mb={3}>
            Take action for a cleaner, greener community. Complete challenges, earn rewards, and climb the leaderboard!
          </Typography>
          <Button
            variant="contained"
            size="large"
            color="success"
            sx={{ fontWeight: 700, borderRadius: 3, px: 4, boxShadow: 2 }}
          >
            Start Your First Challenge
          </Button>
        </Box>
      </Fade>

      {/* Challenges Grid */}
      <Box maxWidth={1200} mx="auto" px={2}>
        <Typography variant="h4" fontWeight={700} color="primary" mb={3}>
          Active Challenges
        </Typography>
        <Grid container spacing={4} mb={6}>
          {challenges.map((challenge, idx) => (
            <Grid item xs={12} sm={6} md={4} key={challenge.id}>
              <Fade in timeout={800 + idx * 200}>
                <Card sx={{ borderRadius: 4, boxShadow: 4, height: '100%', display: 'flex', flexDirection: 'column', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-6px) scale(1.03)', boxShadow: 8 } }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box display="flex" alignItems="center" gap={2} mb={2}>
                      <span style={{ fontSize: 32 }}>{challenge.emoji}</span>
                      <Typography variant="h6" fontWeight={700}>{challenge.title}</Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" mb={2}>
                      {challenge.description}
                    </Typography>
                    <Box mb={2}>
                      <LinearProgress
                        variant="determinate"
                        value={challenge.progress}
                        sx={{ height: 10, borderRadius: 5 }}
                        color={getProgressColor(challenge.progress)}
                      />
                      <Typography variant="caption" color="text.secondary">
                        {challenge.progress}% completed • {challenge.participants} participants
                      </Typography>
                    </Box>
                    <Chip label={challenge.reward} color="success" sx={{ mb: 1 }} />
                  </CardContent>
                  <CardActions>
                    <Button
                      variant={joined.includes(challenge.id) ? 'outlined' : 'contained'}
                      color="primary"
                      fullWidth
                      disabled={joined.includes(challenge.id)}
                      onClick={() => handleJoin(challenge.id)}
                      sx={{ borderRadius: 2, fontWeight: 600 }}
                    >
                      {joined.includes(challenge.id) ? 'Joined' : 'Join Challenge'}
                    </Button>
                  </CardActions>
                </Card>
              </Fade>
            </Grid>
          ))}
        </Grid>

        {/* Leaderboard Section */}
        <Fade in timeout={1200}>
          <Card sx={{ borderRadius: 4, boxShadow: 4, maxWidth: 500, mx: 'auto', mb: 4 }}>
            <CardContent>
              <Typography variant="h5" mb={2} color="primary" fontWeight={700} textAlign="center">
                🏆 Leaderboard
              </Typography>
              <List>
                {leaderboard.map((user, i) => (
                  <ListItem key={i}>
                    <ListItemAvatar>
                      <Avatar sx={{
                        bgcolor: i === 0 ? '#FFD700' : i === 1 ? '#C0C0C0' : '#CD7F32',
                        width: 40,
                        height: 40,
                        fontWeight: 700,
                        fontSize: 28
                      }}>
                        <span role="img" aria-label="rank">{user.emoji}</span>
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={<Typography fontWeight={700}>{user.name}</Typography>}
                      secondary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip label={user.badge} size="small" color="success" />
                          <Typography variant="caption" color="text.secondary">
                            {user.points} pts
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Fade>
      </Box>
    </Box>
  );
} 