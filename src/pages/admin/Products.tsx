import { useState, useEffect, useRef, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatPKR } from '@/lib/format';
import type { Product, Category, ProductImage } from '@/types/database';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Upload, X, ImagePlus, Loader2, Search, ArrowUpDown } from 'lucide-react';

const BUCKET = 'product-images';
type SortKey = 'name' | 'price' | 'created_at';
type SortDir = 'asc' | 'desc';

const AdminProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('all');
  const [sortKey, setSortKey] = useState<SortKey>('created_at');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [activeTab, setActiveTab] = useState('details');
  const [form, setForm] = useState({
    name: '', slug: '', description: '', category_id: '',
    base_price: 0, compare_price: 0, installable: false, featured: false,
  });
  const [images, setImages] = useState<ProductImage[]>([]);
  const [imgLoading, setImgLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imgPreview, setImgPreview] = useState<string | null>(null);
  const [imgFile, setImgFile] = useState<File | null>(null);
  const [imgPos, setImgPos] = useState('0');
  const [imgAlt, setImgAlt] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchProducts = async () => {
    const { data } = await supabase
      .from('products')
      .select('*, category:categories(*), images:product_images(*)')
      .order('created_at', { ascending: false });
    setProducts(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
    supabase.from('categories').select('*').order('name').then(({ data }) => setCategories(data || []));
  }, []);

  const displayed = useMemo(() => {
    let list = [...products];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(q) || p.category?.name?.toLowerCase().includes(q));
    }
    if (filterCat !== 'all') list = list.filter(p => p.category_id === filterCat);
    list.sort((a, b) => {
      let av: any, bv: any;
      if (sortKey === 'name') { av = a.name; bv = b.name; }
      else if (sortKey === 'price') { av = a.base_price; bv = b.base_price; }
      else { av = a.created_at; bv = b.created_at; }
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return list;
  }, [products, search, filterCat, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const SortIcon = ({ k }: { k: SortKey }) => (
    <ArrowUpDown className={`h-3 w-3 ml-1 inline ${sortKey === k ? 'text-primary' : 'text-muted-foreground'}`} />
  );

  const fetchImages = async (productId: string) => {
    setImgLoading(true);
    const { data } = await supabase.from('product_images').select('*').eq('product_id', productId).order('sort_order');
    setImages(data || []);
    setImgLoading(false);
  };

  const openCreate = () => {
    setEditing(null); setActiveTab('details');
    setForm({ name: '', slug: '', description: '', category_id: '', base_price: 0, compare_price: 0, installable: false, featured: false });
    setImages([]); setDialogOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p); setActiveTab('details');
    setForm({ name: p.name, slug: p.slug, description: p.description, category_id: p.category_id, base_price: p.base_price, compare_price: p.compare_price || 0, installable: p.installable, featured: p.featured });
    setImages([]); fetchImages(p.id); setDialogOpen(true);
  };

  const handleSave = async () => {
    const slug = form.slug || form.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const data = { ...form, slug, compare_price: form.compare_price || null };
    if (editing) {
      const { error } = await supabase.from('products').update(data).eq('id', editing.id);
      if (error) { toast.error('Failed to update: ' + error.message); return; }
      toast.success('Product updated');
    } else {
      const { error } = await supabase.from('products').insert(data);
      if (error) { toast.error('Failed to create: ' + error.message); return; }
      toast.success('Product created');
    }
    setDialogOpen(false); fetchProducts();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    await supabase.from('products').delete().eq('id', id);
    toast.success('Product deleted'); fetchProducts();
  };

  const onImgFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setImgFile(file);
    const reader = new FileReader();
    reader.onload = ev => setImgPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
    if (!imgAlt && editing) setImgAlt(editing.name);
  };

  const clearImgFile = () => { setImgFile(null); setImgPreview(null); if (fileRef.current) fileRef.current.value = ''; };

  const uploadImage = async () => {
    if (!imgFile || !editing) return;
    setUploading(true);
    try {
      const ext = imgFile.name.split('.').pop()?.toLowerCase() || 'jpg';
      const path = `${editing.id}/${Date.now()}-pos${imgPos}.${ext}`;
      const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, imgFile, { upsert: true });
      if (upErr) throw upErr;
      const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(path);
      const { error: dbErr } = await supabase.from('product_images').insert({ product_id: editing.id, url: publicUrl, alt: imgAlt || editing.name, sort_order: parseInt(imgPos) });
      if (dbErr) throw dbErr;
      toast.success('Image uploaded!'); clearImgFile(); setImgAlt(''); fetchImages(editing.id);
    } catch (e: any) { toast.error(e.message); }
    setUploading(false);
  };

  const deleteImage = async (img: ProductImage) => {
    if (!confirm('Delete this image?')) return;
    await supabase.from('product_images').delete().eq('id', img.id);
    toast.success('Image deleted'); if (editing) fetchImages(editing.id);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Products ({displayed.length}{displayed.length !== products.length ? ` of ${products.length}` : ''})</h2>
        <Button onClick={openCreate}><Plus className="h-4 w-4 mr-1" /> Add Product</Button>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..." className="pl-9" />
        </div>
        <Select value={filterCat} onValueChange={setFilterCat}>
          <SelectTrigger className="w-48"><SelectValue placeholder="All categories" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={`${sortKey}-${sortDir}`} onValueChange={v => { const [k, d] = v.split('-'); setSortKey(k as SortKey); setSortDir(d as SortDir); }}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="created_at-desc">Newest first</SelectItem>
            <SelectItem value="created_at-asc">Oldest first</SelectItem>
            <SelectItem value="name-asc">Name A–Z</SelectItem>
            <SelectItem value="name-desc">Name Z–A</SelectItem>
            <SelectItem value="price-asc">Price low–high</SelectItem>
            <SelectItem value="price-desc">Price high–low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? `Edit: ${editing.name}` : 'Add Product'}</DialogTitle></DialogHeader>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full">
              <TabsTrigger value="details" className="flex-1">Details</TabsTrigger>
              <TabsTrigger value="images" className="flex-1" disabled={!editing}>Images {images.length > 0 && `(${images.length})`}</TabsTrigger>
            </TabsList>
            <TabsContent value="details" className="space-y-4 pt-2">
              <div><Label>Name</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="mt-1" /></div>
              <div><Label>Slug</Label><Input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} placeholder="auto-generated from name" className="mt-1" /></div>
              <div><Label>Description</Label><Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="mt-1" /></div>
              <div>
                <Label>Category</Label>
                <Select value={form.category_id} onValueChange={v => setForm({ ...form, category_id: v })}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>{categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Sale Price (PKR)</Label><Input type="number" value={form.base_price} onChange={e => setForm({ ...form, base_price: +e.target.value })} className="mt-1" /></div>
                <div><Label>Compare Price (PKR)</Label><Input type="number" value={form.compare_price} onChange={e => setForm({ ...form, compare_price: +e.target.value })} className="mt-1" /></div>
              </div>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2"><Switch checked={form.installable} onCheckedChange={v => setForm({ ...form, installable: v })} /><Label>Installable</Label></div>
                <div className="flex items-center gap-2"><Switch checked={form.featured} onCheckedChange={v => setForm({ ...form, featured: v })} /><Label>Featured on homepage</Label></div>
              </div>
              <Button onClick={handleSave} className="w-full">Save Product</Button>
            </TabsContent>
            <TabsContent value="images" className="space-y-4 pt-2">
              <Card className="p-4 space-y-3">
                <p className="text-sm font-semibold">Upload new image</p>
                {imgPreview ? (
                  <div className="relative rounded-lg overflow-hidden border aspect-video bg-secondary">
                    <img src={imgPreview} alt="preview" className="w-full h-full object-contain" />
                    <button onClick={clearImgFile} className="absolute top-2 right-2 bg-black/60 rounded-full p-1 hover:bg-black/80"><X className="h-3 w-3 text-white" /></button>
                  </div>
                ) : (
                  <div className="rounded-lg border-2 border-dashed aspect-video bg-secondary flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors" onClick={() => fileRef.current?.click()}>
                    <ImagePlus className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">Click to select image</p>
                    <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onImgFile} />
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Position</Label>
                    <Select value={imgPos} onValueChange={setImgPos}>
                      <SelectTrigger className="mt-1 h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Main (0)</SelectItem>
                        <SelectItem value="1">Secondary (1)</SelectItem>
                        <SelectItem value="2">Extra (2)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div><Label className="text-xs">Alt text</Label><Input value={imgAlt} onChange={e => setImgAlt(e.target.value)} placeholder={editing?.name} className="mt-1 h-8 text-xs" /></div>
                </div>
                <Button className="w-full" onClick={uploadImage} disabled={!imgFile || uploading}>
                  {uploading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
                  {uploading ? 'Uploading...' : 'Upload image'}
                </Button>
              </Card>
              <div>
                <p className="text-sm font-semibold mb-2">Current images</p>
                {imgLoading ? (
                  <div className="flex items-center justify-center h-20"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
                ) : images.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6 border rounded-lg border-dashed">No images yet</p>
                ) : (
                  <div className="grid grid-cols-3 gap-3">
                    {images.map(img => (
                      <div key={img.id} className="relative group rounded-lg overflow-hidden border aspect-square bg-secondary">
                        <img src={img.url} alt={img.alt} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                          <Button variant="destructive" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => deleteImage(img)}><Trash2 className="h-3 w-3" /></Button>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-2 py-1"><p className="text-white text-xs">pos {img.sort_order}</p></div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {loading ? (
        <div className="h-40 rounded-lg bg-secondary animate-pulse" />
      ) : displayed.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground border rounded-lg border-dashed">
          <p className="font-medium">No products found</p>
          <p className="text-sm mt-1">Try adjusting your search or filter</p>
        </div>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-14">Image</TableHead>
                <TableHead className="cursor-pointer select-none" onClick={() => toggleSort('name')}>Name <SortIcon k="name" /></TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="cursor-pointer select-none" onClick={() => toggleSort('price')}>Price <SortIcon k="price" /></TableHead>
                <TableHead>Featured</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayed.map(p => (
                <TableRow key={p.id}>
                  <TableCell>
                    {p.images?.[0] ? (
                      <img src={p.images[0].url} alt={p.name} className="w-10 h-10 object-cover rounded-md border" />
                    ) : (
                      <div className="w-10 h-10 rounded-md border bg-secondary flex items-center justify-center">
                        <ImagePlus className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell>{p.category?.name}</TableCell>
                  <TableCell>{formatPKR(p.base_price)}</TableCell>
                  <TableCell>{p.featured ? '⭐' : '—'}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(p)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(p.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
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

export default AdminProducts;
