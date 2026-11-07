// Shiprocket Integration Service with Sandbox/Mock mode fallback

export interface ShiprocketCredentials {
  email?: string;
  password?: string;
  sandbox?: boolean;
}

export interface ServiceabilityResult {
  serviceable: boolean;
  rate: number;
  courierName: string;
  courierCompanyId?: number;
  estimatedDeliveryDays: number;
  codAvailable: boolean;
  mockMode?: boolean;
}

export interface ShiprocketOrderResult {
  success: boolean;
  shiprocketOrderId?: string;
  shipmentId?: string;
  awbCode?: string;
  courierName?: string;
  trackingUrl?: string;
  error?: string;
  mockMode?: boolean;
}

let cachedToken: string | null = null;
let tokenExpiresAt: number = 0;

/**
 * Verify Shiprocket API credentials
 */
export async function verifyShiprocketCredentials(
  email?: string,
  password?: string
): Promise<{ success: boolean; message?: string; error?: string }> {
  const cleanEmail = (email || process.env.SHIPROCKET_EMAIL || '').trim();
  const cleanPass = (password || process.env.SHIPROCKET_PASSWORD || '').trim();

  if (!cleanEmail || !cleanPass) {
    return {
      success: false,
      error: 'Shiprocket email and password are required. Please provide credentials.',
    };
  }

  try {
    console.log(
      `[Shiprocket Auth Verify]: Testing credentials with Email: "${cleanEmail}", Password length: ${cleanPass.length}`
    );

    const res = await fetch('https://apiv2.shiprocket.in/v1/external/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: cleanEmail, password: cleanPass }),
    });

    if (!res.ok) {
      const errText = await res.text();
      let parsedMsg = errText;
      try {
        const json = JSON.parse(errText);
        parsedMsg = json.message || errText;
      } catch {}

      if (res.status === 403 || parsedMsg.toLowerCase().includes('invalid email and password')) {
        return {
          success: false,
          error:
            'Invalid email and password combination (403). Shiprocket requires a dedicated API User generated from: Shiprocket Dashboard -> Settings -> API -> Configure -> Add New API User (Do NOT use your main dashboard login credentials).',
        };
      }

      return { success: false, error: parsedMsg };
    }

    const data = await res.json();
    if (data.token) {
      cachedToken = data.token;
      tokenExpiresAt = Date.now() + 9 * 24 * 60 * 60 * 1000;
      return { success: true, message: 'Shiprocket API connected successfully! Token generated.' };
    }
    return { success: false, error: 'Token not received from Shiprocket response' };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to connect to Shiprocket API',
    };
  }
}

/**
 * Obtain or refresh Shiprocket API Token
 */
async function getShiprocketToken(creds?: ShiprocketCredentials): Promise<string | null> {
  const email = (creds?.email || process.env.SHIPROCKET_EMAIL || '').trim();
  const password = (creds?.password || process.env.SHIPROCKET_PASSWORD || '').trim();
  if (!email || !password) return null;

  const now = Date.now();
  if (cachedToken && tokenExpiresAt > now) {
    return cachedToken;
  }

  try {
    console.log(
      `[Shiprocket Auth]: Attempting login with Email: "${email}", Password length: ${password.length}`
    );

    const res = await fetch('https://apiv2.shiprocket.in/v1/external/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.warn(
        '[Shiprocket Auth Error]:',
        errText,
        '\n(Tip: Shiprocket requires a dedicated API User created under Shiprocket Panel -> Settings -> API -> Add New API User, NOT your main account login.)'
      );
      return null;
    }

    const data = await res.json();
    if (data.token) {
      cachedToken = data.token;
      // Tokens are typically valid for 10 days
      tokenExpiresAt = now + 9 * 24 * 60 * 60 * 1000;
      return cachedToken;
    }
  } catch (err) {
    console.error('[Shiprocket Auth Exception]:', err);
  }
  return null;
}

/**
 * Check delivery serviceability and rates for customer pincode
 */
export async function checkShiprocketServiceability(
  deliveryPincode: string,
  pickupPincode: string = '110001',
  weightKg: number = 0.5,
  isCod: boolean = false,
  creds?: ShiprocketCredentials
): Promise<ServiceabilityResult> {
  const token = creds ? await getShiprocketToken(creds) : null;

  // Real Shiprocket API Call if token exists
  if (token) {
    try {
      const url = `https://apiv2.shiprocket.in/v1/external/courier/serviceability/?pickup_postcode=${pickupPincode}&delivery_postcode=${deliveryPincode}&weight=${weightKg}&cod=${isCod ? 1 : 0}`;
      const res = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const json = await res.json();
        const couriers = json?.data?.available_courier_companies;
        if (couriers && couriers.length > 0) {
          const bestCourier = couriers[0];
          return {
            serviceable: true,
            rate: Math.round(Number(bestCourier.rate || 0)),
            courierName: bestCourier.courier_name,
            courierCompanyId: bestCourier.courier_company_id,
            estimatedDeliveryDays: Number(bestCourier.estimated_delivery_days || 3),
            codAvailable: Boolean(bestCourier.cod),
            mockMode: false,
          };
        }
      }
    } catch (e) {
      console.warn('[Shiprocket API Serviceability Exception, falling back to mock]:', e);
    }
  }

  // Graceful Sandbox / Mock Mode
  const isEligible = deliveryPincode.length === 6 && /^\d+$/.test(deliveryPincode);
  return {
    serviceable: isEligible,
    rate: 0, // Complimentary insured shipping for fine jewellery
    courierName: 'BlueDart Express Air (Insured)',
    courierCompanyId: 101,
    estimatedDeliveryDays: 2,
    codAvailable: true,
    mockMode: true,
  };
}

/**
 * Create Shiprocket Adhoc Order and generate AWB
 */
export async function createShiprocketOrder(
  order: {
    orderNumber: string;
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    shippingAddress: string;
    city: string;
    state: string;
    pincode: string;
    totalAmount: number;
    subtotal: number;
    paymentMethod: string;
    items: Array<{
      name: string;
      sku: string;
      quantity: number;
      price: number;
    }>;
  },
  creds?: ShiprocketCredentials
): Promise<ShiprocketOrderResult> {
  const token = creds ? await getShiprocketToken(creds) : null;

  if (token) {
    try {
      // 1. Fetch available pickup locations from seller's Shiprocket account
      let pickupLocation = 'Primary';
      try {
        const pickupRes = await fetch('https://apiv2.shiprocket.in/v1/external/settings/company/pickup', {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
        if (pickupRes.ok) {
          const pickupData = await pickupRes.json();
          const shippingAddresses = pickupData?.data?.shipping_address;
          if (Array.isArray(shippingAddresses) && shippingAddresses.length > 0) {
            const primaryLoc =
              shippingAddresses.find(
                (loc: { is_primary_location?: number | boolean }) =>
                  loc.is_primary_location === 1 || loc.is_primary_location === true
              ) || shippingAddresses[0];
            pickupLocation = primaryLoc.pickup_location || 'Primary';
          } else {
            console.warn(
              '[Shiprocket Warning]: No Pickup Address found in your Shiprocket account. Please add one in Shiprocket Dashboard -> Settings -> Pickup Addresses.'
            );
          }
        }
      } catch (pickupErr) {
        console.warn('[Shiprocket Pickup Query Warning]:', pickupErr);
      }

      // 2. Prepare and sanitize customer name and contact details
      const fullName = (order.customerName || 'Customer').trim();
      const nameParts = fullName.split(/\s+/);
      const firstName = nameParts[0] || 'Customer';
      const lastName = nameParts.slice(1).join(' ') || firstName;
      const cleanAddress = (order.shippingAddress || 'Address').trim();
      const cleanCity = (order.city || 'City').trim();
      const cleanState = (order.state || 'State').trim();
      const cleanPincode = (order.pincode || '110001').trim();
      const cleanPhone = (order.customerPhone || '9876543210').replace(/\D/g, '').slice(-10);
      const cleanEmail = (order.customerEmail || 'customer@jewellerymate.com').trim();

      const payload = {
        order_id: order.orderNumber,
        order_date: new Date().toISOString().replace('T', ' ').substring(0, 19),
        pickup_location: pickupLocation,
        billing_customer_name: firstName,
        billing_last_name: lastName,
        billing_address: cleanAddress,
        billing_address_2: '',
        billing_city: cleanCity,
        billing_pincode: cleanPincode,
        billing_state: cleanState,
        billing_country: 'India',
        billing_email: cleanEmail,
        billing_phone: cleanPhone,
        shipping_is_billing: true,
        shipping_customer_name: firstName,
        shipping_last_name: lastName,
        shipping_address: cleanAddress,
        shipping_address_2: '',
        shipping_city: cleanCity,
        shipping_pincode: cleanPincode,
        shipping_state: cleanState,
        shipping_country: 'India',
        shipping_email: cleanEmail,
        shipping_phone: cleanPhone,
        order_items: order.items.map((it) => ({
          name: it.name || 'Fine Jewellery Item',
          sku: it.sku || `SKU-${Date.now()}`,
          units: Number(it.quantity) || 1,
          selling_price: Number(it.price) || 0,
        })),
        payment_method: order.paymentMethod === 'COD' ? 'COD' : 'Prepaid',
        sub_total: Number(order.subtotal) || Number(order.totalAmount) || 0,
        length: 12,
        breadth: 10,
        height: 6,
        weight: 0.35,
      };

      const res = await fetch('https://apiv2.shiprocket.in/v1/external/orders/create/adhoc', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        const shiprocketOrderId = String(data.order_id);
        const shipmentId = String(data.shipment_id);

        // Attempt AWB generation
        let awbCode: string | undefined;
        let courierName = 'Blue Dart Express';
        let awbErrorNotice: string | undefined;
        try {
          const awbRes = await fetch('https://apiv2.shiprocket.in/v1/external/courier/assign/awb', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ shipment_id: shipmentId }),
          });
          const awbData = await awbRes.json();
          console.log('[Shiprocket AWB Result]:', JSON.stringify(awbData));

          if (awbRes.ok && awbData?.response?.data?.awb_code) {
            awbCode = awbData.response.data.awb_code;
            courierName = awbData.response.data.courier_name || courierName;
          } else {
            awbErrorNotice =
              awbData?.response?.data?.awb_assign_error ||
              awbData?.message ||
              'AWB pending: Wallet recharge or courier allocation needed in Shiprocket.';
            console.warn('[Shiprocket AWB Pending Reason]:', awbErrorNotice);
          }
        } catch (awbErr) {
          console.warn('[Shiprocket AWB Assignment Exception]:', awbErr);
          awbErrorNotice = 'AWB pending: Courier assignment timeout or pending.';
        }

        return {
          success: true,
          shiprocketOrderId,
          shipmentId,
          awbCode,
          courierName,
          error: awbErrorNotice,
          trackingUrl: awbCode
            ? `https://shiprocket.co/tracking/${awbCode}`
            : `https://shiprocket.co/tracking/${shiprocketOrderId}`,
          mockMode: false,
        };
      } else {
        const errorText = await res.text();
        console.warn('[Shiprocket Order Creation Error]:', errorText);
      }
    } catch (e: unknown) {
      console.error('[Shiprocket Order Creation Exception]:', e);
    }
  }

  // Graceful Sandbox / Mock Mode
  const randomSuffix = Math.floor(100000 + Math.random() * 900000);
  const mockShiprocketOrderId = `SR-${order.orderNumber}-${randomSuffix}`;
  const mockShipmentId = `SHP-${randomSuffix}`;
  const mockAwb = `AWB-JM-${randomSuffix}`;

  return {
    success: true,
    shiprocketOrderId: mockShiprocketOrderId,
    shipmentId: mockShipmentId,
    awbCode: mockAwb,
    courierName: 'Blue Dart Luxury Secured Logistics',
    trackingUrl: `/track-order?orderNumber=${encodeURIComponent(order.orderNumber)}&awb=${mockAwb}`,
    mockMode: true,
  };
}
