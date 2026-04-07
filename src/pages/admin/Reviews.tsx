import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { Review } from '@/types/database';
import { toast } from 'sonner';
import { Check, Trash2, Star, MessageSquare } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';

const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex gap-0.5">
    {Array.from({ length: 5 }).map((_, i) => (
      <Star key={i} className={`h-3.5 w-3.5 ${i < rating ? 'fill-amber-400 text-amber-400' : 'text-zinc-200'}`} />
    ))}
  </div>
);

const AdminReviews = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('reviews')
      .select('*, profile:profiles(*), product:products(name)')
      .order('is_approved', { ascending: true })
      .order('created_at', { ascending: false });
    if (error) toast.error('Failed to load reviews: ' + error.message);
    setReviews(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchReviews(); }, []);

  const approve = async (id: string) => {
    const { error } = await supabase.from('reviews').update({ is_approved: true }).eq('id', id);
    if (error) return toast.error(error.message);
    toast.success('Review approved');
    fetchReviews();
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this review?')) return;
    const { error } = await supabase.from('reviews').delete().eq('id', id);
    if (error) return toast.error(error.message);
    toast.success('Review deleted');
    fetchReviews();
  };

  const pending = reviews.filter(r => !r.is_approved).length;

  return (
    <div>
      <AdminPageHeader
        title={`Reviews (${reviews.length})`}
        subtitle={pending > 0 ? `${pending} pending approval` : 'All reviews moderated'}
        onRefresh={fetchReviews}
        refreshing={loading}
      />

      {loading ? (
        <Card className="shadow-none">
          <div className="divide-y">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex gap-4 p-4">
                <div className="h-3 bg-zinc-100 rounded w-28 animate-pulse" />
                <div className="h-3 bg-zinc-100 rounded w-40 animate-pulse" />
                <div className="h-3 bg-zinc-100 rounded w-20 animate-pulse ml-auto" />
              </div>
            ))}
          </div>
        </Card>
      ) : reviews.length === 0 ? (
        <div className="text-center py-16 text-zinc-400 border border-dashed border-zinc-200 rounded-xl bg-white">
          <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-30" />
          <p className="font-medium text-zinc-500">No reviews yet</p>
        </div>
      ) : (
        <Card className="shadow-none overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-zinc-50 hover:bg-zinc-50">
                <TableHead className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Customer</TableHead>
                <TableHead className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Product</TableHead>
                <TableHead className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Rating</TableHead>
                <TableHead className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Comment</TableHead>
                <TableHead className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Status</TableHead>
                <TableHead className="text-right text-xs font-semibold text-zinc-500 uppercase tracking-wide">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reviews.map(r => (
                <TableRow key={r.id} className={`hover:bg-zinc-50/60 ${!r.is_approved ? 'bg-amber-50/40' : ''}`}>
                  <TableCell className="font-medium text-sm text-zinc-900">{r.profile?.full_name || 'Anonymous'}</TableCell>
                  <TableCell className="max-w-[140px]">
                    <span className="truncate block text-sm text-zinc-600">{(r.product as any)?.name || '—'}</span>
                  </TableCell>
                  <TableCell><StarRating rating={r.rating} /></TableCell>
                  <TableCell className="max-w-[200px]">
                    <span className="truncate block text-sm text-zinc-500">{r.comment || '—'}</span>
                  </TableCell>
                  <TableCell>
                    {r.is_approved ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                        <Check className="h-3 w-3" /> Approved
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-[11px] font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                        Pending
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {!r.is_approved && (
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-emerald-50" onClick={() => approve(r.id)} title="Approve">
                          <Check className="h-4 w-4 text-emerald-600" />
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-red-50" onClick={() => remove(r.id)} title="Delete">
                        <Trash2 className="h-4 w-4 text-red-400" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
};

export default AdminReviews;