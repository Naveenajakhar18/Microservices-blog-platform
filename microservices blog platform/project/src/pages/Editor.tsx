import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Post } from '../lib/supabase';
import { Save, ArrowLeft, Eye } from 'lucide-react';

interface EditorProps {
  blogId: string;
  postId?: string;
  onNavigate: (page: string) => void;
}

export function Editor({ blogId, postId, onNavigate }: EditorProps) {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  useEffect(() => {
    if (postId) {
      loadPost();
    }
  }, [postId]);

  const loadPost = async () => {
    const { data } = await supabase
      .from('posts')
      .select('*')
      .eq('id', postId)
      .maybeSingle();

    if (data) {
      setTitle(data.title);
      setContent(data.content);
      setExcerpt(data.excerpt);
    }
  };

  const savePost = async () => {
    setSaving(true);

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'untitled';
    const autoExcerpt = excerpt || content.slice(0, 200).replace(/<[^>]*>/g, '');

    try {
      if (postId) {
        await supabase
          .from('posts')
          .update({
            title,
            slug,
            content,
            excerpt: autoExcerpt,
            updated_at: new Date().toISOString(),
          })
          .eq('id', postId);
      } else {
        await supabase
          .from('posts')
          .insert({
            blog_id: blogId,
            user_id: user!.id,
            title: title || 'Untitled',
            slug,
            content,
            excerpt: autoExcerpt,
          });
      }

      setLastSaved(new Date());
    } catch (error) {
      console.error('Error saving post:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => onNavigate('dashboard')}
              className="flex items-center space-x-2 text-slate-600 hover:text-slate-800"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Dashboard</span>
            </button>

            <div className="flex items-center space-x-4">
              {lastSaved && (
                <span className="text-sm text-slate-500">
                  Saved {lastSaved.toLocaleTimeString()}
                </span>
              )}
              <button
                onClick={savePost}
                disabled={saving}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <Save className="w-5 h-5" />
                <span>{saving ? 'Saving...' : 'Save'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-8">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Post title..."
              className="w-full text-4xl font-bold text-slate-800 placeholder-slate-300 border-none focus:outline-none focus:ring-0 mb-4"
            />

            <input
              type="text"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Brief excerpt (optional, will auto-generate from content)..."
              className="w-full text-lg text-slate-600 placeholder-slate-300 border-none focus:outline-none focus:ring-0 mb-8"
            />

            <div className="border-t border-slate-200 pt-8">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Start writing your post..."
                className="w-full min-h-[500px] text-lg text-slate-700 placeholder-slate-300 border-none focus:outline-none focus:ring-0 resize-none leading-relaxed"
                style={{ lineHeight: '1.75' }}
              />
            </div>
          </div>
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Eye className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-medium text-blue-900 mb-1">Preview Your Post</h4>
              <p className="text-sm text-blue-700">
                Save your post, then return to the dashboard to publish it and make it visible to readers.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
