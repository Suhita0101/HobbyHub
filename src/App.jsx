import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useParams, useNavigate } from 'react-router-dom';
import './App.css';

// Sample posts data
const samplePosts = [
  {
    id: '1',
    title: 'Getting Started with Watercolor Painting',
    content: 'Watercolor painting is a relaxing and rewarding hobby that anyone can learn. I started six months ago and wanted to share my journey. The key is to start with quality paper and a basic set of colors. Don\'t be afraid to make mistakes - that\'s how you learn!\n\nMy favorite techniques so far are wet-on-wet for dreamy landscapes and dry brush for adding texture. What techniques are you interested in trying?',
    imageUrl: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1471&q=80',
    createdAt: Date.now() - 1000000,
    upvotes: 24,
    comments: [
      { id: '101', text: 'I love watercolors too! Have you tried gouache?', createdAt: Date.now() - 800000 },
      { id: '102', text: 'Thanks for sharing! Which brand of paints do you recommend?', createdAt: Date.now() - 500000 }
    ]
  },
  {
    id: '2',
    title: 'My Urban Gardening Adventure',
    content: 'Living in an apartment doesn\'t mean you can\'t garden! I\'ve transformed my small balcony into a thriving urban garden with herbs, vegetables, and even some flowers.\n\nStarted with basil and mint, which are pretty forgiving for beginners. Now I\'m growing tomatoes, lettuce, and a variety of peppers. Nothing tastes better than food you\'ve grown yourself!',
    imageUrl: 'https://images.unsplash.com/photo-1622383563227-04401ab4e5ea?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80',
    createdAt: Date.now() - 2000000,
    upvotes: 18,
    comments: [
      { id: '201', text: 'Your garden looks amazing! How much sunlight does your balcony get?', createdAt: Date.now() - 1500000 }
    ]
  },
  {
    id: '3',
    title: 'Beginner\'s Guide to Woodworking',
    content: 'I picked up woodworking during the pandemic and it\'s become a passion. Started with simple projects like a cutting board and have worked my way up to building furniture.\n\nFor beginners, I recommend starting with hand tools before investing in power tools. Learn about different wood types and their properties. And always, always prioritize safety!',
    imageUrl: 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1631&q=80',
    createdAt: Date.now() - 3000000,
    upvotes: 31,
    comments: [
      { id: '301', text: 'This is inspiring! What was your first project?', createdAt: Date.now() - 2500000 },
      { id: '302', text: 'Do you have any resources for learning woodworking online?', createdAt: Date.now() - 2000000 },
      { id: '303', text: 'I just completed my first shelf! It\'s not perfect but I\'m proud of it.', createdAt: Date.now() - 1000000 }
    ]
  },
  {
    id: '4',
    title: 'Digital Photography Tips for Hobbyists',
    content: 'Photography has been my creative outlet for years. You don\'t need expensive equipment to take great photos - understanding composition and lighting will take you further than any camera upgrade.\n\nStart by mastering the exposure triangle (aperture, shutter speed, ISO) and the rest will follow. I\'ve included one of my favorite sunset shots from last weekend.',
    imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1464&q=80',
    createdAt: Date.now() - 4000000,
    upvotes: 15,
    comments: []
  },
  {
    id: '5',
    title: 'Sourdough Baking: From Starter to Loaf',
    content: 'My sourdough journey began three years ago with a simple starter. Now baking bread has become a weekly ritual I look forward to.\n\nThe process is simple but requires patience: maintain your starter, mix a basic dough (flour, water, salt), let time do its magic with fermentation, shape, and bake. The result is infinitely better than store-bought bread!',
    imageUrl: 'https://imagekit.io/tools/asset-public-link?detail=%7B%22name%22%3A%22fernando-delgado-AO6j8f8xXHw-unsplash.jpg%22%2C%22type%22%3A%22image%2Fjpeg%22%2C%22signedurl_expire%22%3A%222028-04-21T17%3A13%3A46.160Z%22%2C%22signedUrl%22%3A%22https%3A%2F%2Fmedia-hosting.imagekit.io%2F05c33c3203054984%2Ffernando-delgado-AO6j8f8xXHw-unsplash.jpg%3FExpires%3D1839950026%26Key-Pair-Id%3DK2ZIVPTIP2VGHC%26Signature%3DDoqP7J553rI7mfBGi44DDCNwZChDgQ~EEJ6gfMgUeVzceg9P1gybRoavWmWZbH5dBqLYeQN8v2oENpPdX-ZM~-VSpQNgyQlF4X1dxk9CirKCkC4F-3l6wlgNPWePfLAGTsSby~GtB6fg59ePquTrAPNISNxdF5sz6Bcb3BkSD53NH4o08CUNhxhuU~fJL~36GCvAZz5-BksTVs9kQ25l6~9oI0BMuqfbGhoR0Mi2npnh~809xJjRne5Uo2fe6s~wqHIAQadsMgSr0FAWtGpmOMBagtUdqBU0Fe3nAJD3zPS2asklBb9PVP4uMrmaird~cHQ3o8sCRy6fW--L6NUiqw__%22%7D',
    createdAt: Date.now() - 5000000,
    upvotes: 28,
    comments: [
      { id: '501', text: 'Your bread looks amazing! How often do you feed your starter?', createdAt: Date.now() - 4500000 },
      { id: '502', text: 'I\'ve been struggling with getting enough rise. Any tips?', createdAt: Date.now() - 4000000 }
    ]
  },
  {
    id: '6',
    title: 'Calligraphy as a Mindful Practice',
    content: 'I recently started learning modern calligraphy and it has helped me slow down and focus. The rhythm of each stroke brings a sense of calm I didn’t expect.\n\nIf you’re looking for a creative hobby with a touch of mindfulness, give it a try! All you need is a brush pen and some patience.',
    imageUrl: 'https://images.unsplash.com/photo-1504198266285-1659872e6590?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80',
    createdAt: Date.now() - 6000000,
    upvotes: 22,
    comments: [
      { id: '601', text: 'Calligraphy has been my go-to too! Any favorite pen brands?', createdAt: Date.now() - 5500000 }
    ]
  },
  {
    id: '7',
    title: 'Sketching Daily: Building a Creative Habit',
    content: 'I challenged myself to sketch something every day for 30 days and it’s changed how I see the world. You start noticing shadows, shapes, and textures you normally ignore.\n\nThe key is consistency, not perfection. Just a few minutes a day makes a huge difference!',
    imageUrl: 'https://images.unsplash.com/photo-1581090700227-1e37b1904180?ixlib=rb-4.0.3&auto=format&fit=crop&w=1469&q=80',
    createdAt: Date.now() - 7000000,
    upvotes: 19,
    comments: []
  },
  {
    id: '8',
    title: 'Making Music with a MIDI Keyboard',
    content: 'Bought a MIDI keyboard a few weeks ago and dove into music production. Even with no formal training, tools like GarageBand and FL Studio make it super approachable.\n\nI’ve been experimenting with lo-fi beats and ambient sounds — it’s addictive!',
    imageUrl: 'https://images.unsplash.com/photo-1603712725038-3b8c3cb2c20b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1450&q=80',
    createdAt: Date.now() - 8000000,
    upvotes: 26,
    comments: [
      { id: '801', text: 'Lo-fi is the best! Share your tracks somewhere?', createdAt: Date.now() - 7500000 }
    ]
  },
  {
    id: '9',
    title: 'Learning Origami: The Art of Paper Folding',
    content: 'Origami has become my quiet escape during stressful weeks. I started with paper cranes and now I’ve folded dragons, flowers, and even modular stars.\n\nIt teaches patience and precision. Plus, it’s super satisfying to finish a complex piece!',
    imageUrl: 'https://images.unsplash.com/photo-1631721032433-ec50f6d6db48?ixlib=rb-4.0.3&auto=format&fit=crop&w=1400&q=80',
    createdAt: Date.now() - 9000000,
    upvotes: 17,
    comments: []
  },
  {
    id: '10',
    title: 'Journaling for Self-Discovery',
    content: 'Started journaling during a difficult time and it’s helped me understand myself better. Some days I write a lot, some days just a sentence or two — both are valid.\n\nI also add little sketches, washi tape, and stickers to make it visually inspiring!',
    imageUrl: 'https://images.unsplash.com/photo-1602029222536-81194f0bc29c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1440&q=80',
    createdAt: Date.now() - 10000000,
    upvotes: 21,
    comments: [
      { id: '1001', text: 'Your journal aesthetic sounds amazing! Any pics?', createdAt: Date.now() - 9500000 }
    ]
  }
];

function App() {
  // Modified to ensure sample posts always appear on first load
  const [posts, setPosts] = useState(() => {
    const savedPosts = localStorage.getItem('hobby-hub-posts');
    // If there are no saved posts or they're empty, use sample posts
    if (!savedPosts || JSON.parse(savedPosts).length === 0) {
      return samplePosts;
    }
    return JSON.parse(savedPosts);
  });
  
  const [sortMethod, setSortMethod] = useState('newest');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    localStorage.setItem('hobby-hub-posts', JSON.stringify(posts));
  }, [posts]);

  // Helper function to sort posts
  const getSortedPosts = () => {
    let filteredPosts = [...posts];
    
    // Filter by search query if present
    if (searchQuery.trim()) {
      filteredPosts = filteredPosts.filter(post => 
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Sort posts
    switch (sortMethod) {
      case 'newest':
        return filteredPosts.sort((a, b) => b.createdAt - a.createdAt);
      case 'oldest':
        return filteredPosts.sort((a, b) => a.createdAt - b.createdAt);
      case 'most-upvotes':
        return filteredPosts.sort((a, b) => b.upvotes - a.upvotes);
      default:
        return filteredPosts;
    }
  };

  const addPost = (newPost) => {
    setPosts(prevPosts => [
      { 
        ...newPost, 
        id: Date.now().toString(),
        createdAt: Date.now(),
        upvotes: 0,
        comments: []
      }, 
      ...prevPosts
    ]);
  };

  const updatePost = (updatedPost) => {
    setPosts(prevPosts => 
      prevPosts.map(post => 
        post.id === updatedPost.id ? updatedPost : post
      )
    );
  };

  const deletePost = (postId) => {
    setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
  };

  const upvotePost = (postId) => {
    setPosts(prevPosts => 
      prevPosts.map(post => 
        post.id === postId ? { ...post, upvotes: post.upvotes + 1 } : post
      )
    );
  };

  const addComment = (postId, comment) => {
    setPosts(prevPosts => 
      prevPosts.map(post => 
        post.id === postId 
          ? { 
              ...post, 
              comments: [
                ...post.comments, 
                { id: Date.now().toString(), text: comment, createdAt: Date.now() }
              ] 
            } 
          : post
      )
    );
  };

  // Function to reset to sample posts (useful if needed)
  const resetToSamplePosts = () => {
    if (window.confirm('This will reset all posts to the default sample posts. Continue?')) {
      setPosts(samplePosts);
    }
  };

  return (
    <Router>
      <div className="app">
        <header className="app-header">
          <h1><Link to="/">HobbyHub</Link></h1>
          <nav>
            <Link to="/" className="nav-link">Home</Link>
            <Link to="/create" className="nav-link btn-primary">Create Post</Link>
          </nav>
        </header>
        
        <Routes>
          <Route path="/" element={
            <Home 
              posts={getSortedPosts()} 
              sortMethod={sortMethod} 
              setSortMethod={setSortMethod}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              resetToSamplePosts={resetToSamplePosts}
            />
          } />
          <Route path="/create" element={<CreatePost addPost={addPost} />} />
          <Route path="/post/:id" element={
            <PostDetail 
              posts={posts} 
              updatePost={updatePost} 
              deletePost={deletePost} 
              upvotePost={upvotePost}
              addComment={addComment}
            />
          } />
          <Route path="/edit/:id" element={
            <EditPost posts={posts} updatePost={updatePost} />
          } />
        </Routes>
        
        <footer className="app-footer">
          <p>HobbyHub - Share your passion © 2025</p>
        </footer>
      </div>
    </Router>
  );
}

function Home({ posts, sortMethod, setSortMethod, searchQuery, setSearchQuery, resetToSamplePosts }) {
  return (
    <div className="home">
      <div className="hero-section">
        <div className="hero-content">
          <h1>Share Your Passion</h1>
          <p>Join our community of hobby enthusiasts and discover new interests</p>
          <Link to="/create" className="btn-hero">Start Sharing</Link>
        </div>
      </div>
      
      <div className="controls">
        <div className="search">
          <input
            type="text"
            placeholder="Search posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="sort">
          <label>Sort by:</label>
          <select value={sortMethod} onChange={(e) => setSortMethod(e.target.value)}>
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="most-upvotes">Most Upvotes</option>
          </select>
        </div>
      </div>
      
      <div className="posts-grid">
        {posts.length > 0 ? (
          posts.map(post => (
            <PostCard key={post.id} post={post} />
          ))
        ) : (
          <div className="no-posts">
            <p>No posts found. Be the first to create a post!</p>
            <button onClick={resetToSamplePosts} className="btn-reset">
              Reset to Sample Posts
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function PostCard({ post }) {
  const navigate = useNavigate();
  
  // Function to truncate content for preview
  const truncateContent = (text, maxLength = 100) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };
  
  const handleClick = () => {
    navigate(`/post/${post.id}`);
  };
  
  return (
    <div className="post-card" onClick={handleClick}>
      {post.imageUrl && (
        <div className="post-card-image">
          <img src={post.imageUrl} alt={post.title} />
        </div>
      )}
      <div className="post-card-content">
        <h2 className="post-title">{post.title}</h2>
        {post.content && (
          <p className="post-excerpt">{truncateContent(post.content)}</p>
        )}
        <div className="post-meta">
          <span className="post-date">{new Date(post.createdAt).toLocaleDateString()}</span>
          <div className="post-stats">
            <span className="post-upvotes">❤️ {post.upvotes}</span>
            <span className="post-comments">💬 {post.comments.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function CreatePost({ addPost }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const navigate = useNavigate();
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    addPost({
      title,
      content,
      imageUrl
    });
    
    navigate('/');
  };
  
  return (
    <div className="create-post">
      <h2>Create a New Post</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Title *</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="Enter post title"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="content">Content</label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Enter post content (optional)"
            rows="6"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="imageUrl">Image URL</label>
          <input
            id="imageUrl"
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="Enter image URL (optional)"
          />
          {imageUrl && (
            <div className="image-preview">
              <img src={imageUrl} alt="Preview" />
            </div>
          )}
        </div>
        
        <button type="submit" className="btn-submit">Create Post</button>
      </form>
    </div>
  );
}

function PostDetail({ posts, updatePost, deletePost, upvotePost, addComment }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [comment, setComment] = useState('');
  
  const post = posts.find(p => p.id === id);
  
  if (!post) {
    return <div className="not-found">Post not found</div>;
  }
  
  const handleUpvote = () => {
    upvotePost(post.id);
  };
  
  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      deletePost(post.id);
      navigate('/');
    }
  };
  
  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    
    addComment(post.id, comment);
    setComment('');
  };
  
  return (
    <div className="post-detail">
      <h1 className="post-title">{post.title}</h1>
      <div className="post-meta">
        <span className="post-date">{new Date(post.createdAt).toLocaleString()}</span>
        <div className="post-actions">
          <button onClick={handleUpvote} className="btn-upvote">❤️ {post.upvotes}</button>
          <button onClick={() => navigate(`/edit/${post.id}`)} className="btn-edit">Edit</button>
          <button onClick={handleDelete} className="btn-delete">Delete</button>
        </div>
      </div>
      
      {post.imageUrl && (
        <div className="post-image">
          <img src={post.imageUrl} alt={post.title} />
        </div>
      )}
      
      {post.content && (
        <div className="post-content">
          {post.content.split('\n\n').map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      )}
      
      <div className="post-comments">
        <h3>Comments ({post.comments.length})</h3>
        <form onSubmit={handleCommentSubmit} className="comment-form">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add a comment..."
            rows="3"
          />
          <button type="submit" className="btn-submit">Post Comment</button>
        </form>
        
        <div className="comments-list">
          {post.comments.length > 0 ? (
            post.comments.map(comment => (
              <div key={comment.id} className="comment">
                <p>{comment.text}</p>
                <span className="comment-date">{new Date(comment.createdAt).toLocaleString()}</span>
              </div>
            ))
          ) : (
            <p>No comments yet. Be the first to comment!</p>
          )}
        </div>
      </div>
    </div>
  );
}

function EditPost({ posts, updatePost }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const post = posts.find(p => p.id === id);
  
  const [title, setTitle] = useState(post ? post.title : '');
  const [content, setContent] = useState(post ? post.content : '');
  const [imageUrl, setImageUrl] = useState(post ? post.imageUrl : '');
  
  if (!post) {
    return <div className="not-found">Post not found</div>;
  }
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    updatePost({
      ...post,
      title,
      content,
      imageUrl
    });
    
    navigate(`/post/${id}`);
  };
  
  return (
    <div className="edit-post">
      <h2>Edit Post</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Title *</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="Enter post title"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="content">Content</label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Enter post content (optional)"
            rows="6"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="imageUrl">Image URL</label>
          <input
            id="imageUrl"
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="Enter image URL (optional)"
          />
          {imageUrl && (
            <div className="image-preview">
              <img src={imageUrl} alt="Preview" />
            </div>
          )}
        </div>
        
        <div className="form-buttons">
          <button type="submit" className="btn-submit">Save Changes</button>
          <button type="button" className="btn-cancel" onClick={() => navigate(`/post/${id}`)}>Cancel</button>
        </div>
      </form>
    </div>
  );
}

export default App;