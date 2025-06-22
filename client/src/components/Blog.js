import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Chip,
  Button,
  Avatar,
  Fade,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton
} from '@mui/material';
import {
  Favorite as FavoriteIcon,
  Share as ShareIcon,
  Bookmark as BookmarkIcon,
  Close as CloseIcon
} from '@mui/icons-material';

const blogPosts = [
  {
    id: 1,
    title: "The Future of Smart Waste Management in Bengaluru",
    excerpt: "Discover how AI and IoT are revolutionizing waste collection in India's tech capital, making the city cleaner and more sustainable.",
    content: `
      <h2>The Future of Smart Waste Management in Bengaluru</h2>
      <p>Bengaluru, often called the Silicon Valley of India, is leading the way in smart waste management innovation. With a population of over 12 million people generating thousands of tons of waste daily, the city has embraced cutting-edge technology to tackle this challenge.</p>
      
      <h3>AI-Powered Collection Routes</h3>
      <p>Advanced algorithms now optimize collection routes in real-time, considering traffic conditions, weather, and waste generation patterns. This has reduced fuel consumption by 25% and improved collection efficiency by 40%.</p>
      
      <h3>IoT-Enabled Smart Bins</h3>
      <p>Smart bins equipped with sensors monitor fill levels and automatically alert collection teams when they need emptying. This prevents overflow and ensures timely collection.</p>
      
      <h3>Community Engagement</h3>
      <p>The city's mobile app allows residents to report issues, track collection schedules, and earn rewards for proper waste segregation. This gamification approach has increased participation by 60%.</p>
      
      <h3>Environmental Impact</h3>
      <p>These innovations have resulted in:</p>
      <ul>
        <li>30% reduction in landfill waste</li>
        <li>45% increase in recycling rates</li>
        <li>20% decrease in collection costs</li>
        <li>Improved air quality and reduced carbon emissions</li>
      </ul>
    `,
    author: "Dr. Priya Sharma",
    authorAvatar: "PS",
    date: "2024-01-15",
    category: "Innovation",
    tags: ["AI", "IoT", "Sustainability", "Bengaluru"],
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800",
    likes: 245,
    views: 1234,
    readTime: "5 min read"
  },
  {
    id: 2,
    title: "10 Essential Recycling Tips for Every Household",
    excerpt: "Master the art of recycling with these practical tips that will help you reduce waste and contribute to a greener planet.",
    content: `
      <h2>10 Essential Recycling Tips for Every Household</h2>
      <p>Recycling is one of the most effective ways to reduce our environmental impact. Here are ten essential tips to make recycling a seamless part of your daily routine.</p>
      
      <h3>1. Know Your Local Guidelines</h3>
      <p>Different municipalities have different recycling rules. Check your local waste management website for specific guidelines about what can and cannot be recycled.</p>
      
      <h3>2. Clean Before You Recycle</h3>
      <p>Rinse containers thoroughly to remove food residue. Dirty items can contaminate entire batches of recyclables.</p>
      
      <h3>3. Separate Materials Properly</h3>
      <p>Keep paper, plastic, glass, and metal separate. Mixed materials are harder to process and may end up in landfills.</p>
      
      <h3>4. Flatten Cardboard Boxes</h3>
      <p>Flatten cardboard boxes to save space and make collection more efficient. This also helps prevent them from getting wet.</p>
      
      <h3>5. Remove Non-Recyclable Parts</h3>
      <p>Remove plastic windows from envelopes, caps from bottles, and other non-recyclable components before recycling.</p>
      
      <h3>6. Use the Right Bin</h3>
      <p>Make sure you're using the correct recycling bin. Contamination can render entire loads unrecyclable.</p>
      
      <h3>7. Compost Organic Waste</h3>
      <p>Start composting kitchen scraps and yard waste. This reduces landfill waste and creates nutrient-rich soil for your garden.</p>
      
      <h3>8. Buy Recycled Products</h3>
      <p>Support the recycling industry by purchasing products made from recycled materials. This creates demand for recycled content.</p>
      
      <h3>9. Reduce Before Recycling</h3>
      <p>Remember the three Rs: Reduce, Reuse, Recycle. Focus on reducing consumption first, then reusing items, and finally recycling.</p>
      
      <h3>10. Educate Your Family</h3>
      <p>Teach children and family members about proper recycling practices. Make it a fun, educational activity for everyone.</p>
    `,
    author: "Environmental Team",
    authorAvatar: "ET",
    date: "2024-01-12",
    category: "Tips",
    tags: ["Recycling", "Household", "Tips", "Environment"],
    image: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800",
    likes: 189,
    views: 987,
    readTime: "4 min read"
  },
  {
    id: 3,
    title: "Composting 101: Turn Your Kitchen Waste into Gold",
    excerpt: "Learn how to transform your kitchen scraps into nutrient-rich compost that will make your garden thrive while reducing waste.",
    content: `
      <h2>Composting 101: Turn Your Kitchen Waste into Gold</h2>
      <p>Composting is nature's way of recycling organic materials into a rich soil amendment. It's easier than you think and incredibly beneficial for your garden and the environment.</p>
      
      <h3>What Can You Compost?</h3>
      <p><strong>Green Materials (Nitrogen-rich):</strong></p>
      <ul>
        <li>Fruit and vegetable scraps</li>
        <li>Coffee grounds and tea bags</li>
        <li>Fresh grass clippings</li>
        <li>Plant trimmings</li>
      </ul>
      
      <p><strong>Brown Materials (Carbon-rich):</strong></p>
      <ul>
        <li>Dry leaves and twigs</li>
        <li>Cardboard and paper</li>
        <li>Straw and hay</li>
        <li>Wood chips</li>
      </ul>
      
      <h3>Getting Started</h3>
      <p>1. Choose a location in your yard that's convenient but not too close to your house</p>
      <p>2. Start with a simple pile or invest in a compost bin</p>
      <p>3. Layer green and brown materials</p>
      <p>4. Keep it moist but not wet</p>
      <p>5. Turn the pile regularly to aerate it</p>
      
      <h3>Benefits of Composting</h3>
      <ul>
        <li>Reduces landfill waste by up to 30%</li>
        <li>Creates nutrient-rich soil for your garden</li>
        <li>Reduces the need for chemical fertilizers</li>
        <li>Improves soil structure and water retention</li>
        <li>Saves money on garden supplies</li>
      </ul>
    `,
    author: "Garden Expert",
    authorAvatar: "GE",
    date: "2024-01-10",
    category: "Composting",
    tags: ["Composting", "Garden", "Organic", "Sustainability"],
    image: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800",
    likes: 156,
    views: 756,
    readTime: "6 min read"
  }
];

export default function Blog() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedPost, setSelectedPost] = useState(null);
  const [likedPosts, setLikedPosts] = useState(new Set());
  const [bookmarkedPosts, setBookmarkedPosts] = useState(new Set());
  const isMobile = window.innerWidth < 900; // Simple mobile detection

  const categories = [
    { name: "All" },
    { name: "Innovation" },
    { name: "Tips" },
    { name: "Composting" }
  ];

  const filteredPosts = selectedCategory === "All" 
    ? blogPosts 
    : blogPosts.filter(post => post.category === selectedCategory);

  const handleLike = (postId) => {
    const newLikedPosts = new Set(likedPosts);
    if (newLikedPosts.has(postId)) {
      newLikedPosts.delete(postId);
    } else {
      newLikedPosts.add(postId);
    }
    setLikedPosts(newLikedPosts);
  };

  const handleBookmark = (postId) => {
    const newBookmarkedPosts = new Set(bookmarkedPosts);
    if (newBookmarkedPosts.has(postId)) {
      newBookmarkedPosts.delete(postId);
    } else {
      newBookmarkedPosts.add(postId);
    }
    setBookmarkedPosts(newBookmarkedPosts);
  };

  return (
    <Fade in={true} timeout={800}>
      <Box maxWidth={1200} mx="auto" mt={4} px={isMobile ? 2 : 0}>
        <Fade in={true} timeout={600}>
          <Typography variant="h4" mb={3} fontWeight={700} color="primary">
            📚 Waste Management Blog & Tips
          </Typography>
        </Fade>

        {/* Categories */}
        <Fade in={true} timeout={800}>
          <Box sx={{ mb: 4, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {categories.map((category) => (
              <Chip
                key={category.name}
                label={category.name}
                onClick={() => setSelectedCategory(category.name)}
                color={selectedCategory === category.name ? "primary" : "default"}
                variant={selectedCategory === category.name ? "filled" : "outlined"}
                sx={{ 
                  cursor: 'pointer',
                  '&:hover': { transform: 'translateY(-2px)' },
                  transition: 'all 0.3s ease'
                }}
              />
            ))}
          </Box>
        </Fade>

        {/* Blog Posts Grid */}
        <Grid container spacing={3}>
          {filteredPosts.map((post, index) => (
            <Grid item xs={12} md={6} lg={4} key={post.id}>
              <Fade in={true} timeout={1000 + index * 200}>
                <Card 
                  sx={{ 
                    height: '100%',
                    borderRadius: 3,
                    boxShadow: 3,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': { 
                      transform: 'translateY(-8px)',
                      boxShadow: 8
                    }
                  }}
                  onClick={() => setSelectedPost(post)}
                >
                  <CardMedia
                    component="img"
                    height="200"
                    image={post.image}
                    alt={post.title}
                    sx={{ objectFit: 'cover' }}
                  />
                  <CardContent sx={{ p: 3 }}>
                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                      <Chip 
                        label={post.category} 
                        color="primary" 
                        size="small" 
                        variant="outlined"
                      />
                      <Typography variant="caption" color="text.secondary">
                        {post.readTime}
                      </Typography>
                    </Box>
                    
                    <Typography variant="h6" fontWeight={600} mb={2} sx={{ 
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {post.title}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" mb={3} sx={{
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {post.excerpt}
                    </Typography>
                    
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                      <Box display="flex" alignItems="center" gap={2}>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                          {post.authorAvatar}
                        </Avatar>
                        <Box>
                          <Typography variant="caption" fontWeight={600}>
                            {post.author}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" display="block">
                            {new Date(post.date).toLocaleDateString()}
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Box display="flex" alignItems="center" gap={1}>
                        <IconButton 
                          size="small" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLike(post.id);
                          }}
                          color={likedPosts.has(post.id) ? "error" : "default"}
                        >
                          <FavoriteIcon fontSize="small" />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleBookmark(post.id);
                          }}
                          color={bookmarkedPosts.has(post.id) ? "primary" : "default"}
                        >
                          <BookmarkIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                    
                    <Box display="flex" alignItems="center" gap={2} mt={2}>
                      <Typography variant="caption" color="text.secondary">
                        👁️ {post.views} views
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        ❤️ {post.likes + (likedPosts.has(post.id) ? 1 : 0)} likes
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Fade>
            </Grid>
          ))}
        </Grid>

        {/* Blog Post Dialog */}
        <Dialog 
          open={!!selectedPost} 
          onClose={() => setSelectedPost(null)}
          maxWidth="md"
          fullWidth
          fullScreen={isMobile}
        >
          {selectedPost && (
            <>
              <DialogTitle>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Typography variant="h6" fontWeight={600}>
                    {selectedPost.title}
                  </Typography>
                  <IconButton onClick={() => setSelectedPost(null)}>
                    <CloseIcon />
                  </IconButton>
                </Box>
              </DialogTitle>
              <DialogContent>
                <Box sx={{ mb: 3 }}>
                  <img 
                    src={selectedPost.image} 
                    alt={selectedPost.title}
                    style={{ 
                      width: '100%', 
                      height: 300, 
                      objectFit: 'cover',
                      borderRadius: 8
                    }}
                  />
                </Box>
                
                <Box display="flex" alignItems="center" gap={2} mb={3}>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    {selectedPost.authorAvatar}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" fontWeight={600}>
                      {selectedPost.author}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(selectedPost.date).toLocaleDateString()} • {selectedPost.readTime}
                    </Typography>
                  </Box>
                </Box>
                
                <Box display="flex" gap={1} mb={3} flexWrap="wrap">
                  {selectedPost.tags.map((tag) => (
                    <Chip key={tag} label={tag} size="small" variant="outlined" />
                  ))}
                </Box>
                
                <div 
                  dangerouslySetInnerHTML={{ __html: selectedPost.content }}
                  style={{
                    lineHeight: 1.8,
                    fontSize: '1rem'
                  }}
                />
              </DialogContent>
              <DialogActions sx={{ p: 3 }}>
                <Button 
                  startIcon={<ShareIcon />}
                  variant="outlined"
                >
                  Share
                </Button>
                <Button 
                  startIcon={<BookmarkIcon />}
                  variant="outlined"
                  onClick={() => handleBookmark(selectedPost.id)}
                  color={bookmarkedPosts.has(selectedPost.id) ? "primary" : "default"}
                >
                  {bookmarkedPosts.has(selectedPost.id) ? "Bookmarked" : "Bookmark"}
                </Button>
                <Button 
                  startIcon={<FavoriteIcon />}
                  variant="contained"
                  onClick={() => handleLike(selectedPost.id)}
                  color={likedPosts.has(selectedPost.id) ? "error" : "primary"}
                >
                  {likedPosts.has(selectedPost.id) ? "Liked" : "Like"}
                </Button>
              </DialogActions>
            </>
          )}
        </Dialog>
      </Box>
    </Fade>
  );
} 