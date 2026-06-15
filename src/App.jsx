import { useCallback, useEffect, useMemo, useState } from 'react';
import { BrowserRouter as Router, Link, Route, Routes, useNavigate, useParams } from 'react-router-dom';
import './App.css';

const categories = ['All', 'Art', 'Outdoors', 'Making', 'Photography', 'Music', 'Food', 'Wellness', 'Gaming', 'General'];
const tokenKey = 'hobbyhub-token';

function getImageUrl(url) {
  if (!url) return '';
  return url.startsWith('/uploads') ? url : url;
}

function handleImageError(event) {
  const image = event.currentTarget;
  const frame = image.parentElement;
  frame?.classList.add('image-failed');
  image.hidden = true;
  image.removeAttribute('src');
}

function formatDate(timestamp) {
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).format(
    new Date(timestamp),
  );
}

function relativeTime(timestamp) {
  const seconds = Math.max(1, Math.floor((Date.now() - timestamp) / 1000));
  const units = [
    ['year', 31536000],
    ['month', 2592000],
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60],
  ];

  for (const [unit, value] of units) {
    const amount = Math.floor(seconds / value);
    if (amount >= 1) return `${amount}${unit[0]} ago`;
  }

  return 'just now';
}

function App() {
  const [token, setToken] = useState(() => localStorage.getItem(tokenKey));
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [sortMethod, setSortMethod] = useState('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [notice, setNotice] = useState('');

  const api = useMemo(
    () => async (path, options = {}) => {
      const headers = { ...(options.headers || {}) };
      if (token) headers.Authorization = `Bearer ${token}`;
      if (options.body && !(options.body instanceof FormData)) headers['Content-Type'] = 'application/json';

      const response = await fetch(path, { ...options, headers });
      if (response.status === 204) return null;
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || 'Request failed.');
      return data;
    },
    [token],
  );

  const loadPosts = useCallback(() => {
    const params = new URLSearchParams({ sort: sortMethod, search: searchQuery, category });
    setIsLoading(true);
    api(`/api/posts?${params}`)
      .then(setPosts)
      .catch((error) => setNotice(error.message))
      .finally(() => setIsLoading(false));
  }, [api, category, searchQuery, sortMethod]);

  useEffect(() => {
    if (!token) {
      setUser(null);
      return;
    }

    api('/api/auth/me')
      .then(({ user: nextUser }) => setUser(nextUser))
      .catch(() => {
        localStorage.removeItem(tokenKey);
        setToken(null);
      });
  }, [api, token]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  function saveSession({ token: nextToken, user: nextUser }) {
    localStorage.setItem(tokenKey, nextToken);
    setToken(nextToken);
    setUser(nextUser);
  }

  function signOut() {
    localStorage.removeItem(tokenKey);
    setToken(null);
    setUser(null);
    setNotice('Signed out. You can still explore the feed.');
  }

  function replacePost(updatedPost) {
    setPosts((current) => current.map((post) => (post.id === updatedPost.id ? updatedPost : post)));
  }

  return (
    <Router>
      <div className="app">
        <header className="app-header">
          <Link to="/" className="brand">
            <span className="brand-mark">HH</span>
            <span>
              <strong>HobbyHub</strong>
              <small>Find your people</small>
            </span>
          </Link>

          <nav>
            <Link to="/" className="nav-link">Explore</Link>
            {user && <Link to="/messages" className="nav-link">Messages</Link>}
            <Link to="/create" className="nav-link btn-primary">Post</Link>
            {user ? (
              <div className="user-chip">
                <Link to={`/u/${user.username}`}>@{user.username}</Link>
                <button type="button" onClick={signOut}>Sign out</button>
              </div>
            ) : (
              <Link to="/auth" className="nav-link">Sign in</Link>
            )}
          </nav>
        </header>

        {notice && (
          <button className="notice" type="button" onClick={() => setNotice('')}>
            {notice}
          </button>
        )}

        <Routes>
          <Route
            path="/"
            element={
              <Home
                posts={posts}
                isLoading={isLoading}
                sortMethod={sortMethod}
                setSortMethod={setSortMethod}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                category={category}
                setCategory={setCategory}
                user={user}
              />
            }
          />
          <Route path="/auth" element={<AuthPage api={api} saveSession={saveSession} />} />
          <Route path="/create" element={<PostForm api={api} user={user} setNotice={setNotice} />} />
          <Route
            path="/post/:id"
            element={<PostDetail api={api} user={user} replacePost={replacePost} setNotice={setNotice} />}
          />
          <Route path="/edit/:id" element={<PostForm api={api} user={user} setNotice={setNotice} editMode />} />
          <Route path="/u/:username" element={<ProfilePage api={api} user={user} setUser={setUser} setNotice={setNotice} />} />
          <Route path="/messages" element={<MessagesPage api={api} user={user} />} />
          <Route path="/messages/:username" element={<MessagesPage api={api} user={user} />} />
        </Routes>

        <footer className="app-footer">
          <span>HobbyHub</span>
          <span>Post, connect, and message around the hobbies that keep you curious.</span>
        </footer>
      </div>
    </Router>
  );
}

function Home({ posts, isLoading, sortMethod, setSortMethod, searchQuery, setSearchQuery, category, setCategory, user }) {
  const featured = posts.slice(0, 3);

  return (
    <main className="home">
      <section className="hero-section">
        <div className="hero-copy">
          <p className="eyebrow">A social club for hobbies in motion</p>
          <h1>Turn your daily interests into a circle of people.</h1>
          <p>
            Share progress, ask opinions, cheer for other makers, connect with people you like, and keep the
            conversation going privately.
          </p>
          <div className="hero-actions">
            <Link to={user ? '/create' : '/auth'} className="btn-hero">{user ? 'Share an update' : 'Claim a username'}</Link>
            <a href="#feed" className="btn-ghost">See the feed</a>
          </div>
        </div>

        <div className="hero-showcase" aria-label="Featured HobbyHub posts">
          {featured.map((post, index) => (
            <Link key={post.id} to={`/post/${post.id}`} className={`showcase-card card-${index + 1}`}>
              {post.imageUrl && <img src={getImageUrl(post.imageUrl)} alt="" onError={handleImageError} />}
              <span>{post.category}</span>
              <strong>{post.title}</strong>
            </Link>
          ))}
        </div>
      </section>

      <section className="community-strip">
        <div>
          <strong>{posts.length}</strong>
          <span>shared stories</span>
        </div>
        <div>
          <strong>{posts.reduce((total, post) => total + post.comments.length, 0)}</strong>
          <span>open discussions</span>
        </div>
        <div>
          <strong>{posts.reduce((total, post) => total + post.upvotes, 0)}</strong>
          <span>cheers given</span>
        </div>
      </section>

      <section className="feed-shell" id="feed">
        <aside className="category-rail">
          <span className="rail-label">Browse circles</span>
          {categories.map((item) => (
            <button
              key={item}
              type="button"
              className={category === item ? 'active' : ''}
              onClick={() => setCategory(item)}
            >
              {item}
            </button>
          ))}
        </aside>

        <div className="feed-main">
          <div className="controls">
            <label className="search">
              <span>Search the clubhouse</span>
              <input
                type="text"
                placeholder="Painting, plants, sourdough, cameras..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
              />
            </label>

            <label className="sort">
              <span>Sort</span>
              <select value={sortMethod} onChange={(event) => setSortMethod(event.target.value)}>
                <option value="newest">Newest</option>
                <option value="top">Top</option>
                <option value="comments">Most discussed</option>
                <option value="oldest">Oldest</option>
              </select>
            </label>
          </div>

          {isLoading ? (
            <div className="empty-state">Loading the latest hobby stories...</div>
          ) : posts.length > 0 ? (
            <div className="posts-grid">
              {posts.map((post) => <PostCard key={post.id} post={post} />)}
            </div>
          ) : (
            <div className="empty-state">
              <h2>No posts found</h2>
              <p>Try another category or start the conversation yourself.</p>
              <Link to={user ? '/create' : '/auth'} className="btn-primary text-link">Start posting</Link>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function PostCard({ post }) {
  return (
    <article className="post-card">
      {post.imageUrl && (
        <Link to={`/post/${post.id}`} className="post-card-image" data-fallback={post.category}>
          <img src={getImageUrl(post.imageUrl)} alt="" onError={handleImageError} />
        </Link>
      )}
      <div className="post-card-content">
        <div className="post-card-meta">
          <span>{post.category}</span>
          <span>{relativeTime(post.createdAt)}</span>
        </div>
        <Link to={`/post/${post.id}`} className="post-title">{post.title}</Link>
        <p className="post-excerpt">{post.content}</p>
        <div className="author-row">
          <Avatar user={post.author} />
          <Link to={`/u/${post.author?.username}`}>@{post.author?.username}</Link>
        </div>
        <div className="post-footer">
          <span>{post.upvotes} cheers</span>
          <span>{post.comments.length} comments</span>
        </div>
      </div>
    </article>
  );
}

function AuthPage({ api, saveSession }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ username: '', password: '' });
  const [availability, setAvailability] = useState(null);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: name === 'username' ? value.toLowerCase() : value }));
  }

  useEffect(() => {
    if (mode !== 'register' || form.username.trim().length < 3) {
      setAvailability(null);
      return;
    }

    const timer = window.setTimeout(() => {
      api(`/api/auth/username/${form.username}`)
        .then(setAvailability)
        .catch(() => setAvailability(null));
    }, 250);

    return () => window.clearTimeout(timer);
  }, [api, form.username, mode]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const session = await api(`/api/auth/${mode === 'register' ? 'register' : 'login'}`, {
        method: 'POST',
        body: JSON.stringify({ username: form.username, password: form.password }),
      });
      saveSession(session);
      navigate('/');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-copy">
        <p className="eyebrow">No email wall</p>
        <h1>{mode === 'register' ? 'Pick a username and start posting.' : 'Welcome back to HobbyHub.'}</h1>
        <p>
          Your username is your public identity. Your password is hashed on the server, and the app stores only
          a login token in your browser after sign in.
        </p>
      </section>

      <form className="auth-card glass-card" onSubmit={handleSubmit}>
        <div className="segmented">
          <button type="button" className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>
            Sign in
          </button>
          <button type="button" className={mode === 'register' ? 'active' : ''} onClick={() => setMode('register')}>
            Register
          </button>
        </div>

        <label>
          Username
          <input name="username" value={form.username} onChange={updateField} minLength="3" required />
        </label>

        {mode === 'register' && availability && (
          <p className={availability.available ? 'availability good' : 'availability bad'}>
            @{availability.username} is {availability.available ? 'available' : 'already taken'}
          </p>
        )}

        <label>
          Password
          <input name="password" type="password" value={form.password} onChange={updateField} minLength="6" required />
        </label>

        {error && <p className="form-error">{error}</p>}

        <button type="submit" className="btn-submit" disabled={isSubmitting || (mode === 'register' && availability?.available === false)}>
          {isSubmitting ? 'Working...' : mode === 'register' ? 'Create account' : 'Sign in'}
        </button>
      </form>
    </main>
  );
}

function PostForm({ api, user, setNotice, editMode = false }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', content: '', category: 'General', imageUrl: '' });
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!editMode) return;

    api(`/api/posts/${id}`)
      .then((post) => {
        setForm({
          title: post.title,
          content: post.content,
          category: post.category || 'General',
          imageUrl: post.imageUrl || '',
        });
        setPreview(post.imageUrl || '');
      })
      .catch((requestError) => setError(requestError.message));
  }, [api, editMode, id]);

  useEffect(() => {
    if (!imageFile) return undefined;
    const nextPreview = URL.createObjectURL(imageFile);
    setPreview(nextPreview);
    return () => URL.revokeObjectURL(nextPreview);
  }, [imageFile]);

  if (!user) {
    return (
      <main className="gate">
        <h1>Sign in to share your hobbies.</h1>
        <p>Create an account to publish posts, upload pictures, connect, and message people.</p>
        <Link to="/auth" className="btn-primary text-link">Sign in or register</Link>
      </main>
    );
  }

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    const body = new FormData();
    body.append('title', form.title);
    body.append('content', form.content);
    body.append('category', form.category);
    body.append('imageUrl', form.imageUrl);
    if (imageFile) body.append('image', imageFile);

    try {
      const post = await api(editMode ? `/api/posts/${id}` : '/api/posts', {
        method: editMode ? 'PUT' : 'POST',
        body,
      });
      setNotice(editMode ? 'Post updated.' : 'Post published.');
      navigate(`/post/${post.id}`);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="editor-page">
      <form className="editor-card glass-card" onSubmit={handleSubmit}>
        <div>
          <p className="eyebrow">{editMode ? 'Refine your post' : 'Start a new discussion'}</p>
          <h1>{editMode ? 'Edit hobby story' : 'Share today in your hobby life'}</h1>
        </div>

        <label>
          Title
          <input name="title" value={form.title} onChange={updateField} placeholder="What are you sharing?" required />
        </label>

        <label>
          Category
          <select name="category" value={form.category} onChange={updateField}>
            {categories.filter((item) => item !== 'All').map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </label>

        <label>
          Story
          <textarea
            name="content"
            value={form.content}
            onChange={updateField}
            placeholder="Share progress, opinions, questions, links, or what you learned today."
            rows="8"
            required
          />
        </label>

        <div className="upload-grid">
          <label className="file-drop">
            <span>Upload a picture</span>
            <input type="file" accept="image/*" onChange={(event) => setImageFile(event.target.files?.[0] || null)} />
          </label>
          <label>
            Or paste image URL
            <input name="imageUrl" type="url" value={form.imageUrl} onChange={updateField} placeholder="https://..." />
          </label>
        </div>

        {preview && (
          <div className="image-preview">
            <img src={getImageUrl(preview)} alt="Selected upload preview" />
          </div>
        )}

        {error && <p className="form-error">{error}</p>}

        <div className="form-buttons">
          <button type="submit" className="btn-submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : editMode ? 'Save changes' : 'Publish post'}
          </button>
          <button type="button" className="btn-cancel" onClick={() => navigate(-1)}>Cancel</button>
        </div>
      </form>
    </main>
  );
}

function PostDetail({ api, user, replacePost, setNotice }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [comment, setComment] = useState('');
  const [replyText, setReplyText] = useState({});
  const [openReply, setOpenReply] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    api(`/api/posts/${id}`)
      .then(setPost)
      .catch((requestError) => setError(requestError.message))
      .finally(() => setIsLoading(false));
  }, [api, id]);

  if (isLoading) return <main className="empty-state page-state">Loading post...</main>;
  if (error) return <main className="empty-state page-state">{error}</main>;
  if (!post) return <main className="empty-state page-state">Post not found.</main>;

  const isOwner = user?.id === post.author?.id;

  async function vote() {
    if (!user) {
      navigate('/auth');
      return;
    }

    const updatedPost = await api(`/api/posts/${post.id}/vote`, { method: 'POST' });
    setPost(updatedPost);
    replacePost(updatedPost);
  }

  async function submitComment(event) {
    event.preventDefault();
    if (!comment.trim()) return;
    if (!user) {
      navigate('/auth');
      return;
    }

    const updatedPost = await api(`/api/posts/${post.id}/comments`, {
      method: 'POST',
      body: JSON.stringify({ text: comment }),
    });
    setComment('');
    setPost(updatedPost);
    replacePost(updatedPost);
  }

  async function likeComment(commentId) {
    if (!user) {
      navigate('/auth');
      return;
    }

    const updatedPost = await api(`/api/posts/${post.id}/comments/${commentId}/like`, { method: 'POST' });
    setPost(updatedPost);
    replacePost(updatedPost);
  }

  async function submitReply(event, commentId) {
    event.preventDefault();
    const text = replyText[commentId]?.trim();
    if (!text) return;
    if (!user) {
      navigate('/auth');
      return;
    }

    const updatedPost = await api(`/api/posts/${post.id}/comments/${commentId}/replies`, {
      method: 'POST',
      body: JSON.stringify({ text }),
    });
    setReplyText((current) => ({ ...current, [commentId]: '' }));
    setOpenReply('');
    setPost(updatedPost);
    replacePost(updatedPost);
  }

  async function deletePost() {
    if (!window.confirm('Delete this post?')) return;
    await api(`/api/posts/${post.id}`, { method: 'DELETE' });
    setNotice('Post deleted.');
    navigate('/');
  }

  return (
    <main className="post-detail">
      <article className="detail-article glass-card">
        <div className="detail-kicker">
          <span>{post.category}</span>
          <span>{formatDate(post.createdAt)}</span>
        </div>
        <h1>{post.title}</h1>
        <Link to={`/u/${post.author?.username}`} className="detail-author">
          <Avatar user={post.author} />
          <div>
            <strong>@{post.author?.username}</strong>
            <span>View profile</span>
          </div>
        </Link>

        {post.imageUrl && (
          <div className="post-image" data-fallback={post.category}>
            <img src={getImageUrl(post.imageUrl)} alt="" onError={handleImageError} />
          </div>
        )}

        <div className="post-content">
          {post.content.split('\n').filter(Boolean).map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        </div>

        <div className="detail-actions">
          <button type="button" className={post.hasVoted ? 'btn-upvote active' : 'btn-upvote'} onClick={vote}>
            {post.hasVoted ? 'Cheered' : 'Cheer'} - {post.upvotes}
          </button>
          {!isOwner && post.author?.username && (
            <button type="button" className="btn-edit" onClick={() => navigate(`/u/${post.author.username}`)}>Connect</button>
          )}
          {isOwner && (
            <>
              <button type="button" className="btn-edit" onClick={() => navigate(`/edit/${post.id}`)}>Edit</button>
              <button type="button" className="btn-delete" onClick={deletePost}>Delete</button>
            </>
          )}
        </div>
      </article>

      <section className="post-comments glass-card">
        <div className="comments-header">
          <h2>Discussion</h2>
          <span>{post.comments.length}</span>
        </div>

        <form className="comment-form" onSubmit={submitComment}>
          <Avatar user={user} />
          <textarea
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            placeholder={user ? 'Add your opinion or advice...' : 'Sign in to comment'}
            disabled={!user}
            rows="3"
          />
          <button type="submit" className="btn-post-comment" disabled={!user || !comment.trim()}>
            Comment
          </button>
        </form>

        <div className="comments-section">
          {[...post.comments].sort((a, b) => b.createdAt - a.createdAt).map((item) => (
            <div key={item.id} className="comment">
              <Avatar user={item.author} />
              <div className="comment-content">
                <div className="comment-header-row">
                  <Link to={`/u/${item.author?.username}`}>@{item.author?.username}</Link>
                  <span>{relativeTime(item.createdAt)}</span>
                </div>
                <p>{item.text}</p>
                <div className="comment-actions">
                  <button type="button" className={item.hasLiked ? 'active' : ''} onClick={() => likeComment(item.id)}>
                    Like {item.likeCount ? `(${item.likeCount})` : ''}
                  </button>
                  <button type="button" onClick={() => setOpenReply(openReply === item.id ? '' : item.id)}>
                    Reply
                  </button>
                </div>
                {openReply === item.id && (
                  <form className="reply-form" onSubmit={(event) => submitReply(event, item.id)}>
                    <input
                      value={replyText[item.id] || ''}
                      onChange={(event) => setReplyText((current) => ({ ...current, [item.id]: event.target.value }))}
                      placeholder="Reply to this comment..."
                    />
                    <button type="submit" className="btn-submit" disabled={!replyText[item.id]?.trim()}>Send</button>
                  </form>
                )}
                {item.replies?.length > 0 && (
                  <div className="reply-list">
                    {item.replies.map((reply) => (
                      <div key={reply.id} className="reply">
                        <Avatar user={reply.author} />
                        <div>
                          <div className="comment-header-row">
                            <Link to={`/u/${reply.author?.username}`}>@{reply.author?.username}</Link>
                            <span>{relativeTime(reply.createdAt)}</span>
                          </div>
                          <p>{reply.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {post.comments.length === 0 && <div className="empty-comments">No comments yet. Start the discussion.</div>}
        </div>
      </section>
    </main>
  );
}

function ProfilePage({ api, user, setUser, setNotice }) {
  const { username } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState('');

  const loadProfile = useCallback(() => {
    api(`/api/users/${username}`)
      .then(setProfile)
      .catch((requestError) => setError(requestError.message));
  }, [api, username]);

  useEffect(() => {
    setProfile(null);
    setError('');
    loadProfile();
  }, [loadProfile]);

  async function toggleConnect() {
    if (!user) {
      navigate('/auth');
      return;
    }

    const result = await api(`/api/users/${username}/friend`, { method: 'POST' });
    setNotice(
      result.connectionStatus === 'pending_sent'
        ? `Connection request sent to @${username}.`
        : `Connection with @${username} is ${result.connectionStatus}.`,
    );
    loadProfile();
  }

  async function acceptConnection() {
    const result = await api(`/api/connections/${profile.connectionId}/accept`, { method: 'POST' });
    setNotice(result.connectionStatus === 'accepted' ? `You are now connected with @${username}.` : 'Connection updated.');
    loadProfile();
  }

  async function removeConnection() {
    await api(`/api/connections/${profile.connectionId}`, { method: 'DELETE' });
    setNotice(`Connection with @${username} removed.`);
    loadProfile();
  }

  async function updateAvatar(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const body = new FormData();
    body.append('avatar', file);
    const { user: updatedUser } = await api('/api/users/me/avatar', { method: 'PUT', body });
    setUser(updatedUser);
    setNotice('Profile picture updated.');
    loadProfile();
  }

  if (error) return <main className="empty-state page-state">{error}</main>;
  if (!profile) return <main className="empty-state page-state">Loading profile...</main>;

  return (
    <main className="profile-page">
      <section className="profile-hero glass-card">
        <div className="profile-avatar-wrap">
          <Avatar user={profile.user} />
          {profile.isSelf && (
            <label className="avatar-upload">
              Change
              <input type="file" accept="image/*" onChange={updateAvatar} />
            </label>
          )}
        </div>
        <div>
          <p className="eyebrow">HobbyHub profile</p>
          <h1>@{profile.user.username}</h1>
          <p>Member since {formatDate(profile.user.joinedAt)}</p>
        </div>
        <div className="profile-actions">
          {!profile.isSelf && profile.connectionStatus === 'none' && (
            <button type="button" className="btn-submit" onClick={toggleConnect}>
              Connect
            </button>
          )}
          {!profile.isSelf && profile.connectionStatus === 'pending_sent' && (
            <button type="button" className="btn-cancel" disabled>
              Request sent
            </button>
          )}
          {!profile.isSelf && profile.connectionStatus === 'pending_received' && (
            <button type="button" className="btn-submit" onClick={acceptConnection}>
              Accept request
            </button>
          )}
          {!profile.isSelf && profile.connectionStatus === 'accepted' && (
            <button type="button" className="btn-cancel" onClick={removeConnection}>
              Connected
            </button>
          )}
          {(profile.connectionStatus === 'accepted' || profile.isSelf) && (
            <button type="button" className="btn-cancel" onClick={() => navigate(profile.isSelf ? '/messages' : `/messages/${profile.user.username}`)}>
              Message
            </button>
          )}
        </div>
      </section>

      <section className="profile-stats">
        <div><strong>{profile.stats.friends}</strong><span>friends</span></div>
        <div><strong>{profile.stats.posts}</strong><span>posts</span></div>
        <div><strong>{profile.stats.cheers}</strong><span>cheers</span></div>
      </section>

      <section className="profile-posts">
        <h2>Posts by @{profile.user.username}</h2>
        {profile.posts.length > 0 ? (
          <div className="posts-grid">{profile.posts.map((post) => <PostCard key={post.id} post={post} />)}</div>
        ) : (
          <div className="empty-state">No posts yet.</div>
        )}
      </section>
    </main>
  );
}

function MessagesPage({ api, user }) {
  const { username } = useParams();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [requests, setRequests] = useState([]);
  const [thread, setThread] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadConnections = useCallback(() => {
    if (!user) return;
    api('/api/connections')
      .then(setRequests)
      .catch((requestError) => setError(requestError.message));
  }, [api, user]);

  const loadConversations = useCallback(() => {
    if (!user) return;
    api('/api/conversations')
      .then(setConversations)
      .catch((requestError) => setError(requestError.message));
  }, [api, user]);

  useEffect(() => {
    if (!user) return;
    loadConnections();
    loadConversations();
  }, [loadConnections, loadConversations, user]);

  useEffect(() => {
    if (!user || !username) {
      setThread(null);
      return;
    }

    api(`/api/messages/${username}`)
      .then(setThread)
      .catch((requestError) => setError(requestError.message));
  }, [api, user, username]);

  if (!user) {
    return (
      <main className="gate">
        <h1>Sign in to message friends.</h1>
        <p>Connect with people from their profiles, then keep the conversation going here.</p>
        <Link to="/auth" className="btn-primary text-link">Sign in</Link>
      </main>
    );
  }

  async function sendMessage(event) {
    event.preventDefault();
    if (!message.trim() || !username) return;
    const sent = await api(`/api/messages/${username}`, {
      method: 'POST',
      body: JSON.stringify({ text: message }),
    });
    setThread((current) => ({ ...current, messages: [...(current?.messages || []), sent] }));
    setMessage('');
  }

  async function acceptRequest(connection) {
    await api(`/api/connections/${connection.id}/accept`, { method: 'POST' });
    await loadConnections();
    await loadConversations();
    navigate(`/messages/${connection.user.username}`);
  }

  async function declineRequest(connection) {
    await api(`/api/connections/${connection.id}`, { method: 'DELETE' });
    await loadConnections();
  }

  const incomingRequests = requests.filter((request) => request.direction === 'incoming');
  const outgoingRequests = requests.filter((request) => request.direction === 'outgoing');

  return (
    <main className="messages-page">
      <aside className="conversation-list glass-card">
        <h1>Messages</h1>
        {incomingRequests.length > 0 && (
          <div className="request-panel">
            <h2>Connection requests</h2>
            {incomingRequests.map((request) => (
              <div key={request.id} className="request-card">
                <Avatar user={request.user} />
                <span>@{request.user.username}</span>
                <div>
                  <button type="button" className="btn-submit" onClick={() => acceptRequest(request)}>Accept</button>
                  <button type="button" className="btn-cancel" onClick={() => declineRequest(request)}>Decline</button>
                </div>
              </div>
            ))}
          </div>
        )}
        {outgoingRequests.length > 0 && (
          <div className="request-panel subtle">
            <h2>Sent requests</h2>
            {outgoingRequests.map((request) => (
              <div key={request.id} className="request-card">
                <Avatar user={request.user} />
                <span>@{request.user.username}</span>
                <small>Waiting for acceptance</small>
              </div>
            ))}
          </div>
        )}
        {conversations.length > 0 ? (
          conversations.map((conversation) => (
            <button
              key={conversation.friend.id}
              type="button"
              className={username === conversation.friend.username ? 'active' : ''}
              onClick={() => navigate(`/messages/${conversation.friend.username}`)}
            >
              <Avatar user={conversation.friend} />
              <span>
                <strong>@{conversation.friend.username}</strong>
                <small>{conversation.lastMessage?.text || 'Start the chat'}</small>
              </span>
            </button>
          ))
        ) : (
          <p className="muted">Connect with someone from a profile to start messaging.</p>
        )}
      </aside>

      <section className="message-thread glass-card">
        {error && <p className="form-error">{error}</p>}
        {thread ? (
          <>
            <div className="thread-header">
              <Avatar user={thread.friend} />
              <div>
                <strong>@{thread.friend.username}</strong>
                <span>Private conversation</span>
              </div>
            </div>
            <div className="message-list">
              {thread.messages.map((item) => (
                <div key={item.id} className={item.senderId === user.id ? 'message mine' : 'message'}>
                  <p>{item.text}</p>
                  <span>{relativeTime(item.createdAt)}</span>
                </div>
              ))}
              {thread.messages.length === 0 && <div className="empty-comments">No messages yet.</div>}
            </div>
            <form className="message-form" onSubmit={sendMessage}>
              <input value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Write a message..." />
              <button type="submit" className="btn-submit" disabled={!message.trim()}>Send</button>
            </form>
          </>
        ) : (
          <div className="empty-state">Choose a connected friend to open a private conversation.</div>
        )}
      </section>
    </main>
  );
}

function Avatar({ user }) {
  const label = user?.name || user?.username || 'Guest';
  return (
    <span className="avatar" aria-label={label}>
      {user?.avatarUrl ? <img src={getImageUrl(user.avatarUrl)} alt="" /> : label.slice(0, 1).toUpperCase()}
    </span>
  );
}

export default App;
