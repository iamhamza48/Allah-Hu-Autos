import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { Search, X, Upload, Trash2, ImagePlus, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

interface Product { id: string; name: string; category: { name: string } | null; }
interface QueueItem {
  id: number;
  file: File;
  preview: string;
  productId: string;
  productName: string;
  productCategory: string;
  sortOrder: number;
  alt: string;
  replaceExisting: boolean;
  status: 'pending' | 'uploading' | 'done' | 'error';
  error?: string;
}

const BUCKET = 'product-images';

const AdminImageUploader = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filtered, setFiltered] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [ddOpen, setDdOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState('0');
  const [altText, setAltText] = useState('');
  const [altAuto, setAltAuto] = useState(false);
  const [replaceExisting, setReplaceExisting] = useState(false);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    supabase
      .from('products')
      .select('id, name, categories(name)')
      .order('name')
      .then(({ data }) => {
        const mapped = (data || []).map((p: any) => ({
          id: p.id,
          name: p.name,
          category: p.categories,
        }));
        setProducts(mapped);
        setFiltered(mapped);
      });
  }, []);

  useEffect(() => {
    const q = search.trim().toLowerCase();
    setFiltered(q ? products.filter(p =>
      p.name.toLowerCase().includes(q) ||
      (p.category?.name || '').toLowerCase().includes(q)
    ) : products);
  }, [search, products]);

  const pickProduct = (p: Product) => {
    setSelectedProduct(p);
    setSearch('');
    setDdOpen(false);
    if (altAuto || !altText) { setAltText(p.name); setAltAuto(true); }
  };

  const clearProduct = () => {
    setSelectedProduct(null);
    setAltText('');
    setAltAuto(false);
    setTimeout(() => searchRef.current?.focus(), 30);
  };

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCurrentFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => {
      setPreview(ev.target?.result as string);
      if (selectedProduct && altAuto) setAltText(selectedProduct.name);
    };
    reader.readAsDataURL(file);
  };

  const addToQueue = () => {
    if (!currentFile) { toast.error('Select an image first'); return; }
    if (!selectedProduct) { toast.error('Select a product first'); return; }
    setQueue(q => [...q, {
      id: Date.now(),
      file: currentFile,
      preview: preview!,
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      productCategory: selectedProduct.category?.name || '',
      sortOrder: parseInt(sortOrder),
      alt: altText || selectedProduct.name,
      replaceExisting,
      status: 'pending',
    }]);
    // reset
    setCurrentFile(null);
    setPreview(null);
    if (fileRef.current) fileRef.current.value = '';
    setAltText('');
    setAltAuto(false);
    setReplaceExisting(false);
    clearProduct();
    toast.success('Added to queue');
  };

  const removeFromQueue = (id: number) => setQueue(q => q.filter(i => i.id !== id));
  const clearDone = () => setQueue(q => q.filter(i => i.status !== 'done'));

  const uploadAll = async () => {
    const pending = queue.filter(i => i.status === 'pending');
    if (!pending.length) { toast.error('No pending items'); return; }
    setUploading(true);
    setProgress(0);
    let done = 0;

    for (const item of pending) {
      setQueue(q => q.map(i => i.id === item.id ? { ...i, status: 'uploading' } : i));
      try {
        if (item.replaceExisting) {
          await supabase.from('product_images').delete().eq('product_id', item.productId);
        }
        const ext = item.file.name.split('.').pop()?.toLowerCase() || 'jpg';
        const path = `${item.productId}/${Date.now()}-pos${item.sortOrder}.${ext}`;
        const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, item.file, { upsert: true });
        if (upErr) throw upErr;
        const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(path);
        const { error: dbErr } = await supabase.from('product_images').insert({
          product_id: item.productId, url: publicUrl, alt: item.alt, sort_order: item.sortOrder,
        });
        if (dbErr) throw dbErr;
        setQueue(q => q.map(i => i.id === item.id ? { ...i, status: 'done' } : i));
      } catch (e: any) {
        setQueue(q => q.map(i => i.id === item.id ? { ...i, status: 'error', error: e.message } : i));
      }
      done++;
      setProgress(Math.round((done / pending.length) * 100));
    }

    setUploading(false);
    const errors = queue.filter(i => i.status === 'error').length;
    if (errors === 0) toast.success(`All ${done} images uploaded!`);
    else toast.error(`${done - errors} uploaded, ${errors} failed`);
  };

  const pending = queue.filter(i => i.status === 'pending').length;
  const doneCount = queue.filter(i => i.status === 'done').length;
  const errorCount = queue.filter(i => i.status === 'error').length;

  const statusIcon = (s: QueueItem['status']) => {
    if (s === 'done') return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    if (s === 'error') return <AlertCircle className="h-4 w-4 text-destructive" />;
    if (s === 'uploading') return <Loader2 className="h-4 w-4 animate-spin text-primary" />;
    return null;
  };

  const statusBadge = (s: QueueItem['status']) => {
    const map = { pending: 'secondary', uploading: 'default', done: 'default', error: 'destructive' } as const;
    return <Badge variant={map[s]} className={s === 'done' ? 'bg-green-500' : ''}>{s}</Badge>;
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Image Uploader</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: file picker */}
        <Card>
          <CardHeader><CardTitle className="text-base">1. Select Image</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Image file</Label>
              <Input ref={fileRef} type="file" accept="image/*" className="mt-1 cursor-pointer" onChange={onFile} />
            </div>
            {preview ? (
              <div className="relative rounded-lg overflow-hidden border aspect-video bg-secondary">
                <img src={preview} alt="preview" className="w-full h-full object-contain" />
                <button
                  onClick={() => { setPreview(null); setCurrentFile(null); if (fileRef.current) fileRef.current.value = ''; }}
                  className="absolute top-2 right-2 bg-black/60 rounded-full p-1 hover:bg-black/80 transition-colors"
                >
                  <X className="h-3 w-3 text-white" />
                </button>
              </div>
            ) : (
              <div className="rounded-lg border border-dashed aspect-video bg-secondary flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <ImagePlus className="h-8 w-8 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">Preview appears here</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right: product search + options */}
        <Card>
          <CardHeader><CardTitle className="text-base">2. Choose Product & Options</CardTitle></CardHeader>
          <CardContent className="space-y-4">

            {/* selected pill */}
            {selectedProduct ? (
              <div className="flex items-center gap-3 p-3 rounded-lg border border-primary bg-primary/5">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{selectedProduct.name}</p>
                  <p className="text-xs text-muted-foreground">{selectedProduct.category?.name}</p>
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7 flex-shrink-0" onClick={clearProduct}>
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <div className="relative">
                <Label>Search product ({products.length} available)</Label>
                <div className="relative mt-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    ref={searchRef}
                    value={search}
                    onChange={e => { setSearch(e.target.value); setDdOpen(true); }}
                    onFocus={() => setDdOpen(true)}
                    onBlur={() => setTimeout(() => setDdOpen(false), 150)}
                    placeholder="Type to search..."
                    className="pl-9"
                  />
                </div>
                {ddOpen && (
                  <div className="absolute z-50 top-full mt-1 left-0 right-0 bg-popover border rounded-md shadow-lg max-h-56 overflow-y-auto">
                    {filtered.length === 0 ? (
                      <p className="p-3 text-sm text-muted-foreground text-center">No products found</p>
                    ) : (
                      <>
                        {filtered.slice(0, 80).map(p => (
                          <button
                            key={p.id}
                            className="w-full text-left px-3 py-2 text-sm hover:bg-accent transition-colors border-b last:border-0"
                            onMouseDown={() => pickProduct(p)}
                          >
                            <p className="font-medium">{p.name}</p>
                            <p className="text-xs text-muted-foreground">{p.category?.name}</p>
                          </button>
                        ))}
                        {filtered.length > 80 && (
                          <p className="p-2 text-xs text-muted-foreground text-center">+{filtered.length - 80} more — keep typing</p>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            )}

            <div>
              <Label>Image position</Label>
              <Select value={sortOrder} onValueChange={setSortOrder}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Main image (position 0)</SelectItem>
                  <SelectItem value="1">Secondary image (position 1)</SelectItem>
                  <SelectItem value="2">Extra image (position 2)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Alt text</Label>
              <Input
                value={altText}
                onChange={e => { setAltText(e.target.value); setAltAuto(false); }}
                placeholder="Auto-filled from product name"
                className="mt-1"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="replace"
                checked={replaceExisting}
                onChange={e => setReplaceExisting(e.target.checked)}
                className="accent-primary"
              />
              <Label htmlFor="replace" className="cursor-pointer font-normal text-sm">
                Delete existing images for this product first
              </Label>
            </div>

            <Button className="w-full" onClick={addToQueue} disabled={!currentFile || !selectedProduct}>
              <ImagePlus className="h-4 w-4 mr-2" /> Add to queue
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Queue */}
      {queue.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-3">
                Upload Queue
                <div className="flex gap-2">
                  <Badge variant="secondary">{queue.length} total</Badge>
                  {pending > 0 && <Badge variant="secondary">{pending} pending</Badge>}
                  {doneCount > 0 && <Badge className="bg-green-500">{doneCount} done</Badge>}
                  {errorCount > 0 && <Badge variant="destructive">{errorCount} failed</Badge>}
                </div>
              </CardTitle>
              <div className="flex gap-2">
                {doneCount > 0 && (
                  <Button variant="outline" size="sm" onClick={clearDone}>Clear done</Button>
                )}
                <Button size="sm" onClick={uploadAll} disabled={uploading || pending === 0}>
                  {uploading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
                  Upload all
                </Button>
              </div>
            </div>
            {uploading && <Progress value={progress} className="mt-3 h-1.5" />}
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {queue.map(item => (
                <div
                  key={item.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                    item.status === 'done' ? 'border-green-200 bg-green-50/50 dark:border-green-900 dark:bg-green-950/20' :
                    item.status === 'error' ? 'border-destructive/30 bg-destructive/5' :
                    item.status === 'uploading' ? 'border-primary/30 bg-primary/5' :
                    'border-border bg-secondary/30'
                  }`}
                >
                  <img src={item.preview} alt="" className="w-12 h-12 object-cover rounded-md border flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{item.productName}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {item.productCategory} · {item.file.name} · pos {item.sortOrder}
                      {item.replaceExisting && ' · replaces existing'}
                      {item.error && <span className="text-destructive"> · {item.error}</span>}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {statusIcon(item.status)}
                    {statusBadge(item.status)}
                    {item.status === 'pending' && (
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeFromQueue(item.id)}>
                        <Trash2 className="h-3 w-3 text-muted-foreground" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminImageUploader;
