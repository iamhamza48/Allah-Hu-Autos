// Curated Unsplash images for each category
// Using specific photo IDs for consistent, relevant results
export const categoryImages: Record<string, string> = {
  'ambient-lights':       'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=400&q=80&fit=crop',
  'antennas':             'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=400&q=80&fit=crop',
  'batman-mirror-covers': 'https://images.unsplash.com/photo-1549924231-f129b911e442?w=400&q=80&fit=crop',
  'body-kits':            'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?w=400&q=80&fit=crop',
  'brake-accessories':    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80&fit=crop',
  'cameras':              'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&q=80&fit=crop',
  'car-audio':            'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=400&q=80&fit=crop',
  'car-care-products':    'https://images.unsplash.com/photo-1607860108855-64acf2078ed9?w=400&q=80&fit=crop',
  'car-chargers':         'https://images.unsplash.com/photo-1609429019995-8c40f49535a5?w=400&q=80&fit=crop',
  'car-mats':             'https://images.unsplash.com/photo-1570733577524-3a047079e80d?w=400&q=80&fit=crop',
  'car-perfumes':         'https://images.unsplash.com/photo-1541643600914-78b084683702?w=400&q=80&fit=crop',
  'dashboard-accessories':'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400&q=80&fit=crop',
  'door-accessories':     'https://images.unsplash.com/photo-1549924231-f129b911e442?w=400&q=80&fit=crop',
  'exhaust-tips':         'https://images.unsplash.com/photo-1611821064430-0d40291d0f0b?w=400&q=80&fit=crop',
  'fog-lamps':            'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=400&q=80&fit=crop',
  'horns':                'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=400&q=80&fit=crop',
  'interior-accessories': 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400&q=80&fit=crop',
  'key-covers':           'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=400&q=80&fit=crop',
  'led-lights':           'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=400&q=80&fit=crop',
  'number-plate-frames':  'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=400&q=80&fit=crop',
  'phone-holders':        'https://images.unsplash.com/photo-1596558450268-9c27524ba856?w=400&q=80&fit=crop',
  'security-systems':     'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80&fit=crop',
  'side-mirror-accessories': 'https://images.unsplash.com/photo-1549924231-f129b911e442?w=400&q=80&fit=crop',
  'steering-covers':      'https://images.unsplash.com/photo-1504222490345-c075b7b9c82e?w=400&q=80&fit=crop',
  'tissue-box-holders':   'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400&q=80&fit=crop',
  'tow-accessories':      'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=400&q=80&fit=crop',
  'tyre-battery-tools':   'https://images.unsplash.com/photo-1558618047-f4f25d0c3bfb?w=400&q=80&fit=crop',
  'window-shades':        'https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?w=400&q=80&fit=crop',
  'window-tints':         'https://images.unsplash.com/photo-1590362891991-f776e747a588?w=400&q=80&fit=crop',
};

export const fallbackCategoryImage = 'https://images.unsplash.com/photo-1493238792000-8113da705763?w=400&q=80&fit=crop';

export function getCategoryImage(slug: string): string {
  return categoryImages[slug] || fallbackCategoryImage;
}
