import React, { createContext, useContext, useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate, useParams, Navigate } from 'react-router-dom';
import { onAuthStateChanged, signInWithPopup, signOut, User } from 'firebase/auth';
import { doc, getDoc, setDoc, collection, query, where, onSnapshot, orderBy, limit, addDoc, updateDoc, deleteDoc, Timestamp, increment } from 'firebase/firestore';
import { auth, db, googleProvider, githubProvider } from './firebase';
import { UserProfile, Post, Comment, UserRole } from './types';
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  BarChart3, 
  Plus, 
  Search, 
  Menu, 
  X, 
  ChevronRight, 
  Mail, 
  Github, 
  LogOut, 
  Settings, 
  Eye, 
  Clock, 
  ArrowLeft,
  Send,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// --- Utils ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Context ---
interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  login: (provider: 'google' | 'github') => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

// --- Components ---

const Navbar = () => {
  const { user, profile, logout, isAdmin } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-serif font-bold text-xl">
                M
              </div>
              <span className="font-serif font-bold text-xl tracking-tight hidden sm:block">Modern Editorial</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-slate-600 hover:text-primary font-medium transition-colors">Home</Link>
            <Link to="/categories" className="text-slate-600 hover:text-primary font-medium transition-colors">Categories</Link>
            <Link to="/about" className="text-slate-600 hover:text-primary font-medium transition-colors">About</Link>
            {isAdmin && (
              <Link to="/admin" className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-all">
                Dashboard
              </Link>
            )}
            {user ? (
              <div className="flex items-center gap-4 pl-4 border-l border-slate-200">
                <img src={user.photoURL || ''} alt="" className="w-8 h-8 rounded-full border border-slate-200" />
                <button onClick={logout} className="text-slate-500 hover:text-red-600 transition-colors">
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <Link to="/login" className="px-4 py-2 text-primary border border-primary rounded-lg text-sm font-medium hover:bg-primary/5 transition-all">
                Sign In
              </Link>
            )}
          </div>

          <div className="md:hidden flex items-center">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-slate-600">
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-slate-200 overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-2">
              <Link to="/" className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50">Home</Link>
              <Link to="/categories" className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50">Categories</Link>
              <Link to="/about" className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50">About</Link>
              {isAdmin && (
                <Link to="/admin" className="block px-3 py-2 rounded-md text-base font-medium text-primary hover:bg-slate-50">Admin Dashboard</Link>
              )}
              {!user && (
                <Link to="/login" className="block px-3 py-2 rounded-md text-base font-medium text-primary hover:bg-slate-50">Sign In</Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const Footer = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    try {
      await addDoc(collection(db, 'newsletter_subscribers'), {
        email,
        createdAt: Timestamp.now()
      });
      setSubscribed(true);
      setEmail('');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <footer className="bg-slate-900 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-serif font-bold text-xl">
                M
              </div>
              <span className="font-serif font-bold text-2xl tracking-tight">Modern Editorial</span>
            </Link>
            <p className="text-slate-400 max-w-md mb-8">
              Delivering high-quality journalism and insightful analysis on the topics that matter most. Join our community of readers today.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-primary transition-colors">
                <Mail className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-primary transition-colors">
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-bold mb-6">Quick Links</h4>
            <ul className="space-y-4 text-slate-400">
              <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
              <li><Link to="/categories" className="hover:text-white transition-colors">Categories</Link></li>
              <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-6">Newsletter</h4>
            <p className="text-slate-400 mb-4 text-sm">Get the latest stories delivered to your inbox.</p>
            {subscribed ? (
              <div className="bg-emerald-500/10 text-emerald-400 p-4 rounded-lg border border-emerald-500/20 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                <span>Subscribed!</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <input 
                  type="email" 
                  placeholder="Email address" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button className="w-full py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors">
                  Subscribe
                </button>
              </form>
            )}
          </div>
        </div>
        <div className="mt-16 pt-8 border-t border-slate-800 text-slate-500 text-sm text-center">
          © {new Date().getFullYear()} Modern Editorial. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

// --- Pages ---

const HomePage = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'posts'), 
      where('status', '==', 'published'),
      orderBy('createdAt', 'desc'),
      limit(10)
    );
    return onSnapshot(q, (snapshot) => {
      setPosts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post)));
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  const featuredPost = posts[0];
  const otherPosts = posts.slice(1);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      {featuredPost && (
        <section className="relative h-[600px] bg-slate-900 overflow-hidden">
          <img 
            src={featuredPost.thumbnailUrl || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&q=80&w=2070'} 
            alt="" 
            className="absolute inset-0 w-full h-full object-cover opacity-60"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
          <div className="relative max-w-7xl mx-auto px-4 h-full flex flex-col justify-end pb-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-3xl"
            >
              <span className="inline-block px-3 py-1 bg-primary text-white text-xs font-bold uppercase tracking-wider rounded mb-4">
                {featuredPost.category}
              </span>
              <h1 className="text-4xl md:text-6xl font-serif font-bold text-white mb-6 leading-tight">
                {featuredPost.title}
              </h1>
              <p className="text-xl text-slate-300 mb-8 line-clamp-2">
                {featuredPost.excerpt}
              </p>
              <Link to={`/post/${featuredPost.id}`} className="inline-flex items-center gap-2 px-8 py-4 bg-white text-slate-900 rounded-lg font-bold hover:bg-slate-100 transition-all">
                Read Article <ChevronRight className="w-5 h-5" />
              </Link>
            </motion.div>
          </div>
        </section>
      )}

      {/* Blog Grid */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-3xl font-serif font-bold">Latest Stories</h2>
          <Link to="/categories" className="flex items-center gap-2 text-primary font-medium cursor-pointer hover:underline">
            View all <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {otherPosts.map((post, idx) => (
            <motion.article 
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="group cursor-pointer"
            >
              <Link to={`/post/${post.id}`}>
                <div className="relative aspect-[16/10] rounded-xl overflow-hidden mb-6 shadow-md group-hover:shadow-xl transition-all">
                  <img 
                    src={post.thumbnailUrl || 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&q=80&w=2072'} 
                    alt="" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="px-2 py-1 bg-white/90 backdrop-blur-sm text-slate-900 text-[10px] font-bold uppercase tracking-wider rounded">
                      {post.category}
                    </span>
                  </div>
                </div>
                <h3 className="text-xl font-serif font-bold mb-3 group-hover:text-primary transition-colors line-clamp-2">
                  {post.title}
                </h3>
                <p className="text-slate-600 mb-4 line-clamp-3 text-sm leading-relaxed">
                  {post.excerpt}
                </p>
                <div className="flex items-center gap-3 text-xs text-slate-400 font-medium">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {post.createdAt?.toDate().toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {post.viewCount || 0} views
                  </div>
                </div>
              </Link>
            </motion.article>
          ))}
        </div>
      </section>
    </div>
  );
};

const PostDetailPage = () => {
  const { id } = useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!id) return;
    const postRef = doc(db, 'posts', id);
    
    // Increment view count
    updateDoc(postRef, { viewCount: increment(1) });

    const unsubPost = onSnapshot(postRef, (doc) => {
      if (doc.exists()) {
        setPost({ id: doc.id, ...doc.data() } as Post);
      }
      setLoading(false);
    });

    const q = query(collection(db, 'posts', id, 'comments'), orderBy('createdAt', 'desc'));
    const unsubComments = onSnapshot(q, (snapshot) => {
      setComments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Comment)));
    });

    return () => {
      unsubPost();
      unsubComments();
    };
  }, [id]);

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim() || !id) return;

    try {
      await addDoc(collection(db, 'posts', id, 'comments'), {
        postId: id,
        authorId: user.uid,
        authorName: user.displayName || 'Anonymous',
        content: newComment,
        createdAt: Timestamp.now()
      });
      setNewComment('');
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!post) return <div className="min-h-screen flex items-center justify-center">Post not found</div>;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="max-w-4xl mx-auto px-4 pt-12 pb-8">
        <Link to="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-primary mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to feed
        </Link>
        <div className="flex items-center gap-2 mb-6">
          <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider rounded">
            {post.category}
          </span>
          <span className="text-slate-400 text-sm">•</span>
          <span className="text-slate-500 text-sm">{post.createdAt?.toDate().toLocaleDateString()}</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-serif font-bold mb-8 leading-tight">
          {post.title}
        </h1>
        <div className="flex items-center gap-4 py-8 border-y border-slate-100">
          <div className="w-12 h-12 bg-slate-200 rounded-full overflow-hidden">
            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${post.authorName}`} alt="" />
          </div>
          <div>
            <div className="font-bold">{post.authorName}</div>
            <div className="text-slate-500 text-sm">Editorial Contributor</div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <img 
          src={post.thumbnailUrl} 
          alt="" 
          className="w-full aspect-video object-cover rounded-2xl mb-12 shadow-lg"
          referrerPolicy="no-referrer"
        />
        <div className="markdown-body prose prose-lg max-w-none">
          <ReactMarkdown>{post.content}</ReactMarkdown>
        </div>
      </div>

      {/* Comments */}
      <section className="bg-slate-50 py-20 border-t border-slate-100">
        <div className="max-w-3xl mx-auto px-4">
          <h3 className="text-2xl font-serif font-bold mb-10">Discussion ({comments.length})</h3>
          
          {user ? (
            <form onSubmit={handleComment} className="mb-12">
              <textarea 
                placeholder="Share your thoughts..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="w-full p-4 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary min-h-[120px] mb-4"
              />
              <button className="px-6 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-all flex items-center gap-2">
                Post Comment <Send className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <div className="bg-white p-6 rounded-xl border border-slate-200 text-center mb-12">
              <p className="text-slate-600 mb-4">Please sign in to join the conversation.</p>
              <Link to="/login" className="text-primary font-bold hover:underline">Sign in now</Link>
            </div>
          )}

          <div className="space-y-8">
            {comments.map(comment => (
              <div key={comment.id} className="flex gap-4">
                <div className="w-10 h-10 bg-slate-200 rounded-full flex-shrink-0 overflow-hidden">
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.authorName}`} alt="" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-sm">{comment.authorName}</span>
                    <span className="text-slate-400 text-xs">•</span>
                    <span className="text-slate-400 text-xs">{comment.createdAt?.toDate().toLocaleDateString()}</span>
                  </div>
                  <p className="text-slate-700 leading-relaxed">{comment.content}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

const CategoriesPage = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'posts'), 
      where('status', '==', 'published'),
      orderBy('createdAt', 'desc')
    );
    return onSnapshot(q, (snapshot) => {
      setPosts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post)));
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-4xl font-serif font-bold mb-12">All Stories</h1>
        
        {posts.length === 0 ? (
          <div className="text-center text-slate-500 py-20">No stories published yet.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {posts.map((post, idx) => (
              <motion.article 
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="group cursor-pointer bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-slate-100"
              >
                <Link to={`/post/${post.id}`} className="block h-full flex flex-col">
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <img 
                      src={post.thumbnailUrl || 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&q=80&w=2072'} 
                      alt="" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="px-2 py-1 bg-white/90 backdrop-blur-sm text-slate-900 text-[10px] font-bold uppercase tracking-wider rounded">
                        {post.category}
                      </span>
                    </div>
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="text-xl font-serif font-bold mb-3 group-hover:text-primary transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-slate-600 mb-4 line-clamp-3 text-sm leading-relaxed flex-1">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-slate-400 font-medium pt-4 border-t border-slate-50">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {post.createdAt?.toDate().toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {post.viewCount || 0} views
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const LoginPage = () => {
  const { login, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate('/');
  }, [user, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-slate-200"
      >
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-white font-serif font-bold text-3xl mx-auto mb-6">
            M
          </div>
          <h1 className="text-3xl font-serif font-bold mb-2">Welcome Back</h1>
          <p className="text-slate-500">Sign in to your account to continue</p>
        </div>

        <div className="space-y-4">
          <button 
            onClick={() => login('google')}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-slate-200 rounded-xl font-medium hover:bg-slate-50 transition-all"
          >
            <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="" />
            Continue with Google
          </button>
          <button 
            onClick={() => login('github')}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-all"
          >
            <Github className="w-5 h-5" />
            Continue with GitHub
          </button>
        </div>

        <div className="mt-10 pt-6 border-t border-slate-100 text-center text-sm text-slate-400">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </div>
      </motion.div>
    </div>
  );
};

// --- Admin Components ---

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const { isAdmin, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isAdmin) navigate('/');
  }, [isAdmin, loading, navigate]);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col fixed h-full">
        <div className="p-6 border-b border-slate-800">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-serif font-bold text-xl">
              M
            </div>
            <span className="font-serif font-bold text-lg tracking-tight">Editorial Admin</span>
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link to="/admin" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 transition-colors text-slate-300 hover:text-white">
            <LayoutDashboard className="w-5 h-5" /> Dashboard
          </Link>
          <Link to="/admin/posts" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 transition-colors text-slate-300 hover:text-white">
            <FileText className="w-5 h-5" /> Posts
          </Link>
          <Link to="/admin/users" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 transition-colors text-slate-300 hover:text-white">
            <Users className="w-5 h-5" /> Users
          </Link>
          <Link to="/admin/analytics" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 transition-colors text-slate-300 hover:text-white">
            <BarChart3 className="w-5 h-5" /> Analytics
          </Link>
        </nav>
        <div className="p-4 border-t border-slate-800">
          <Link to="/" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 transition-colors text-slate-400">
            <ArrowLeft className="w-5 h-5" /> Back to Site
          </Link>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 ml-64 p-10">
        {children}
      </main>
    </div>
  );
};

const AdminDashboard = () => {
  const [stats, setStats] = useState({ posts: 0, users: 0, subscribers: 0, views: 0 });
  const [isSeeding, setIsSeeding] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    // Mock stats for demo, in real app we'd aggregate
    const unsubPosts = onSnapshot(collection(db, 'posts'), s => setStats(prev => ({ ...prev, posts: s.size })));
    const unsubUsers = onSnapshot(collection(db, 'users'), s => setStats(prev => ({ ...prev, users: s.size })));
    const unsubSubs = onSnapshot(collection(db, 'newsletter_subscribers'), s => setStats(prev => ({ ...prev, subscribers: s.size })));
    
    return () => {
      unsubPosts();
      unsubUsers();
      unsubSubs();
    };
  }, []);

  const seedData = async () => {
    if (!user || isSeeding) return;
    setIsSeeding(true);
    
    const samplePosts = [
      {
        title: "The Future of AI: Beyond Large Language Models",
        slug: "future-of-ai",
        excerpt: "As AI continues to evolve, we look at what comes after the current wave of generative models and how it will reshape industries.",
        content: "# The Future of Artificial Intelligence\n\nArtificial Intelligence has made incredible strides in recent years, primarily driven by the success of Large Language Models (LLMs). But what lies beyond?\n\n## Multimodal Intelligence\nThe next frontier is true multimodal understanding—AI that can seamlessly process text, images, audio, and video in a unified way, much like the human brain.\n\n## Reasoning and Planning\nCurrent models are excellent at pattern matching but often struggle with complex multi-step reasoning. Researchers are now focusing on 'System 2' thinking for AI, enabling it to plan and verify its own outputs.\n\n## Edge AI\nBringing powerful models directly to devices without relying on the cloud will enhance privacy and reduce latency, enabling a new generation of real-time applications.",
        category: "Technology",
        thumbnailUrl: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=2070",
        status: "published"
      },
      {
        title: "Minimalism in the Modern Age: A Guide to Simple Living",
        slug: "modern-minimalism",
        excerpt: "In a world of constant digital noise and physical clutter, minimalism offers a path to clarity and intentionality.",
        content: "# Embracing Minimalism\n\nMinimalism isn't just about owning fewer things; it's about making room for what truly matters.\n\n## Digital Decluttering\nOur digital lives are often more cluttered than our physical spaces. Start by unsubscribing from unnecessary emails and organizing your desktop.\n\n## Intentional Consumption\nBefore buying something new, ask yourself: 'Does this add value to my life?' Shift your focus from quantity to quality.\n\n## The Mental Benefits\nBy reducing the number of decisions we have to make about our 'stuff,' we free up mental energy for creativity and relationships.",
        category: "Lifestyle",
        thumbnailUrl: "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&q=80&w=2067",
        status: "published"
      },
      {
        title: "The Rise of Remote Work: How Companies are Adapting",
        slug: "remote-work-rise",
        excerpt: "The global shift to remote work has fundamentally changed the employer-employee relationship and the concept of the office.",
        content: "# The Remote Work Revolution\n\nWhat started as a necessity has become a permanent fixture of the modern economy. Companies that embrace flexibility are winning the talent war.\n\n## Asynchronous Communication\nMoving away from constant meetings and toward clear, documented communication allows teams to work across time zones effectively.\n\n## The Hybrid Model\nMany organizations are settling on a hybrid approach, combining the focus of remote work with the collaborative energy of in-person gatherings.\n\n## Redefining Productivity\nSuccess is no longer measured by 'time in seat' but by outcomes and impact. This shift requires high levels of trust and clear goal-setting.",
        category: "Business",
        thumbnailUrl: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&q=80&w=2070",
        status: "published"
      },
      {
        title: "The Evolution of Digital Art: From Pixels to NFTs",
        slug: "digital-art-evolution",
        excerpt: "Explore how technology has transformed artistic expression and the way we value and trade creative works.",
        content: "# Art in the Digital Age\n\nFrom early computer-generated patterns to complex 3D environments, digital art has come a long way.\n\n## The Early Pioneers\nIn the 1960s, artists began using mainframe computers to create algorithmic art, laying the foundation for everything that followed.\n\n## Tools of the Trade\nSoftware like Photoshop and Procreate has democratized art creation, allowing millions to express themselves without traditional supplies.\n\n## Ownership and Scarcity\nBlockchain technology has introduced the concept of digital scarcity, creating new markets and challenges for artists and collectors alike.",
        category: "Culture",
        thumbnailUrl: "https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?auto=format&fit=crop&q=80&w=2072",
        status: "published"
      },
      {
        title: "Exploring the Deep Sea: New Discoveries in Marine Biology",
        slug: "deep-sea-exploration",
        excerpt: "Scientists are uncovering a world of bioluminescent creatures and alien-like ecosystems in the ocean's midnight zone.",
        content: "# Mysteries of the Deep\n\nThe deep ocean remains one of the least explored places on Earth. Recent expeditions are changing that.\n\n## Bioluminescence\nIn the darkness of the deep sea, many organisms create their own light for hunting, communication, and defense.\n\n## Hydrothermal Vents\nThese underwater geysers support unique ecosystems that rely on chemical energy rather than sunlight—a process called chemosynthesis.\n\n## Conservation Challenges\nAs we learn more about these fragile environments, the need for international protection against deep-sea mining becomes more urgent.",
        category: "Science",
        thumbnailUrl: "https://images.unsplash.com/photo-1583212292454-1fe6229603b7?auto=format&fit=crop&q=80&w=2074",
        status: "published"
      }
    ];

    try {
      for (const post of samplePosts) {
        await addDoc(collection(db, 'posts'), {
          ...post,
          authorId: user.uid,
          authorName: user.displayName || 'Admin',
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
          viewCount: Math.floor(Math.random() * 500)
        });
      }
      alert('Sample posts added successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to seed data.');
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-3xl font-bold">Dashboard Overview</h1>
        <div className="flex gap-4">
          <button 
            onClick={seedData}
            disabled={isSeeding}
            className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg flex items-center gap-2 font-medium hover:bg-slate-300 transition-all disabled:opacity-50"
          >
            {isSeeding ? 'Seeding...' : 'Seed Sample Posts'}
          </button>
          <Link to="/admin/posts/new" className="px-4 py-2 bg-primary text-white rounded-lg flex items-center gap-2 font-medium hover:bg-primary/90 transition-all">
            <Plus className="w-5 h-5" /> New Post
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {[
          { label: 'Total Posts', value: stats.posts, icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Total Users', value: stats.users, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Subscribers', value: stats.subscribers, icon: Mail, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Total Views', value: '12.4k', icon: Eye, color: 'text-orange-600', bg: 'bg-orange-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-4", stat.bg)}>
              <stat.icon className={cn("w-6 h-6", stat.color)} />
            </div>
            <div className="text-slate-500 text-sm font-medium mb-1">{stat.label}</div>
            <div className="text-2xl font-bold">{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-xl font-bold mb-6">Recent Activity</h3>
          <div className="space-y-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <div className="font-medium">New post published</div>
                  <div className="text-slate-400 text-sm">2 hours ago</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-xl font-bold mb-6">Growth Analytics</h3>
          <div className="h-64 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 italic">
            Chart visualization would go here
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminPosts = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    return onSnapshot(query(collection(db, 'posts'), orderBy('createdAt', 'desc')), (s) => {
      setPosts(s.docs.map(d => ({ id: d.id, ...d.data() } as Post)));
    });
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    try {
      await deleteDoc(doc(db, 'posts', id));
    } catch (err) {
      console.error(err);
    }
  };

  const toggleStatus = async (post: Post) => {
    try {
      await updateDoc(doc(db, 'posts', post.id), {
        status: post.status === 'published' ? 'draft' : 'published'
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-3xl font-bold">Manage Posts</h1>
        <Link to="/admin/posts/new" className="px-4 py-2 bg-primary text-white rounded-lg flex items-center gap-2 font-medium hover:bg-primary/90 transition-all">
          <Plus className="w-5 h-5" /> New Post
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 font-bold text-sm text-slate-600">Post Title</th>
              <th className="px-6 py-4 font-bold text-sm text-slate-600">Category</th>
              <th className="px-6 py-4 font-bold text-sm text-slate-600">Status</th>
              <th className="px-6 py-4 font-bold text-sm text-slate-600">Date</th>
              <th className="px-6 py-4 font-bold text-sm text-slate-600 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {posts.map(post => (
              <tr key={post.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-medium text-slate-900">{post.title}</div>
                  <div className="text-xs text-slate-400">/{post.slug}</div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase rounded">
                    {post.category}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button 
                    onClick={() => toggleStatus(post)}
                    className={cn(
                      "px-2 py-1 rounded text-[10px] font-bold uppercase",
                      post.status === 'published' ? "bg-emerald-100 text-emerald-600" : "bg-orange-100 text-orange-600"
                    )}
                  >
                    {post.status}
                  </button>
                </td>
                <td className="px-6 py-4 text-sm text-slate-500">
                  {post.createdAt?.toDate().toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button 
                      onClick={() => navigate(`/admin/posts/edit/${post.id}`)}
                      className="p-2 text-slate-400 hover:text-primary transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(post.id)}
                      className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const PostEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    category: 'Technology',
    thumbnailUrl: '',
    status: 'draft' as 'draft' | 'published',
    createdAt: null as Timestamp | null,
    viewCount: 0
  });

  useEffect(() => {
    if (id && id !== 'new') {
      getDoc(doc(db, 'posts', id)).then(s => {
        if (s.exists()) {
          const data = s.data() as Post;
          setFormData({
            title: data.title,
            slug: data.slug,
            excerpt: data.excerpt,
            content: data.content,
            category: data.category,
            thumbnailUrl: data.thumbnailUrl,
            status: data.status,
            createdAt: data.createdAt,
            viewCount: data.viewCount
          });
        }
      });
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    try {
      const data = {
        title: formData.title,
        slug: formData.slug,
        excerpt: formData.excerpt,
        content: formData.content,
        category: formData.category,
        thumbnailUrl: formData.thumbnailUrl,
        status: formData.status,
        authorId: user.uid,
        authorName: user.displayName || 'Admin',
        updatedAt: Timestamp.now(),
        createdAt: formData.createdAt || Timestamp.now(),
        viewCount: formData.viewCount || 0
      };

      if (id && id !== 'new') {
        await updateDoc(doc(db, 'posts', id), data);
      } else {
        await addDoc(collection(db, 'posts'), data);
      }
      navigate('/admin/posts');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl">
      <div className="flex items-center gap-4 mb-10">
        <button onClick={() => navigate('/admin/posts')} className="p-2 bg-white rounded-lg border border-slate-200 shadow-sm text-slate-500">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-3xl font-bold">{id === 'new' ? 'Create New Post' : 'Edit Post'}</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Post Title</label>
            <input 
              required
              type="text" 
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value, slug: e.target.value.toLowerCase().replace(/ /g, '-') })}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Enter a compelling title"
            />
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Slug</label>
              <input 
                required
                type="text" 
                value={formData.slug}
                onChange={e => setFormData({ ...formData, slug: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Category</label>
              <select 
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option>Technology</option>
                <option>Lifestyle</option>
                <option>Business</option>
                <option>Culture</option>
                <option>Science</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Thumbnail URL</label>
            <input 
              type="url" 
              value={formData.thumbnailUrl}
              onChange={e => setFormData({ ...formData, thumbnailUrl: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="https://images.unsplash.com/..."
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Excerpt</label>
            <textarea 
              required
              value={formData.excerpt}
              onChange={e => setFormData({ ...formData, excerpt: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary min-h-[100px]"
              placeholder="A brief summary for the feed"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Content (Markdown)</label>
            <textarea 
              required
              value={formData.content}
              onChange={e => setFormData({ ...formData, content: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary min-h-[400px] font-mono text-sm"
              placeholder="# Your story starts here..."
            />
          </div>
          <div className="flex items-center gap-4 pt-4 border-t border-slate-100">
            <button 
              type="submit" 
              disabled={loading}
              className="px-8 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Post'}
            </button>
            <select 
              value={formData.status}
              onChange={e => setFormData({ ...formData, status: e.target.value as any })}
              className="px-4 py-3 bg-slate-100 border-none rounded-xl font-bold text-slate-600 focus:outline-none"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
        </div>
      </form>
    </div>
  );
};

// --- Auth Provider ---

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, async (u) => {
      try {
        setUser(u);
        if (u) {
          const docRef = doc(db, 'users', u.uid);
          const snap = await getDoc(docRef);
          if (snap.exists()) {
            setProfile(snap.data() as UserProfile);
          } else {
            const newProfile: UserProfile = {
              uid: u.uid,
              email: u.email || '',
              displayName: u.displayName || 'User',
              photoURL: u.photoURL || '',
              role: 'reader',
              createdAt: Timestamp.now()
            };
            await setDoc(docRef, newProfile);
            setProfile(newProfile);
          }
        } else {
          setProfile(null);
        }
      } catch (err) {
        console.error("Error fetching user profile:", err);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    });
  }, []);

  const login = async (provider: 'google' | 'github') => {
    const p = provider === 'google' ? googleProvider : githubProvider;
    await signInWithPopup(auth, p);
  };

  const logout = async () => {
    await signOut(auth);
  };

  const isAdmin = profile?.role === 'admin' || user?.email === 'tobiasrojeancarl@gmail.com';

  return (
    <AuthContext.Provider value={{ user, profile, loading, isAdmin, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// --- Main App ---

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Reader Routes */}
          <Route path="/" element={<><Navbar /><HomePage /><Footer /></>} />
          <Route path="/categories" element={<><Navbar /><CategoriesPage /><Footer /></>} />
          <Route path="/post/:id" element={<><Navbar /><PostDetailPage /><Footer /></>} />
          <Route path="/login" element={<LoginPage />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLayout><AdminDashboard /></AdminLayout>} />
          <Route path="/admin/posts" element={<AdminLayout><AdminPosts /></AdminLayout>} />
          <Route path="/admin/posts/new" element={<AdminLayout><PostEditor /></AdminLayout>} />
          <Route path="/admin/posts/edit/:id" element={<AdminLayout><PostEditor /></AdminLayout>} />
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
