import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Switch,
  FormControlLabel,
  Button,
  Fade,
  Divider
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Brightness4 as Brightness4Icon,
  Brightness7 as Brightness7Icon,
  Language as LanguageIcon,
  Article as ArticleIcon,
  TrendingUp as TrendingUpIcon,
  Recycling as RecyclingIcon
} from '@mui/icons-material';

export default function Settings({ darkMode, setDarkMode }) {
  const [notifications, setNotifications] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(false);
  const [language, setLanguage] = useState('en');

  return (
    <Fade in={true} timeout={800}>
      <Box maxWidth={600} mx="auto" mt={4}>
        <Fade in={true} timeout={600}>
          <Typography variant="h4" mb={3} fontWeight={700} color="primary">
            ⚙️ Settings & Preferences
          </Typography>
        </Fade>
        <Card sx={{ borderRadius: 3, boxShadow: 3, mb: 3 }}>
          <CardContent>
            <FormControlLabel
              control={
                <Switch
                  checked={darkMode}
                  onChange={() => setDarkMode(!darkMode)}
                  color="primary"
                />
              }
              label={
                <Box display="flex" alignItems="center" gap={1}>
                  {darkMode ? <Brightness4Icon /> : <Brightness7Icon />}
                  <Typography variant="body1">{darkMode ? 'Dark Mode' : 'Light Mode'}</Typography>
                </Box>
              }
              sx={{ mb: 2 }}
            />
            <Divider sx={{ my: 2 }} />
            <FormControlLabel
              control={
                <Switch
                  checked={notifications}
                  onChange={() => setNotifications(!notifications)}
                  color="primary"
                />
              }
              label={
                <Box display="flex" alignItems="center" gap={1}>
                  <NotificationsIcon />
                  <Typography variant="body1">Push Notifications</Typography>
                </Box>
              }
              sx={{ mb: 2 }}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={emailUpdates}
                  onChange={() => setEmailUpdates(!emailUpdates)}
                  color="primary"
                />
              }
              label={
                <Box display="flex" alignItems="center" gap={1}>
                  <NotificationsIcon />
                  <Typography variant="body1">Email Updates</Typography>
                </Box>
              }
              sx={{ mb: 2 }}
            />
            <Divider sx={{ my: 2 }} />
            <Box display="flex" alignItems="center" gap={2}>
              <LanguageIcon color="primary" />
              <Typography variant="body1">Language:</Typography>
              <Button
                variant={language === 'en' ? 'contained' : 'outlined'}
                color="primary"
                onClick={() => setLanguage('en')}
                sx={{ borderRadius: 2 }}
              >
                English
              </Button>
              <Button
                variant={language === 'kn' ? 'contained' : 'outlined'}
                color="primary"
                onClick={() => setLanguage('kn')}
                sx={{ borderRadius: 2 }}
              >
                Kannada
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Fade>
  );
} 