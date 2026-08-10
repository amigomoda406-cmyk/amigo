'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/lib/supabase/auth-context';
import { Star, Loader2, UserCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface Review {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  user_id: string;
  user_name?: string;
}

export default function ProductReviews({ productId }: { productId: string }) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('product_id', productId)
        .order('created_at', { ascending: false });

      if (error) {
        // If table doesn't exist yet, just catch quietly
        console.error(error);
        setReviews([]);
      } else {
        setReviews(data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('يجب تسجيل الدخول لإضافة تقييم');
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from('reviews').insert([
        {
          product_id: productId,
          user_id: user.id,
          rating,
          comment,
          user_name: user.user_metadata?.full_name || 'عميل',
        },
      ]);

      if (error) throw error;
      
      toast.success('تمت إضافة تقييمك بنجاح!');
      setComment('');
      setRating(5);
      fetchReviews();
    } catch (error: any) {
      toast.error('حدث خطأ أثناء إضافة التقييم. قد تحتاج لإعداد قاعدة البيانات أولاً.');
    } finally {
      setSubmitting(false);
    }
  };

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1)
    : 0;

  return (
    <div className="mt-12 border-t border-zinc-100 pt-8" id="reviews">
      <h3 className="text-xl font-black uppercase tracking-widest text-zinc-900 mb-6 flex items-center gap-2">
        تقييمات العملاء
        {reviews.length > 0 && <span className="bg-zinc-100 text-zinc-900 text-sm px-2 py-1 rounded-md">{averageRating} ⭐️</span>}
      </h3>

      {/* Write a review */}
      {user ? (
        <form onSubmit={handleSubmit} className="bg-zinc-50 p-6 rounded-2xl border border-zinc-100 mb-8">
          <h4 className="text-sm font-bold text-zinc-900 mb-4">أضف تقييمك</h4>
          <div className="flex items-center gap-2 mb-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className={`transition-colors ${rating >= star ? 'text-yellow-400' : 'text-zinc-300'}`}
              >
                <Star className="w-6 h-6 fill-current" />
              </button>
            ))}
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            required
            placeholder="اكتب تجربتك مع هذا المنتج..."
            className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 mb-4 min-h-[100px]"
          />
          <button 
            type="submit" 
            disabled={submitting}
            className="bg-zinc-900 text-white px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-zinc-800 transition-colors flex items-center gap-2"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'نشر التقييم'}
          </button>
        </form>
      ) : (
        <div className="bg-blue-50 text-blue-800 p-4 rounded-xl text-sm font-bold mb-8">
          يرجى <a href="/login" className="underline hover:text-blue-900">تسجيل الدخول</a> لتتمكن من كتابة تقييم.
        </div>
      )}

      {/* Reviews List */}
      {loading ? (
        <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-zinc-400" /></div>
      ) : reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white p-6 rounded-2xl border border-zinc-100">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <UserCircle2 className="w-8 h-8 text-zinc-300" />
                  <div>
                    <p className="text-sm font-bold text-zinc-900">{review.user_name || 'عميل'}</p>
                    <div className="flex text-yellow-400">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-current" />
                      ))}
                    </div>
                  </div>
                </div>
                <span className="text-[10px] text-zinc-400 font-bold">
                  {new Date(review.created_at).toLocaleDateString('ar-DZ')}
                </span>
              </div>
              <p className="text-sm text-zinc-700 mt-3 leading-relaxed">{review.comment}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-zinc-500 font-medium py-8 text-center bg-zinc-50 rounded-2xl">
          لا توجد تقييمات لهذا المنتج بعد. كن أول من يقيّم!
        </p>
      )}
    </div>
  );
}
