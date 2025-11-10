import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Blog, Post } from '../lib/supabase';
import { Plus, Edit, Trash2, Eye, FileText } from 'lucide-react';

interface DashboardProps {
  onNavigate: (page: string, data?: { blogId?: string; postId?: string }) => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const { user } = useAuth();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [showNewBlogModal, setShowNewBlogModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadBlogs();
    }
  }, [user]);

  useEffect(() => {
    if (selectedBlog) {
      loadPosts(selectedBlog.id);
    }
  }, [selectedBlog]);

  const loadBlogs = async () => {
    const { data } = await supabase
      .from('blogs')
      .select('*')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false });

    if (data) {
      setBlogs(data);
      if (data.length > 0 && !selectedBlog) {
        setSelectedBlog(data[0]);
      }
    }
    setLoading(false);
  };

  const loadPosts = async (blogId: string) => {
    const { data } = await supabase
      .from('posts')
      .select('*')
      .eq('blog_id', blogId)
      .order('created_at', { ascending: false });

    if (data) {
      setPosts(data);
    }
  };

  const createBlog = async (title: string, description: string) => {
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const { data, error } = await supabase
      .from('blogs')
      .insert({
        user_id: user!.id,
        title,
        description,
        slug,
      })
      .select()
      .single();

    if (!error && data) {
      setBlogs([data, ...blogs]);
      setSelectedBlog(data);
      setShowNewBlogModal(false);
    }
  };

  const deleteBlog = async (blogId: string) => {
    if (!confirm('Are you sure? This will delete all posts in this blog.')) return;

    await supabase.from('blogs').delete().eq('id', blogId);
    const newBlogs = blogs.filter(b => b.id !== blogId);
    setBlogs(newBlogs);
    setSelectedBlog(newBlogs[0] || null);
  };

  const deletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    await supabase.from('posts').delete().eq('id', postId);
    setPosts(posts.filter(p => p.id !== postId));
  };

  const togglePublish = async (post: Post) => {
    const { data } = await supabase
      .from('posts')
      .update({
        published: !post.published,
        published_at: !post.published ? new Date().toISOString() : null,
      })
      .eq('id', post.id)
      .select()
      .single();

    if (data) {
      setPosts(posts.map(p => p.id === post.id ? data : p));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <div className="text-slate-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-800">My Blogs</h2>
              <button
                onClick={() => setShowNewBlogModal(true)}
                className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              {blogs.length === 0 ? (
                <p className="text-slate-500 text-sm">No blogs yet. Create your first one!</p>
              ) : (
                blogs.map(blog => (
                  <div
                    key={blog.id}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedBlog?.id === blog.id
                        ? 'bg-blue-50 border-2 border-blue-200'
                        : 'bg-slate-50 hover:bg-slate-100'
                    }`}
                    onClick={() => setSelectedBlog(blog)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-slate-800 truncate">{blog.title}</h3>
                        <p className="text-xs text-slate-500 truncate">{blog.description}</p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteBlog(blog.id);
                        }}
                        className="ml-2 p-1 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-3">
          {selectedBlog ? (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">{selectedBlog.title}</h2>
                  <p className="text-slate-600">{selectedBlog.description}</p>
                </div>
                <button
                  onClick={() => onNavigate('editor', { blogId: selectedBlog.id })}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  <span>New Post</span>
                </button>
              </div>

              <div className="space-y-4">
                {posts.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500">No posts yet. Create your first post!</p>
                  </div>
                ) : (
                  posts.map(post => (
                    <div
                      key={post.id}
                      className="border border-slate-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-slate-800">{post.title}</h3>
                          <p className="text-slate-600 text-sm mt-1 line-clamp-2">{post.excerpt || 'No excerpt'}</p>
                          <div className="flex items-center space-x-4 mt-2">
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              post.published
                                ? 'bg-green-100 text-green-700'
                                : 'bg-slate-100 text-slate-700'
                            }`}>
                              {post.published ? 'Published' : 'Draft'}
                            </span>
                            <span className="text-xs text-slate-500">
                              {new Date(post.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          {post.published && (
                            <button
                              onClick={() => onNavigate('post', { blogId: selectedBlog.id, postId: post.id })}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                            >
                              <Eye className="w-5 h-5" />
                            </button>
                          )}
                          <button
                            onClick={() => onNavigate('editor', { blogId: selectedBlog.id, postId: post.id })}
                            className="p-2 text-slate-600 hover:bg-slate-50 rounded-lg"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => togglePublish(post)}
                            className={`px-3 py-2 text-sm rounded-lg ${
                              post.published
                                ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                            }`}
                          >
                            {post.published ? 'Unpublish' : 'Publish'}
                          </button>
                          <button
                            onClick={() => deletePost(post.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">Create a blog to get started!</p>
            </div>
          )}
        </div>
      </div>

      {showNewBlogModal && (
        <NewBlogModal
          onClose={() => setShowNewBlogModal(false)}
          onCreate={createBlog}
        />
      )}
    </div>
  );
}

function NewBlogModal({ onClose, onCreate }: {
  onClose: () => void;
  onCreate: (title: string, description: string) => void;
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate(title, description);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
        <h3 className="text-2xl font-bold text-slate-800 mb-6">Create New Blog</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Blog Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="My Awesome Blog"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={3}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Write about amazing things..."
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Blog
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
