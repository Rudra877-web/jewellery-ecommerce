// Service for Indian Pincode lookup and serviceability

export interface PincodeInfo {
  pincode: string;
  city: string;
  state: string;
  district?: string;
  serviceable: boolean;
  estimatedDays: number;
  codAvailable: boolean;
  shippingRate: number;
}

// Offline fallback map for top Indian pin regions
const PINCODE_MAP: Record<string, { city: string; state: string; days: number }> = {
  // Delhi NCR
  '110001': { city: 'Central Delhi', state: 'Delhi', days: 2 },
  '110005': { city: 'Karol Bagh', state: 'Delhi', days: 2 },
  '110006': { city: 'Chandni Chowk', state: 'Delhi', days: 2 },
  '110020': { city: 'Okhla', state: 'Delhi', days: 2 },
  '110092': { city: 'East Delhi', state: 'Delhi', days: 2 },
  '122001': { city: 'Gurugram', state: 'Haryana', days: 2 },
  '201301': { city: 'Noida', state: 'Uttar Pradesh', days: 2 },
  // Mumbai
  '400001': { city: 'Mumbai', state: 'Maharashtra', days: 2 },
  '400002': { city: 'Kalbadevi (Zaveri Bazaar)', state: 'Maharashtra', days: 2 },
  '400050': { city: 'Bandra', state: 'Maharashtra', days: 2 },
  '400051': { city: 'BKC', state: 'Maharashtra', days: 2 },
  '400078': { city: 'Bhandup', state: 'Maharashtra', days: 2 },
  // Bengaluru
  '560001': { city: 'Bengaluru', state: 'Karnataka', days: 3 },
  '560025': { city: 'Bengaluru (MG Road)', state: 'Karnataka', days: 3 },
  '560034': { city: 'Koramangala', state: 'Karnataka', days: 3 },
  '560038': { city: 'Indiranagar', state: 'Karnataka', days: 3 },
  '560100': { city: 'Electronic City', state: 'Karnataka', days: 3 },
  // Jaipur (Jewellery Hub)
  '302001': { city: 'Jaipur', state: 'Rajasthan', days: 2 },
  '302002': { city: 'Johari Bazaar', state: 'Rajasthan', days: 2 },
  '302017': { city: 'Malviya Nagar', state: 'Rajasthan', days: 2 },
  // Kolkata
  '700001': { city: 'Kolkata', state: 'West Bengal', days: 3 },
  '700007': { city: 'Burrabazar', state: 'West Bengal', days: 3 },
  '700016': { city: 'Park Street', state: 'West Bengal', days: 3 },
  // Chennai
  '600001': { city: 'Chennai', state: 'Tamil Nadu', days: 3 },
  '600017': { city: 'T. Nagar', state: 'Tamil Nadu', days: 3 },
  // Hyderabad
  '500001': { city: 'Hyderabad', state: 'Telangana', days: 3 },
  '500034': { city: 'Banjara Hills', state: 'Telangana', days: 3 },
  // Ahmedabad / Surat (Diamond hub)
  '380001': { city: 'Ahmedabad', state: 'Gujarat', days: 2 },
  '395001': { city: 'Surat', state: 'Gujarat', days: 2 },
  '395003': { city: 'Varachha (Diamond City)', state: 'Gujarat', days: 2 },
  // Pune
  '411001': { city: 'Pune', state: 'Maharashtra', days: 2 },
  // Lucknow
  '226001': { city: 'Lucknow', state: 'Uttar Pradesh', days: 3 },
  // Chandigarh
  '160001': { city: 'Chandigarh', state: 'Punjab', days: 2 },
};

// State mapping by PIN 1st digit for fallback
const PIN_PREFIX_STATE: Record<string, string> = {
  '11': 'Delhi',
  '12': 'Haryana',
  '13': 'Haryana',
  '14': 'Punjab',
  '15': 'Punjab',
  '16': 'Chandigarh',
  '17': 'Himachal Pradesh',
  '18': 'Jammu and Kashmir',
  '19': 'Jammu and Kashmir',
  '20': 'Uttar Pradesh',
  '21': 'Uttar Pradesh',
  '22': 'Uttar Pradesh',
  '23': 'Uttar Pradesh',
  '24': 'Uttarakhand',
  '25': 'Uttar Pradesh',
  '26': 'Uttarakhand',
  '27': 'Uttar Pradesh',
  '28': 'Uttar Pradesh',
  '30': 'Rajasthan',
  '31': 'Rajasthan',
  '32': 'Rajasthan',
  '33': 'Rajasthan',
  '34': 'Rajasthan',
  '36': 'Gujarat',
  '37': 'Gujarat',
  '38': 'Gujarat',
  '39': 'Gujarat',
  '40': 'Maharashtra',
  '41': 'Maharashtra',
  '42': 'Maharashtra',
  '43': 'Maharashtra',
  '44': 'Maharashtra',
  '45': 'Madhya Pradesh',
  '46': 'Madhya Pradesh',
  '47': 'Madhya Pradesh',
  '48': 'Madhya Pradesh',
  '49': 'Chhattisgarh',
  '50': 'Telangana',
  '51': 'Andhra Pradesh',
  '52': 'Andhra Pradesh',
  '53': 'Andhra Pradesh',
  '56': 'Karnataka',
  '57': 'Karnataka',
  '58': 'Karnataka',
  '59': 'Karnataka',
  '60': 'Tamil Nadu',
  '61': 'Tamil Nadu',
  '62': 'Tamil Nadu',
  '63': 'Tamil Nadu',
  '64': 'Tamil Nadu',
  '67': 'Kerala',
  '68': 'Kerala',
  '69': 'Kerala',
  '70': 'West Bengal',
  '71': 'West Bengal',
  '72': 'West Bengal',
  '73': 'West Bengal',
  '74': 'West Bengal',
  '75': 'Odisha',
  '76': 'Odisha',
  '77': 'Odisha',
  '78': 'Assam',
  '79': 'North Eastern States',
  '80': 'Bihar',
  '81': 'Bihar',
  '82': 'Jharkhand',
  '83': 'Jharkhand',
  '84': 'Bihar',
  '85': 'Bihar',
};

export async function lookupPincode(pincode: string): Promise<PincodeInfo | null> {
  const cleaned = pincode.trim().replace(/\D/g, '');
  if (cleaned.length !== 6) return null;

  // 1. Direct hit in curated major hubs
  if (PINCODE_MAP[cleaned]) {
    const info = PINCODE_MAP[cleaned];
    return {
      pincode: cleaned,
      city: info.city,
      state: info.state,
      serviceable: true,
      estimatedDays: info.days,
      codAvailable: true,
      shippingRate: 0, // Free insured shipping on jewellery
    };
  }

  // 2. Try online India Post postal lookup API with 1.5s timeout
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1500);
    const res = await fetch(`https://api.postalpincode.in/pincode/${cleaned}`, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data[0]?.Status === 'Success' && data[0]?.PostOffice?.length > 0) {
        const po = data[0].PostOffice[0];
        return {
          pincode: cleaned,
          city: po.District || po.Name,
          state: po.State,
          district: po.District,
          serviceable: true,
          estimatedDays: 4,
          codAvailable: true,
          shippingRate: 0,
        };
      }
    }
  } catch {
    // Network or timeout, fallback gracefully
  }

  // 3. Fallback to PIN prefix zone deduction
  const prefix2 = cleaned.substring(0, 2);
  const state = PIN_PREFIX_STATE[prefix2] || 'India';
  return {
    pincode: cleaned,
    city: `District ${cleaned.substring(0, 3)}`,
    state: state,
    serviceable: true,
    estimatedDays: 4,
    codAvailable: true,
    shippingRate: 0,
  };
}
