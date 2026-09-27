import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// ==========================================
// 1. CONFIGURATION & CLIENT INITIALIZATION
// ==========================================

// Replace these placeholders with your actual keys
const SUPABASE_URL = 'https://your-supabase-project.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key';
const CLOUDINARY_CLOUD_NAME = 'your_cloud_name';
const CLOUDINARY_UPLOAD_PRESET = 'your_upload_preset';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ==========================================
// 2. HELPER FUNCTIONS
// ==========================================

const uploadToCloudinary = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`,
    {
      method: 'POST',
      body: formData,
    }
  );

  if (!response.ok) {
    throw new Error('Failed to upload media to Cloudinary');
  }

  const data = await response.json();
  return data.secure_url;
};

// ==========================================
// 3. TYPES
// ==========================================

interface Post {
  id: string;
  title: string;
  description: string;
  media_url?: string;
  created_at: string;
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostCreated: () => void;
}

// ==========================================
// 4. COMPONENTS
// ==========================================

export const CustomPostCreatorModal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  onPostCreated,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let mediaUrl = '';

      if (file) {
        mediaUrl = await uploadToCloudinary(file);
      }

      const { error } = await supabase.from('posts').insert([
        {
          title,
          description,
          media_url: mediaUrl,
        },
      ]);

      if (error) throw error;

      setTitle('');
      setDescription('');
      setFile(null);
      onPostCreated();
      onClose();
    } catch (err: any) {
      console.error('Error uploading/creating post:', err);
      alert('Failed to publish post: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h2>Create Shared Post</h2>
        <form onSubmit={handleSubmit} style={styles.form}>
          <div>
            <label style={styles.label}>Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              style={styles.input}
            />
          </div>

          <div>
            <label style={styles.label}>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              style={{ ...styles.input, height: '80px' }}
            />
          </div>

          <div>
            <label style={styles.label}>Upload Image/Video</label>
            <input
              type="file"
              accept="image/*,video/*"
              onChange={handleFileChange}
              style={styles.input}
            />
          </div>

          <div style={styles.actions}>
            <button type="submit" disabled={loading} style={styles.primaryBtn}>
              {loading ? 'Publishing...' : 'Publish'}
            </button>
            <button type="button" onClick={onClose} disabled={loading} style={styles.secondaryBtn}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const ExploreFeed: React.FC<{ refreshKey: number }> = ({ refreshKey }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching posts:', error.message);
    } else {
      setPosts(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPosts();
  }, [refreshKey]);

  if (loading) return <p>Loading online posts...</p>;

  return (
    <div style={styles.feedContainer}>
      {posts.length === 0 ? (
        <p>No posts found. Be the first to create one!</p>
      ) : (
        posts.map((post) => (
          <div key={post.id} style={styles.card}>
            {post.media_url && (
              <img
                src={post.media_url}
                alt={post.title}
                style={styles.cardMedia}
              />
            )}
            <h3>{post.title}</h3>
            <p>{post.description}</p>
            <small style={styles.date}>
              {new Date(post.created_at).toLocaleString()}
            </small>
          </div>
        ))
      )}
    </div>
  );
};

// ==========================================
// 5. MAIN APP COMPONENT
// ==========================================

export default function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handlePostCreated = () => {
    setRefreshKey((prev) => prev + 1); // Triggers feed refetch
  };

  return (
    <div style={styles.appContainer}>
      <header style={styles.header}>
        <h1>Community Feed</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          style={styles.primaryBtn}
        >
          Create Post
        </button>
      </header>

      <main>
        <ExploreFeed refreshKey={refreshKey} />
      </main>

      <CustomPostCreatorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onPostCreated={handlePostCreated}
      />
    </div>
  );
}

// ==========================================
// 6. BASIC INLINE STYLES
// ==========================================

const styles: { [key: string]: React.CSSProperties } = {
  appContainer: {
    maxWidth: '600px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: 'sans-serif',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    borderBottom: '1px solid #eee',
    paddingBottom: '10px',
  },
  feedContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  card: {
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '16px',
    backgroundColor: '#fff',
  },
  cardMedia: {
    width: '100%',
    maxHeight: '400px',
    objectFit: 'cover',
    borderRadius: '6px',
    marginBottom: '10px',
  },
  date: {
    color: '#888',
  },
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: '#fff',
    padding: '24px',
    borderRadius: '8px',
    width: '90%',
    maxWidth: '400px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: 'bold',
    marginBottom: '4px',
  },
  input: {
    width: '100%',
    padding: '8px',
    boxSizing: 'border-box',
    borderRadius: '4px',
    border: '1px solid #ccc',
  },
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '8px',
    marginTop: '10px',
  },
  primaryBtn: {
    padding: '8px 16px',
    backgroundColor: '#0070f3',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  secondaryBtn: {
    padding: '8px 16px',
    backgroundColor: '#eee',
    color: '#333',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
};