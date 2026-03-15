import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { Review } from '@/types/database';
import { toast } from 'sonner';
import { Check, Trash2, Star } from 'lucide-react';

const AdminReviews = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    const { data, error } = await supabase
      .from('reviews')
      .select('*, profile:profiles(*), product:products(name)')
      .order('is_approved', { ascending: true })
      .order('created_at', { ascending: false });
    if (error) console.error('Reviews fetch error:', error.message);
    setReviews(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchReviews(); }, []);

  const approve = async (id: string) => {
    await supabase.from('reviews').update({ is_approved: true }).eq('id', id);
    toast.success('Review approved'); fetchReviews();
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this review?')) return;
    await supabase.from('reviews').delete().eq('id', id);
    toast.success('Review deleted'); fetchReviews();
  };

  if (loading) return <div className="h-40 bg-secondary animate-pulse rounded-lg" />;

  const pending = reviews.filter(r => !r.is_approved).length;

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <h2 className="text-xl font-bold">Reviews ({reviews.length})</h2>
        {pending > 0 && <span className="text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 px-2 py-1 rounded-full font-medium">{pending} pending approval</span>}
      </div>
      {reviews.length === 0 ? (
        <p className="text-muted-foreground text-center py-12 border rounded-lg border-dashed">No reviews yet</p>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Comment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reviews.map(r => (
                <TableRow key={r.id}>
                  <TableCell>{r.profile?.full_name || 'Anonymous'}</TableCell>
                  <TableCell className="max-w-[140px] truncate">{(r.product as any)?.name || '—'}</TableCell>
                  <TableCell>
                    <div className="flex">{Array.from({ length: r.rating }).map((_, i) => <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />)}</div>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">{r.comment || '—'}</TableCell>
                  <TableCell>{r.is_approved ? <span className="text-green-600 text-xs font-medium">Approved</span> : <span className="text-yellow-600 text-xs font-medium">Pending</span>}</TableCell>
                  <TableCell className="text-right">
                    {!r.is_approved && <Button variant="ghost" size="icon" onClick={() => approve(r.id)} title="Approve"><Check className="h-4 w-4 text-green-600" /></Button>}
                    <Button variant="ghost" size="icon" onClick={() => remove(r.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
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
