export interface BranchFields {
  address: string;
  map_iframe_url: string;
  map_link: string;
  hours: string;
}

export const getBranchFields = (addressValue: string | null): BranchFields => {
  if (addressValue && addressValue.trim().startsWith('{')) {
    try {
      const parsed = JSON.parse(addressValue);
      return {
        address: parsed.address || '',
        map_iframe_url: parsed.map_iframe_url || '',
        map_link: parsed.map_link || '',
        hours: parsed.hours || 'Mon–Sat: 10AM – 9PM',
      };
    } catch (e) {
      // Fallback below
    }
  }
  return {
    address: addressValue || '',
    map_iframe_url: '',
    map_link: '',
    hours: 'Mon–Sat: 10AM – 9PM',
  };
};

export const serializeBranchFields = (fields: BranchFields): string => {
  return JSON.stringify(fields);
};
