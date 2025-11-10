import { useState, useEffect } from 'react';
import { supabase, Blog, Post } from '../lib/supabase';
import { Calendar, User, ArrowRight, TrendingUp } from 'lucide-react';

interface HomeProps {
  onNavigate: (page: string, data?: { blogId?: string; postId?: string }) => void;
}

export function Home({ onNavigate }: HomeProps) {
  const [recentPosts, setRecentPosts] = useState<(Post & { blog: Blog })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecentPosts();
  }, []);

  const loadRecentPosts = async () => {
    const { data } = await supabase
      .from('posts')
      .select(`
        *,
        blog:blogs(*)
      `)
      .eq('published', true)
      .order('published_at', { ascending: false })
      .limit(9);

    if (data) {
      setRecentPosts(data as any);
    }
    setLoading(false);
  };

  return (
    <div>
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Share Your Story With The World
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Create beautiful blogs, write engaging posts, and connect with readers around the globe.
            </p>
            <button
              onClick={() => onNavigate('signup')}
              className="inline-flex items-center space-x-2 px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold text-lg hover:bg-blue-50 transition-colors shadow-lg"
            >
              <span>Start Writing Today</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center space-x-2 mb-8">
          <TrendingUp className="w-6 h-6 text-blue-600" />
          <h2 className="text-3xl font-bold text-slate-800">Recent Posts</h2>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="text-slate-600">Loading posts...</div>
          </div>
        ) : recentPosts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm">
            <div className="text-slate-600 mb-4">No posts yet. Be the first to publish!</div>
            <button
              onClick={() => onNavigate('signup')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Your Blog
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {recentPosts.map(post => (
              <article
                key={post.id}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer overflow-hidden"
                onClick={() => onNavigate('post', { blogId: post.blog_id, postId: post.id })}
              >
                <div className="p-6">
                  <div className="flex items-center space-x-2 text-sm text-blue-600 font-medium mb-3">
                    <User className="w-4 h-4" />
                    <span>{post.blog.title}</span>
                  </div>

                  <h3 className="text-xl font-bold text-slate-800 mb-3 line-clamp-2">
                    {post.title}
                  </h3>

                  <p className="text-slate-600 mb-4 line-clamp-3">
                    {post.excerpt || post.content.slice(0, 150).replace(/<[^>]*>/g, '')}
                  </p>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <div className="flex items-center space-x-2 text-sm text-slate-500">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(post.published_at!).toLocaleDateString()}</span>
                    </div>
                    <span className="text-blue-600 font-medium text-sm hover:text-blue-700">
                      Read more →
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      <div className="bg-slate-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl font-bold">1</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Create Your Blog</h3>
              <p className="text-slate-300">
                Set up your blog in seconds with a beautiful, customizable design.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl font-bold">2</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Write Amazing Content</h3>
              <p className="text-slate-300">
                Use our intuitive editor to craft engaging posts that captivate readers.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl font-bold">3</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Share With The World</h3>
              <p className="text-slate-300">
                Publish your posts and reach readers across the platform instantly.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
