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
import type { Product, Category, ProductImage, ProductVariant } from '@/types/database';
import { toast } from 'sonner';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { Plus, Pencil, Trash2, Upload, X, ImagePlus, Loader2, Search, ArrowUpDown, Car, Package } from 'lucide-react';

const BUCKET = 'product-images';
type SortKey = 'name' | 'price' | 'created_at';
type SortDir = 'asc' | 'desc';
type VariantForm = {
  name: string;
  sku: string;
  price: number;
  compare_price: number;
  attributes: string;
};

// ─── Quick Stock Dialog ───────────────────────────────────────────────────────
interface QuickStockDialogProps {
  product: Product | null;
  open: boolean;
  onClose: () => void;
}

const QuickStockDialog = ({ product, open, onClose }: QuickStockDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [branches, setBranches] = useState<any[]>([]);
  const [variantId, setVariantId] = useState<string | null>(null);
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  useEffect(() => {
    if (open && product) {
      loadData();
    } else {
      setBranches([]);
      setVariantId(null);
      setQuantities({});
    }
  }, [open, product]);

  const loadData = async () => {
    if (!product) return;
    setLoading(true);
    try {
      // 1. Get existing variant or create a Default one
      const { data: vars } = await supabase
        .from('product_variants')
        .select('id')
        .eq('product_id', product.id)
        .order('created_at')
        .limit(1);

      let vid: string;
      if (vars && vars.length > 0) {
        vid = vars[0].id;
      } else {
        const { data: newVar, error } = await supabase
          .from('product_variants')
          .insert({ product_id: product.id, name: 'Default', price: product.base_price })
          .select('id')
          .single();
        if (error) throw error;
        vid = newVar.id;
      }
      setVariantId(vid);

      // 2. Get active branches or create a Main Branch
      const { data: existingBrs } = await supabase
        .from('branches')
        .select('*')
        .eq('is_active', true)
        .order('name');

      let brs = existingBrs || [];
      if (brs.length === 0) {
        const { data: newBr, error } = await supabase
          .from('branches')
          .insert({ name: 'Main Branch', is_active: true })
          .select()
          .single();
        if (error) throw error;
        brs = [newBr];
        toast.info('Created a "Main Branch" — rename it in Settings if needed.');
      }
      setBranches(brs);

      // 3. Load current stock for this variant
      const { data: invData } = await supabase
        .from('inventory')
        .select('*')
        .eq('variant_id', vid);

      const qtys: Record<string, number> = {};
      brs.forEach((b: any) => { qtys[b.id] = 0; });
      (invData || []).forEach((inv: any) => { qtys[inv.branch_id] = inv.quantity ?? 0; });
      setQuantities(qtys);
    } catch (e: any) {
      toast.error('Failed to load stock: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!variantId) return;
    setSaving(true);
    try {
      const upsertData = Object.entries(quantities).map(([branchId, quantity]) => ({
        variant_id: variantId,
        branch_id: branchId,
        quantity,
      }));
      const { error } = await supabase
        .from('inventory')
        .upsert(upsertData, { onConflict: 'variant_id,branch_id' });
      if (error) throw error;
      toast.success('Stock saved!');
      onClose();
    } catch (e: any) {
      toast.error('Failed to save: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) onClose(); }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-4 w-4 text-primary" />
            Set Stock
          </DialogTitle>
          {product && <p className="text-sm text-zinc-500 font-normal">{product.name}</p>}
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            <span className="ml-2 text-sm text-zinc-400">Loading…</span>
          </div>
        ) : (
          <div className="space-y-4 pt-1">
            {branches.length === 1 ? (
              <div>
                <Label className="text-xs text-zinc-500 uppercase tracking-wide">{branches[0].name}</Label>
                <div className="flex items-center gap-2 mt-2">
                  <Input
                    type="number"
                    min={0}
                    value={quantities[branches[0].id] ?? 0}
                    onChange={e => setQuantities({ ...quantities, [branches[0].id]: Math.max(0, +e.target.value) })}
                    className="text-2xl font-bold h-12"
                    autoFocus
                    onKeyDown={e => { if (e.key === 'Enter') handleSave(); }}
                  />
                  <span className="text-sm text-zinc-400 whitespace-nowrap">units</span>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-zinc-400 uppercase tracking-wide font-medium">Stock per branch</p>
                {branches.map((branch: any) => (
                  <div key={branch.id} className="flex items-center gap-3">
                    <span className="text-sm text-zinc-700 flex-1 truncate">{branch.name}</span>
                    <Input
                      type="number"
                      min={0}
                      value={quantities[branch.id] ?? 0}
                      onChange={e => setQuantities({ ...quantities, [branch.id]: Math.max(0, +e.target.value) })}
                      className="h-9 w-24 text-sm font-semibold text-right tabular-nums"
                    />
                    <span className="text-xs text-zinc-400 w-8">units</span>
                  </div>
                ))}
              </div>
            )}
            <Button className="w-full h-10" onClick={handleSave} disabled={saving}>
              {saving
                ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving…</>
                : 'Save Stock'}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

// ─── Compatibility Tab ────────────────────────────────────────────────────────
interface FlatVehicle {
  id: string;
  year: number;
  make: string;
  model: string;
}

interface CompatibilityTabProps {
  vehicles: FlatVehicle[];
  compatibleVehicles: string[];
  setCompatibleVehicles: (ids: string[]) => void;
  onSave: () => void;
}

const CompatibilityTab = ({ vehicles, compatibleVehicles, setCompatibleVehicles, onSave }: CompatibilityTabProps) => {
  const [filterMake, setFilterMake] = useState('');
  const [filterModel, setFilterModel] = useState('');

  const makes = Array.from(new Set(vehicles.map(v => v.make))).sort();
  const models = Array.from(
    new Set(vehicles.filter(v => !filterMake || v.make === filterMake).map(v => v.model))
  ).sort();
  const filtered = vehicles.filter(v =>
    (!filterMake || v.make === filterMake) &&
    (!filterModel || v.model === filterModel)
  );

  const allFilteredIds = filtered.map(v => v.id);
  const allChecked = allFilteredIds.length > 0 && allFilteredIds.every(id => compatibleVehicles.includes(id));

  const toggleAll = () => {
    if (allChecked) {
      setCompatibleVehicles(compatibleVehicles.filter(id => !allFilteredIds.includes(id)));
    } else {
      const merged = Array.from(new Set([...compatibleVehicles, ...allFilteredIds]));
      setCompatibleVehicles(merged);
    }
  };

  const toggle = (id: string, checked: boolean) => {
    if (checked) setCompatibleVehicles([...compatibleVehicles, id]);
    else setCompatibleVehicles(compatibleVehicles.filter(i => i !== id));
  };

  return (
    <div className="rounded-lg border p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Car className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">Compatible Vehicles</h3>
        {compatibleVehicles.length > 0 && (
          <span className="ml-auto text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
            {compatibleVehicles.length} selected
          </span>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs mb-1 block">Filter by Make</Label>
          <Select value={filterMake} onValueChange={v => { setFilterMake(v === '__all__' ? '' : v); setFilterModel(''); }}>
            <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="All Makes" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All Makes</SelectItem>
              {makes.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs mb-1 block">Filter by Model</Label>
          <Select value={filterModel} onValueChange={v => setFilterModel(v === '__all__' ? '' : v)} disabled={!filterMake}>
            <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="All Models" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All Models</SelectItem>
              {models.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
      {filtered.length > 1 && (
        <div className="flex items-center gap-3 px-3 py-2 bg-secondary/60 rounded-md border cursor-pointer hover:bg-secondary transition-colors" onClick={toggleAll}>
          <Switch checked={allChecked} onCheckedChange={toggleAll} />
          <Label className="cursor-pointer text-sm font-medium">
            Select all {filterMake || filterModel ? 'filtered' : ''} ({filtered.length} vehicles)
          </Label>
        </div>
      )}
      <div className="max-h-[260px] overflow-y-auto space-y-1 border rounded-md p-2 bg-secondary/20">
        {filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">No vehicles match the filter.</p>
        ) : (
          filtered.map(v => (
            <div
              key={v.id}
              className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors cursor-pointer ${
                compatibleVehicles.includes(v.id) ? 'bg-primary/10 border border-primary/20' : 'hover:bg-secondary'
              }`}
              onClick={() => toggle(v.id, !compatibleVehicles.includes(v.id))}
            >
              <Switch checked={compatibleVehicles.includes(v.id)} onCheckedChange={checked => toggle(v.id, checked)} />
              <span className="text-sm flex-1">
                <span className="font-medium">{v.make} {v.model}</span>
                <span className="text-muted-foreground ml-2 text-xs">{v.year}</span>
              </span>
            </div>
          ))
        )}
      </div>
      <Button onClick={onSave} className="w-full">Save Compatibility</Button>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const AdminProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [vehicles, setVehicles] = useState<FlatVehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('all');
  const [sortKey, setSortKey] = useState<SortKey>('created_at');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [activeTab, setActiveTab] = useState('details');

  // Quick stock
  const [stockProduct, setStockProduct] = useState<Product | null>(null);
  const [quickStockOpen, setQuickStockOpen] = useState(false);

  const [form, setForm] = useState({
    name: '', slug: '', description: '', category_id: '',
    base_price: 0, compare_price: 0, installable: false, featured: false,
  });

  const [images, setImages] = useState<ProductImage[]>([]);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [variantLoading, setVariantLoading] = useState(false);
  const [variantSaving, setVariantSaving] = useState(false);
  const [editingVariantId, setEditingVariantId] = useState<string | null>(null);
  const [variantForm, setVariantForm] = useState<VariantForm>({
    name: '',
    sku: '',
    price: 0,
    compare_price: 0,
    attributes: '{}',
  });
  const [compatibleVehicles, setCompatibleVehicles] = useState<string[]>([]);
  const [imgLoading, setImgLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imgPreview, setImgPreview] = useState<string | null>(null);
  const [imgFile, setImgFile] = useState<File | null>(null);
  const [imgPos, setImgPos] = useState('0');
  const [imgAlt, setImgAlt] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*, category:categories(*), images:product_images(*)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setProducts(data || []);
    } catch (e: any) {
      toast.error('Failed to load products: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    supabase.from('categories').select('*').order('name').then(({ data }) => setCategories(data || []));
    supabase.from('vehicle_makes').select('*, models:vehicle_models(*, vehicles(*))').order('name').then(({ data }) => {
      const flat: any[] = [];
      (data || []).forEach((make: any) => {
        (make.models || []).forEach((model: any) => {
          (model.vehicles || []).forEach((v: any) => {
            flat.push({ id: v.id, year: v.year, make: make.name, model: model.name });
          });
        });
      });
      flat.sort((a, b) => a.make.localeCompare(b.make) || a.model.localeCompare(b.model) || b.year - a.year);
      setVehicles(flat);
    });
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
    try {
      const { data } = await supabase.from('product_images').select('*').eq('product_id', productId).order('sort_order');
      setImages(data || []);
    } catch (e: any) {
      toast.error('Failed to load images: ' + e.message);
    } finally {
      setImgLoading(false);
    }
  };

  const fetchCompatibilities = async (productId: string) => {
    const { data } = await supabase.from('product_compatibility').select('vehicle_id').eq('product_id', productId);
    setCompatibleVehicles(data?.map(d => d.vehicle_id) || []);
  };

  const fetchVariants = async (productId: string) => {
    setVariantLoading(true);
    try {
      const { data, error } = await supabase
        .from('product_variants')
        .select('*')
        .eq('product_id', productId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      setVariants(data || []);
    } catch (e: any) {
      toast.error('Failed to load variants: ' + e.message);
      setVariants([]);
    } finally {
      setVariantLoading(false);
    }
  };

  const openCreate = () => {
    setEditing(null); setActiveTab('details');
    setForm({ name: '', slug: '', description: '', category_id: '', base_price: 0, compare_price: 0, installable: false, featured: false });
    setImages([]);
    setVariants([]);
    setEditingVariantId(null);
    setVariantForm({ name: '', sku: '', price: 0, compare_price: 0, attributes: '{}' });
    setCompatibleVehicles([]);
    setDialogOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p); setActiveTab('details');
    setForm({ name: p.name, slug: p.slug, description: p.description ?? '', category_id: p.category_id ?? '', base_price: p.base_price, compare_price: p.compare_price || 0, installable: p.installable ?? false, featured: p.featured ?? false });
    setImages([]);
    setVariants([]);
    setEditingVariantId(null);
    setVariantForm({ name: '', sku: '', price: p.base_price, compare_price: p.compare_price || 0, attributes: '{}' });
    fetchImages(p.id);
    fetchVariants(p.id);
    fetchCompatibilities(p.id);
    setDialogOpen(true);
  };

  const resetVariantForm = () => {
    setEditingVariantId(null);
    setVariantForm({
      name: '',
      sku: '',
      price: form.base_price || 0,
      compare_price: form.compare_price || 0,
      attributes: '{}',
    });
  };

  const startVariantEdit = (variant: ProductVariant) => {
    setEditingVariantId(variant.id);
    setVariantForm({
      name: variant.name,
      sku: variant.sku || '',
      price: variant.price,
      compare_price: variant.compare_price || 0,
      attributes: JSON.stringify(variant.attributes || {}, null, 2),
    });
  };

  const saveVariant = async () => {
    if (!editing?.id) {
      toast.error('Save product first, then add variants');
      return;
    }
    if (!variantForm.name.trim()) {
      toast.error('Variant name is required');
      return;
    }

    let parsedAttributes: Record<string, string> | null = null;
    const rawAttributes = variantForm.attributes.trim();
    if (rawAttributes && rawAttributes !== '{}') {
      try {
        const parsed = JSON.parse(rawAttributes);
        parsedAttributes = parsed && typeof parsed === 'object' ? parsed : null;
      } catch {
        toast.error('Attributes must be valid JSON');
        return;
      }
    }

    setVariantSaving(true);
    const payload = {
      product_id: editing.id,
      name: variantForm.name.trim(),
      sku: variantForm.sku.trim() || null,
      price: Math.max(0, variantForm.price),
      compare_price: variantForm.compare_price > 0 ? variantForm.compare_price : null,
      attributes: parsedAttributes,
    };

    try {
      if (editingVariantId) {
        const { data, error } = await supabase
          .from('product_variants')
          .update(payload)
          .eq('id', editingVariantId)
          .eq('product_id', editing.id)
          .select('*')
          .single();
        if (error) throw error;
        setVariants(prev => prev.map(v => (v.id === editingVariantId ? data : v)));
        toast.success('Variant updated');
      } else {
        const { data, error } = await supabase
          .from('product_variants')
          .insert(payload)
          .select('*')
          .single();
        if (error) throw error;
        setVariants(prev => [...prev, data]);
        toast.success('Variant added');
      }
      resetVariantForm();
      fetchProducts();
    } catch (e: any) {
      toast.error('Failed to save variant: ' + e.message);
    } finally {
      setVariantSaving(false);
    }
  };

  const deleteVariant = async (variantId: string) => {
    if (!editing?.id) return;
    if (!confirm('Delete this variant?')) return;
    const { error } = await supabase
      .from('product_variants')
      .delete()
      .eq('id', variantId)
      .eq('product_id', editing.id);
    if (error) {
      toast.error('Failed to delete variant: ' + error.message);
      return;
    }
    setVariants(prev => prev.filter(v => v.id !== variantId));
    if (editingVariantId === variantId) resetVariantForm();
    toast.success('Variant deleted');
    fetchProducts();
  };

  const handleSave = async () => {
    const slug = form.slug || form.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const data = {
      ...form,
      slug,
      category_id: form.category_id || null,
      compare_price: form.compare_price || null,
    };
    let savedProductId = editing?.id;

    if (editing) {
      const { error } = await supabase.from('products').update(data).eq('id', editing.id);
      if (error) { toast.error('Failed to update: ' + error.message); return; }
      toast.success('Product updated');
    } else {
      const { data: newProd, error } = await supabase.from('products').insert(data).select().single();
      if (error) { toast.error('Failed to create: ' + error.message); return; }
      savedProductId = newProd.id;
      toast.success('Product created');
    }

    if (savedProductId) {
      try {
        await supabase.from('product_compatibility').delete().eq('product_id', savedProductId);
        if (compatibleVehicles.length > 0) {
          const compatData = compatibleVehicles.map(vid => ({ product_id: savedProductId, vehicle_id: vid }));
          const { error: compatError } = await supabase.from('product_compatibility').insert(compatData);
          if (compatError) throw compatError;
        }
      } catch (e: any) {
        toast.error('Failed to save compatibility: ' + e.message);
        return;
      }
    }

    setDialogOpen(false);
    fetchProducts();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) {
      toast.error('Failed to delete: ' + error.message);
      return;
    }
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
    try {
      await supabase.from('product_images').delete().eq('id', img.id);
      toast.success('Image deleted'); if (editing) fetchImages(editing.id);
    } catch (e: any) {
      toast.error('Failed to delete image: ' + e.message);
    }
  };

  return (
    <div>
      <AdminPageHeader
        title={`Products (${displayed.length}${displayed.length !== products.length ? ` of ${products.length}` : ''})`}
        subtitle="Manage your product catalog"
        action={<Button size="sm" className="h-8 text-xs" onClick={openCreate}><Plus className="h-3.5 w-3.5 mr-1.5" /> Add Product</Button>}
      />

      <QuickStockDialog
        product={stockProduct}
        open={quickStockOpen}
        onClose={() => { setQuickStockOpen(false); setStockProduct(null); }}
      />

      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products…" className="pl-9" />
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
              <TabsTrigger value="variants" className="flex-1" disabled={!editing}>Variants {variants.length > 0 && `(${variants.length})`}</TabsTrigger>
              <TabsTrigger value="compatibility" className="flex-1">Compatibility {compatibleVehicles.length > 0 && `(${compatibleVehicles.length})`}</TabsTrigger>
              <TabsTrigger value="images" className="flex-1" disabled={!editing}>Images {images.length > 0 && `(${images.length})`}</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4 pt-2">
              <div><Label>Name</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="mt-1" /></div>
              <div><Label>Slug</Label><Input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} placeholder="auto-generated from name" className="mt-1" /></div>
              <div><Label>Description</Label><Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="mt-1" /></div>
              <div>
                <Label>Category</Label>
                <Select value={form.category_id || '__none__'} onValueChange={v => setForm({ ...form, category_id: v === '__none__' ? '' : v })}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">Unassigned</SelectItem>
                    {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
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

            <TabsContent value="variants" className="space-y-4 pt-2">
              {!editing ? (
                <p className="text-sm text-muted-foreground">Save the product first to manage variants.</p>
              ) : (
                <>
                  <Card className="p-4 space-y-3">
                    <p className="text-sm font-semibold">{editingVariantId ? 'Edit variant' : 'Add variant'}</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs">Variant name</Label>
                        <Input
                          value={variantForm.name}
                          onChange={e => setVariantForm({ ...variantForm, name: e.target.value })}
                          placeholder="e.g. Standard"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">SKU</Label>
                        <Input
                          value={variantForm.sku}
                          onChange={e => setVariantForm({ ...variantForm, sku: e.target.value })}
                          placeholder="Optional"
                          className="mt-1"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs">Price</Label>
                        <Input
                          type="number"
                          min={0}
                          value={variantForm.price}
                          onChange={e => setVariantForm({ ...variantForm, price: +e.target.value || 0 })}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Compare price</Label>
                        <Input
                          type="number"
                          min={0}
                          value={variantForm.compare_price}
                          onChange={e => setVariantForm({ ...variantForm, compare_price: +e.target.value || 0 })}
                          className="mt-1"
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs">Attributes JSON</Label>
                      <Textarea
                        value={variantForm.attributes}
                        onChange={e => setVariantForm({ ...variantForm, attributes: e.target.value })}
                        className="mt-1 font-mono text-xs min-h-24"
                        placeholder='{"color":"black","size":"L"}'
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button className="flex-1" onClick={saveVariant} disabled={variantSaving}>
                        {variantSaving ? 'Saving...' : editingVariantId ? 'Update Variant' : 'Add Variant'}
                      </Button>
                      {editingVariantId && (
                        <Button variant="outline" onClick={resetVariantForm}>Cancel Edit</Button>
                      )}
                    </div>
                  </Card>

                  <Card className="p-4">
                    <p className="text-sm font-semibold mb-3">Current variants</p>
                    {variantLoading ? (
                      <div className="flex items-center justify-center h-20">
                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                      </div>
                    ) : variants.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4 border rounded-lg border-dashed">No variants yet</p>
                    ) : (
                      <div className="space-y-2">
                        {variants.map(v => (
                          <div key={v.id} className="flex items-center gap-3 p-3 border rounded-lg">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{v.name}</p>
                              <p className="text-xs text-muted-foreground truncate">
                                {formatPKR(v.price)}{v.compare_price ? ` (was ${formatPKR(v.compare_price)})` : ''}{v.sku ? ` · SKU: ${v.sku}` : ''}
                              </p>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => startVariantEdit(v)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => deleteVariant(v.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </Card>
                </>
              )}
            </TabsContent>

            <TabsContent value="compatibility" className="space-y-4 pt-2">
              <CompatibilityTab
                vehicles={vehicles}
                compatibleVehicles={compatibleVehicles}
                setCompatibleVehicles={setCompatibleVehicles}
                onSave={handleSave}
              />
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
              <TableRow className="bg-zinc-50 hover:bg-zinc-50">
                <TableHead className="w-14">Image</TableHead>
                <TableHead className="cursor-pointer select-none" onClick={() => toggleSort('name')}>Name <SortIcon k="name" /></TableHead>
                <TableHead className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Category</TableHead>
                <TableHead className="cursor-pointer select-none" onClick={() => toggleSort('price')}>Price <SortIcon k="price" /></TableHead>
                <TableHead className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Featured</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayed.map(p => (
                <TableRow className="hover:bg-zinc-50/60" key={p.id}>
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
                    <Button
                      variant="ghost" size="icon"
                      title="Set stock"
                      onClick={() => { setStockProduct(p); setQuickStockOpen(true); }}
                    >
                      <Package className="h-4 w-4 text-zinc-500" />
                    </Button>
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