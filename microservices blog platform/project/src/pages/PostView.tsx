import { useState, useEffect } from 'react';
import { supabase, Blog, Post, Profile } from '../lib/supabase';
import { Calendar, User, ArrowLeft } from 'lucide-react';

interface PostViewProps {
  blogId: string;
  postId: string;
  onNavigate: (page: string) => void;
}

export function PostView({ blogId, postId, onNavigate }: PostViewProps) {
  const [post, setPost] = useState<Post | null>(null);
  const [blog, setBlog] = useState<Blog | null>(null);
  const [author, setAuthor] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPost();
  }, [postId]);

  const loadPost = async () => {
    const { data: postData } = await supabase
      .from('posts')
      .select('*')
      .eq('id', postId)
      .eq('published', true)
      .maybeSingle();

    if (postData) {
      setPost(postData);

      const { data: blogData } = await supabase
        .from('blogs')
        .select('*')
        .eq('id', blogId)
        .maybeSingle();

      if (blogData) {
        setBlog(blogData);

        const { data: authorData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', blogData.user_id)
          .maybeSingle();

        setAuthor(authorData);
      }
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <div className="text-slate-600">Loading post...</div>
      </div>
    );
  }

  if (!post || !blog) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Post Not Found</h2>
          <p className="text-slate-600 mb-6">This post may have been removed or is not published yet.</p>
          <button
            onClick={() => onNavigate('home')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center space-x-2 text-slate-600 hover:text-slate-800 mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Home</span>
        </button>

        <article className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-8 md:p-12">
            <div className="mb-6">
              <div className="flex items-center space-x-2 text-blue-600 font-medium mb-4">
                <User className="w-5 h-5" />
                <span>{blog.title}</span>
              </div>

              <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">
                {post.title}
              </h1>

              <div className="flex items-center space-x-6 text-slate-600">
                <div className="flex items-center space-x-2">
                  <span className="font-medium">{author?.display_name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(post.published_at!).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</span>
                </div>
              </div>
            </div>

            {post.excerpt && (
              <div className="mb-8 pb-8 border-b border-slate-200">
                <p className="text-xl text-slate-600 italic">
                  {post.excerpt}
                </p>
              </div>
            )}

            <div className="prose prose-lg max-w-none">
              <div className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                {post.content}
              </div>
            </div>
          </div>
        </article>

        <div className="mt-8 bg-white rounded-xl shadow-sm p-8">
          <div className="flex items-start space-x-4">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-2xl font-bold text-white">
                {author?.display_name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">
                {author?.display_name}
              </h3>
              <p className="text-slate-600 mb-3">
                {author?.bio || 'Writer and blogger'}
              </p>
              <p className="text-sm text-slate-500">
                More from {blog.title}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
