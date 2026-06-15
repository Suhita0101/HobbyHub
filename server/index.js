import bcrypt from 'bcryptjs';
import cors from 'cors';
import 'dotenv/config';
import express from 'express';
import fs from 'node:fs/promises';
import jwt from 'jsonwebtoken';
import morgan from 'morgan';
import multer from 'multer';
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { initialData } from './sampleData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const dataDir = path.join(__dirname, 'data');
const uploadDir = path.join(__dirname, 'uploads');
const dataFile = path.join(dataDir, 'hobbyhub.json');

const app = express();
const PORT = process.env.PORT || 4300;
const JWT_SECRET = process.env.JWT_SECRET || 'dev-hobbyhub-secret-change-before-deploy';

await fs.mkdir(dataDir, { recursive: true });
await fs.mkdir(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${randomUUID()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      cb(new Error('Only image uploads are allowed.'));
      return;
    }
    cb(null, true);
  },
});

app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }));
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));
app.use('/uploads', express.static(uploadDir));

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(rootDir, 'dist')));
}

async function readData() {
  try {
    const raw = await fs.readFile(dataFile, 'utf8');
    return hydrateData(JSON.parse(raw));
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    const data = hydrateData(structuredClone(initialData));
    await writeData(data);
    return data;
  }
}

async function writeData(data) {
  await fs.writeFile(dataFile, JSON.stringify(data, null, 2));
}

function createToken(user) {
  return jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, {
    expiresIn: '7d',
  });
}

function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    username: user.username,
    avatarUrl: user.avatarUrl || '',
    joinedAt: user.joinedAt,
  };
}

function normalizeUsername(username = '') {
  return username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
}

function hydrateData(data) {
  data.users ||= [];
  data.posts ||= [];
  data.friendships ||= [];
  data.messages ||= [];
  const existingUserIds = new Set(data.users.map((user) => user.id));
  initialData.users.forEach((user) => {
    if (!existingUserIds.has(user.id)) data.users.push(user);
  });
  const existingPostIds = new Set(data.posts.map((post) => post.id));
  initialData.posts.forEach((post) => {
    if (!existingPostIds.has(post.id)) data.posts.push(post);
  });
  data.users = data.users.map((user) => ({ avatarUrl: '', ...user }));
  data.friendships = data.friendships.map((friendship) => ({
    requesterId: friendship.requesterId || friendship.userIds?.[0],
    recipientId: friendship.recipientId || friendship.userIds?.[1],
    status: friendship.status || 'accepted',
    ...friendship,
  }));
  data.posts = data.posts.map((post) => ({
    ...post,
    comments: (post.comments || []).map(normalizeComment),
  }));
  return data;
}

function normalizeComment(comment) {
  return {
    ...comment,
    author: comment.author || { id: 'unknown', name: 'Unknown', username: 'unknown', avatarUrl: '' },
    likes: comment.likes || [],
    replies: (comment.replies || []).map((reply) => ({
      id: reply.id || randomUUID(),
      text: reply.text || '',
      createdAt: reply.createdAt || Date.now(),
      author: reply.author || { id: 'unknown', name: 'Unknown', username: 'unknown', avatarUrl: '' },
      likes: reply.likes || [],
    })),
  };
}

function postView(post, userId) {
  return {
    ...post,
    comments: (post.comments || []).map((comment) => ({
      ...comment,
      likeCount: comment.likes?.length || 0,
      hasLiked: userId ? comment.likes?.includes(userId) : false,
      replies: (comment.replies || []).map((reply) => ({
        ...reply,
        likeCount: reply.likes?.length || 0,
      })),
    })),
    upvotes: post.votes?.length || 0,
    hasVoted: userId ? post.votes?.includes(userId) : false,
  };
}

function authOptional(req, _res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    next();
    return;
  }

  try {
    req.user = jwt.verify(header.slice(7), JWT_SECRET);
  } catch {
    req.user = null;
  }
  next();
}

function requireAuth(req, res, next) {
  authOptional(req, res, () => {
    if (!req.user) {
      res.status(401).json({ message: 'Please sign in to continue.' });
      return;
    }
    next();
  });
}

function authorFromUser(user) {
  return { id: user.id, name: user.name, username: user.username, avatarUrl: user.avatarUrl || '' };
}

function findConnection(data, userId, targetId) {
  return data.friendships.find(
    (friendship) => friendship.userIds.includes(userId) && friendship.userIds.includes(targetId),
  );
}

function connectionStatus(connection, userId) {
  if (!connection) return 'none';
  if (connection.status === 'accepted') return 'accepted';
  return connection.requesterId === userId ? 'pending_sent' : 'pending_received';
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, name: 'HobbyHub API' });
});

app.get('/api/auth/username/:username', async (req, res) => {
  const data = await readData();
  const username = normalizeUsername(req.params.username);
  const available = username.length >= 3 && !data.users.some((user) => user.username === username);

  res.json({ username, available });
});

app.post('/api/auth/register', async (req, res) => {
  const { username, password } = req.body;
  const normalizedUsername = normalizeUsername(username);

  if (!normalizedUsername || !password) {
    res.status(400).json({ message: 'Username and password are required.' });
    return;
  }

  if (normalizedUsername.length < 3) {
    res.status(400).json({ message: 'Username must be at least 3 characters.' });
    return;
  }

  if (password.length < 6) {
    res.status(400).json({ message: 'Password must be at least 6 characters.' });
    return;
  }

  const data = await readData();
  const exists = data.users.some((user) => user.username === normalizedUsername);

  if (exists) {
    res.status(409).json({ message: 'That username is already taken.' });
    return;
  }

  const user = {
    id: randomUUID(),
    name: normalizedUsername,
    username: normalizedUsername,
    avatarUrl: '',
    passwordHash: await bcrypt.hash(password, 12),
    joinedAt: Date.now(),
  };

  data.users.push(user);
  await writeData(data);

  res.status(201).json({ user: publicUser(user), token: createToken(user) });
});

app.post('/api/auth/login', async (req, res) => {
  const { identifier, username, password } = req.body;
  const data = await readData();
  const normalizedIdentifier = normalizeUsername(username || identifier);
  const user = data.users.find((item) => item.username === normalizedIdentifier);

  if (!user || !(await bcrypt.compare(password || '', user.passwordHash))) {
    res.status(401).json({ message: 'Invalid login details.' });
    return;
  }

  res.json({ user: publicUser(user), token: createToken(user) });
});

app.get('/api/auth/me', requireAuth, async (req, res) => {
  const data = await readData();
  const user = data.users.find((item) => item.id === req.user.id);

  if (!user) {
    res.status(401).json({ message: 'Account no longer exists.' });
    return;
  }

  res.json({ user: publicUser(user) });
});

app.put('/api/users/me/avatar', requireAuth, upload.single('avatar'), async (req, res) => {
  const data = await readData();
  const user = data.users.find((item) => item.id === req.user.id);

  if (!user) {
    res.status(401).json({ message: 'Account no longer exists.' });
    return;
  }

  user.avatarUrl = req.file ? `/uploads/${req.file.filename}` : req.body.avatarUrl?.trim() || user.avatarUrl || '';

  data.posts.forEach((post) => {
    if (post.author?.id === user.id) post.author = authorFromUser(user);
    post.comments.forEach((comment) => {
      if (comment.author?.id === user.id) comment.author = authorFromUser(user);
      comment.replies?.forEach((reply) => {
        if (reply.author?.id === user.id) reply.author = authorFromUser(user);
      });
    });
  });

  await writeData(data);
  res.json({ user: publicUser(user) });
});

app.get('/api/users/:username', authOptional, async (req, res) => {
  const data = await readData();
  const username = normalizeUsername(req.params.username);
  const user = data.users.find((item) => item.username === username);

  if (!user) {
    res.status(404).json({ message: 'User not found.' });
    return;
  }

  const profilePosts = data.posts
    .filter((post) => post.author?.id === user.id)
    .sort((a, b) => b.createdAt - a.createdAt)
    .map((post) => postView(post, req.user?.id));
  const friends = data.friendships.filter(
    (friendship) => friendship.status === 'accepted' && friendship.userIds.includes(user.id),
  );
  const connection = req.user ? findConnection(data, req.user.id, user.id) : null;

  res.json({
    user: publicUser(user),
    posts: profilePosts,
    stats: {
      friends: friends.length,
      posts: profilePosts.length,
      cheers: profilePosts.reduce((total, post) => total + post.upvotes, 0),
    },
    connectionStatus: req.user?.id === user.id ? 'self' : connectionStatus(connection, req.user?.id),
    connectionId: connection?.id || null,
    isFriend: connection?.status === 'accepted',
    isSelf: req.user?.id === user.id,
  });
});

app.post('/api/users/:username/friend', requireAuth, async (req, res) => {
  const data = await readData();
  const target = data.users.find((item) => item.username === normalizeUsername(req.params.username));

  if (!target) {
    res.status(404).json({ message: 'User not found.' });
    return;
  }

  if (target.id === req.user.id) {
    res.status(400).json({ message: 'You cannot connect with yourself.' });
    return;
  }

  const userIds = [req.user.id, target.id].sort();
  const existing = findConnection(data, req.user.id, target.id);

  if (existing) {
    res.json({ connectionStatus: connectionStatus(existing, req.user.id), connectionId: existing.id });
    return;
  } else {
    const connection = {
      id: randomUUID(),
      userIds,
      requesterId: req.user.id,
      recipientId: target.id,
      status: 'pending',
      createdAt: Date.now(),
    };
    data.friendships.push(connection);
    await writeData(data);
    res.json({ connectionStatus: 'pending_sent', connectionId: connection.id });
  }
});

app.post('/api/connections/:id/accept', requireAuth, async (req, res) => {
  const data = await readData();
  const connection = data.friendships.find((item) => item.id === req.params.id);

  if (!connection) {
    res.status(404).json({ message: 'Connection request not found.' });
    return;
  }

  if (connection.recipientId !== req.user.id) {
    res.status(403).json({ message: 'Only the recipient can accept this request.' });
    return;
  }

  connection.status = 'accepted';
  connection.acceptedAt = Date.now();
  await writeData(data);
  res.json({ connectionStatus: 'accepted', connectionId: connection.id });
});

app.delete('/api/connections/:id', requireAuth, async (req, res) => {
  const data = await readData();
  const connection = data.friendships.find((item) => item.id === req.params.id);

  if (!connection) {
    res.status(404).json({ message: 'Connection request not found.' });
    return;
  }

  if (!connection.userIds.includes(req.user.id)) {
    res.status(403).json({ message: 'You cannot change this connection.' });
    return;
  }

  data.friendships = data.friendships.filter((item) => item.id !== req.params.id);
  await writeData(data);
  res.status(204).end();
});

app.get('/api/conversations', requireAuth, async (req, res) => {
  const data = await readData();
  const friendIds = data.friendships
    .filter((friendship) => friendship.status === 'accepted' && friendship.userIds.includes(req.user.id))
    .map((friendship) => friendship.userIds.find((id) => id !== req.user.id));

  const conversations = friendIds
    .map((friendId) => {
      const friend = data.users.find((item) => item.id === friendId);
      if (!friend) return null;

      const thread = data.messages
        .filter((message) => message.participantIds.includes(req.user.id) && message.participantIds.includes(friendId))
        .sort((a, b) => b.createdAt - a.createdAt);

      return {
        friend: publicUser(friend),
        lastMessage: thread[0] || null,
      };
    })
    .filter(Boolean);

  res.json(conversations);
});

app.get('/api/connections', requireAuth, async (req, res) => {
  const data = await readData();
  const pending = data.friendships
    .filter((connection) => connection.status === 'pending' && connection.userIds.includes(req.user.id))
    .map((connection) => {
      const otherId = connection.userIds.find((id) => id !== req.user.id);
      const otherUser = data.users.find((user) => user.id === otherId);
      return {
        id: connection.id,
        direction: connection.recipientId === req.user.id ? 'incoming' : 'outgoing',
        user: otherUser ? publicUser(otherUser) : null,
        createdAt: connection.createdAt,
      };
    })
    .filter((connection) => connection.user);

  res.json(pending);
});

app.get('/api/messages/:username', requireAuth, async (req, res) => {
  const data = await readData();
  const friend = data.users.find((item) => item.username === normalizeUsername(req.params.username));

  if (!friend) {
    res.status(404).json({ message: 'User not found.' });
    return;
  }

  const isFriend = data.friendships.some(
    (friendship) =>
      friendship.status === 'accepted' && friendship.userIds.includes(req.user.id) && friendship.userIds.includes(friend.id),
  );

  if (!isFriend) {
    res.status(403).json({ message: 'Connect with this user before messaging.' });
    return;
  }

  const messages = data.messages
    .filter((message) => message.participantIds.includes(req.user.id) && message.participantIds.includes(friend.id))
    .sort((a, b) => a.createdAt - b.createdAt);

  res.json({ friend: publicUser(friend), messages });
});

app.post('/api/messages/:username', requireAuth, async (req, res) => {
  const { text } = req.body;

  if (!text?.trim()) {
    res.status(400).json({ message: 'Message text is required.' });
    return;
  }

  const data = await readData();
  const friend = data.users.find((item) => item.username === normalizeUsername(req.params.username));

  if (!friend) {
    res.status(404).json({ message: 'User not found.' });
    return;
  }

  const isFriend = data.friendships.some(
    (friendship) =>
      friendship.status === 'accepted' && friendship.userIds.includes(req.user.id) && friendship.userIds.includes(friend.id),
  );

  if (!isFriend) {
    res.status(403).json({ message: 'Connect with this user before messaging.' });
    return;
  }

  const message = {
    id: randomUUID(),
    participantIds: [req.user.id, friend.id].sort(),
    senderId: req.user.id,
    text: text.trim(),
    createdAt: Date.now(),
  };

  data.messages.push(message);
  await writeData(data);
  res.status(201).json(message);
});

app.get('/api/posts', authOptional, async (req, res) => {
  const data = await readData();
  const search = req.query.search?.toString().trim().toLowerCase();
  const category = req.query.category?.toString();
  const sort = req.query.sort?.toString() || 'newest';

  let posts = [...data.posts];

  if (search) {
    posts = posts.filter((post) =>
      [post.title, post.content, post.category, post.author?.name, post.author?.username]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(search)),
    );
  }

  if (category && category !== 'All') {
    posts = posts.filter((post) => post.category === category);
  }

  posts.sort((a, b) => {
    if (sort === 'oldest') return a.createdAt - b.createdAt;
    if (sort === 'top') return (b.votes?.length || 0) - (a.votes?.length || 0);
    if (sort === 'comments') return (b.comments?.length || 0) - (a.comments?.length || 0);
    return b.createdAt - a.createdAt;
  });

  res.json(posts.map((post) => postView(post, req.user?.id)));
});

app.get('/api/posts/:id', authOptional, async (req, res) => {
  const data = await readData();
  const post = data.posts.find((item) => item.id === req.params.id);

  if (!post) {
    res.status(404).json({ message: 'Post not found.' });
    return;
  }

  res.json(postView(post, req.user?.id));
});

app.post('/api/posts', requireAuth, upload.single('image'), async (req, res) => {
  const { title, content, category, imageUrl } = req.body;

  if (!title?.trim() || !content?.trim()) {
    res.status(400).json({ message: 'Title and story are required.' });
    return;
  }

  const data = await readData();
  const user = data.users.find((item) => item.id === req.user.id);

  if (!user) {
    res.status(401).json({ message: 'Account no longer exists.' });
    return;
  }

  const post = {
    id: randomUUID(),
    title: title.trim(),
    content: content.trim(),
    category: category?.trim() || 'General',
    imageUrl: req.file ? `/uploads/${req.file.filename}` : imageUrl?.trim() || '',
    createdAt: Date.now(),
    author: authorFromUser(user),
    votes: [],
    comments: [],
  };

  data.posts.unshift(post);
  await writeData(data);
  res.status(201).json(postView(post, user.id));
});

app.put('/api/posts/:id', requireAuth, upload.single('image'), async (req, res) => {
  const data = await readData();
  const post = data.posts.find((item) => item.id === req.params.id);

  if (!post) {
    res.status(404).json({ message: 'Post not found.' });
    return;
  }

  if (post.author?.id !== req.user.id) {
    res.status(403).json({ message: 'You can only edit your own posts.' });
    return;
  }

  post.title = req.body.title?.trim() || post.title;
  post.content = req.body.content?.trim() || post.content;
  post.category = req.body.category?.trim() || post.category;
  post.imageUrl = req.file ? `/uploads/${req.file.filename}` : req.body.imageUrl?.trim() || post.imageUrl;

  await writeData(data);
  res.json(postView(post, req.user.id));
});

app.delete('/api/posts/:id', requireAuth, async (req, res) => {
  const data = await readData();
  const post = data.posts.find((item) => item.id === req.params.id);

  if (!post) {
    res.status(404).json({ message: 'Post not found.' });
    return;
  }

  if (post.author?.id !== req.user.id) {
    res.status(403).json({ message: 'You can only delete your own posts.' });
    return;
  }

  data.posts = data.posts.filter((item) => item.id !== req.params.id);
  await writeData(data);
  res.status(204).end();
});

app.post('/api/posts/:id/vote', requireAuth, async (req, res) => {
  const data = await readData();
  const post = data.posts.find((item) => item.id === req.params.id);

  if (!post) {
    res.status(404).json({ message: 'Post not found.' });
    return;
  }

  post.votes ||= [];
  if (post.votes.includes(req.user.id)) {
    post.votes = post.votes.filter((id) => id !== req.user.id);
  } else {
    post.votes.push(req.user.id);
  }

  await writeData(data);
  res.json(postView(post, req.user.id));
});

app.post('/api/posts/:id/comments', requireAuth, async (req, res) => {
  const { text } = req.body;

  if (!text?.trim()) {
    res.status(400).json({ message: 'Comment text is required.' });
    return;
  }

  const data = await readData();
  const post = data.posts.find((item) => item.id === req.params.id);
  const user = data.users.find((item) => item.id === req.user.id);

  if (!post) {
    res.status(404).json({ message: 'Post not found.' });
    return;
  }

  if (!user) {
    res.status(401).json({ message: 'Account no longer exists.' });
    return;
  }

  const comment = {
    id: randomUUID(),
    text: text.trim(),
    createdAt: Date.now(),
    author: authorFromUser(user),
    likes: [],
    replies: [],
  };

  post.comments.push(comment);
  await writeData(data);
  res.status(201).json(postView(post, user.id));
});

app.post('/api/posts/:postId/comments/:commentId/like', requireAuth, async (req, res) => {
  const data = await readData();
  const post = data.posts.find((item) => item.id === req.params.postId);
  const comment = post?.comments.find((item) => item.id === req.params.commentId);

  if (!post || !comment) {
    res.status(404).json({ message: 'Comment not found.' });
    return;
  }

  comment.likes ||= [];
  if (comment.likes.includes(req.user.id)) {
    comment.likes = comment.likes.filter((id) => id !== req.user.id);
  } else {
    comment.likes.push(req.user.id);
  }

  await writeData(data);
  res.json(postView(post, req.user.id));
});

app.post('/api/posts/:postId/comments/:commentId/replies', requireAuth, async (req, res) => {
  const { text } = req.body;

  if (!text?.trim()) {
    res.status(400).json({ message: 'Reply text is required.' });
    return;
  }

  const data = await readData();
  const post = data.posts.find((item) => item.id === req.params.postId);
  const comment = post?.comments.find((item) => item.id === req.params.commentId);
  const user = data.users.find((item) => item.id === req.user.id);

  if (!post || !comment) {
    res.status(404).json({ message: 'Comment not found.' });
    return;
  }

  if (!user) {
    res.status(401).json({ message: 'Account no longer exists.' });
    return;
  }

  comment.replies ||= [];
  comment.replies.push({
    id: randomUUID(),
    text: text.trim(),
    createdAt: Date.now(),
    author: authorFromUser(user),
    likes: [],
  });

  await writeData(data);
  res.status(201).json(postView(post, req.user.id));
});

if (process.env.NODE_ENV === 'production') {
  app.get('*', (_req, res) => {
    res.sendFile(path.join(rootDir, 'dist', 'index.html'));
  });
}

app.use((error, _req, res, _next) => {
  res.status(400).json({ message: error.message || 'Something went wrong.' });
});

app.listen(PORT, () => {
  console.log(`HobbyHub API running at http://localhost:${PORT}`);
});
