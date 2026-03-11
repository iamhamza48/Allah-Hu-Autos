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

  const fetch = async () => {
    const { data } = await supabase
      .from('reviews')
      .select('*, profile:profiles(*), product:products(*)')
      .order('created_at', { ascending: false });
    setReviews(data || []);
    setLoading(false);
  };
  useEffect(() => { fetch(); }, []);

  const approve = async (id: string) => {
    await supabase.from('reviews').update({ is_approved: true }).eq('id', id);
    toast.success('Approved');
    fetch();
  };

  const remove = async (id: string) => {
    if (!confirm('Delete?')) return;
    await supabase.from('reviews').delete().eq('id', id);
    toast.success('Deleted');
    fetch();
  };

  if (loading) return <div className="h-40 bg-secondary animate-pulse rounded-lg" />;

  return (
    <div>
      <h2 className="text-xl font-bold mb-6">Reviews ({reviews.length})</h2>
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Comment</TableHead>
              <TableHead>Approved</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reviews.map((r) => (
              <TableRow key={r.id}>
                <TableCell>{r.profile?.full_name || 'N/A'}</TableCell>
                <TableCell>{r.product?.name}</TableCell>
                <TableCell>
                  <div className="flex">{Array.from({ length: r.rating }).map((_, i) => <Star key={i} className="h-3 w-3 fill-warning text-warning" />)}</div>
                </TableCell>
                <TableCell className="max-w-[200px] truncate">{r.comment}</TableCell>
                <TableCell>{r.is_approved ? '✅' : '⏳'}</TableCell>
                <TableCell className="text-right">
                  {!r.is_approved && <Button variant="ghost" size="icon" onClick={() => approve(r.id)}><Check className="h-4 w-4 text-success" /></Button>}
                  <Button variant="ghost" size="icon" onClick={() => remove(r.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default AdminReviews;
