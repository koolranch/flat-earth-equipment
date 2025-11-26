import { Shippo } from 'shippo';

// Initialize Shippo with your API token
const shippoClient = new Shippo({
  apiKeyHeader: process.env.SHIPPO_API_TOKEN!
});

// Your company's business address (for outbound shipments)
const BUSINESS_ADDRESS = {
  name: "Flat Earth Equipment",
  street1: "30 N Gould St., Ste R",
  street2: "",
  city: "Sheridan",
  state: "WY",
  zip: "82801",
  country: "US",
  phone: "(888) 392-9175",
  email: "parts@flatearthequipment.com"
};

// Repair vendor address (where customers ship broken modules)
const REPAIR_VENDOR_ADDRESS = {
  name: "FS Repair Order",
  street1: "1015 Harrisburg Pike",
  street2: "",
  city: "Carlisle",
  state: "PA",
  zip: "17013",
  country: "US",
  phone: "", // Vendor phone number not shared for privacy
  email: "" // No email on shipping label
};

interface ShippingAddress {
  name: string;
  street1: string;
  street2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone?: string;
  email?: string;
}

/**
 * Create a prepaid return label for repair and return customers
 * Customer uses this to ship their broken module directly to your repair vendor
 */
export async function createReturnLabel(
  customerAddress: ShippingAddress,
  orderMetadata: {
    orderId: string;
    moduleType: string;
    firmwareVersion?: string;
  }
) {
  try {
    const shipment = await shippoClient.shipments.create({
      // FROM: Customer's address
      addressFrom: {
        name: customerAddress.name,
        street1: customerAddress.street1,
        street2: customerAddress.street2 || "",
        city: customerAddress.city,
        state: customerAddress.state,
        zip: customerAddress.zip,
        country: customerAddress.country,
        phone: customerAddress.phone || "",
        email: customerAddress.email || "",
      },
      // TO: Repair vendor address (not your business address)
      addressTo: REPAIR_VENDOR_ADDRESS,
      // Package details
      parcels: [{
        length: "12", // inches
        width: "10",
        height: "8",
        distanceUnit: "in" as const,
        weight: "5", // lbs - typical charger module weight
        massUnit: "lb" as const
      }],
      // Metadata for tracking (keep under 100 chars)
      metadata: JSON.stringify({
        type: "repair_return",
        order: orderMetadata.orderId.slice(-8),
        module: orderMetadata.moduleType.slice(0, 15),
        fw: orderMetadata.firmwareVersion?.slice(0, 8) || "unknown"
      })
    });

    // Get the cheapest ground shipping rate
    const rates = shipment.rates || [];
    const groundRate = rates.find((rate: any) => 
      rate.servicelevel?.name?.toLowerCase().includes('ground') ||
      rate.servicelevel?.name?.toLowerCase().includes('standard')
    ) || rates[0]; // fallback to first rate

    // Create the transaction (purchase the label)
    const transaction = await shippoClient.transactions.create({
      rate: groundRate.objectId,
      metadata: JSON.stringify({
        type: "repair_return",
        order: orderMetadata.orderId.slice(-8)
      })
    });

    return {
      labelUrl: transaction.labelUrl,
      trackingNumber: transaction.trackingNumber,
      trackingUrl: transaction.trackingUrlProvider,
      carrier: groundRate.provider,
      serviceName: groundRate.servicelevel?.name,
      cost: groundRate.amount
    };

  } catch (error) {
    console.error('Error creating return label:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      shippoError: error
    });
    throw new Error(`Failed to create return shipping label: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Create an outbound label for vendor to ship repaired module back to customer
 * Repair vendor uses this after completing the repair
 */
export async function createOutboundLabel(
  customerAddress: ShippingAddress,
  orderMetadata: {
    orderId: string;
    moduleType: string;
    repairNotes?: string;
  }
) {
  try {
    const shipment = await shippoClient.shipments.create({
      // FROM: Repair vendor address
      addressFrom: REPAIR_VENDOR_ADDRESS,
      // TO: Customer's address  
      addressTo: {
        name: customerAddress.name,
        street1: customerAddress.street1,
        street2: customerAddress.street2 || "",
        city: customerAddress.city,
        state: customerAddress.state,
        zip: customerAddress.zip,
        country: customerAddress.country,
        phone: customerAddress.phone || "",
        email: customerAddress.email || "",
      },
      // Package details
      parcels: [{
        length: "12",
        width: "10", 
        height: "8",
        distanceUnit: "in" as const,
        weight: "5",
        massUnit: "lb" as const
      }],
      // Metadata for tracking (keep under 100 chars)
      metadata: JSON.stringify({
        type: "repair_outbound",
        order: orderMetadata.orderId.slice(-8),
        module: orderMetadata.moduleType.slice(0, 15)
      })
    });

    // Get fastest shipping option (priority/expedited)
    const rates = shipment.rates || [];
    const expeditedRate = rates.find((rate: any) => 
      rate.servicelevel?.name?.toLowerCase().includes('priority') ||
      rate.servicelevel?.name?.toLowerCase().includes('express') ||
      rate.servicelevel?.name?.toLowerCase().includes('2-day')
    ) || rates[0];

    const transaction = await shippoClient.transactions.create({
      rate: expeditedRate.objectId,
      metadata: JSON.stringify({
        type: "repair_outbound",
        order: orderMetadata.orderId.slice(-8)
      })
    });

    return {
      labelUrl: transaction.labelUrl,
      trackingNumber: transaction.trackingNumber,
      trackingUrl: transaction.trackingUrlProvider,
      carrier: expeditedRate.provider,
      serviceName: expeditedRate.servicelevel?.name,
      cost: expeditedRate.amount
    };

  } catch (error) {
    console.error('Error creating outbound label:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      shippoError: error
    });
    throw new Error(`Failed to create outbound shipping label: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get tracking information for a shipment
 */
export async function getTrackingInfo(trackingNumber: string, carrier: string) {
  try {
    const track = await shippoClient.trackingStatus.get(trackingNumber, carrier);
    return {
      status: track.trackingStatus,
      location: track.trackingHistory?.[0]?.location,
      lastUpdate: track.trackingHistory?.[0]?.statusDate,
      estimatedDelivery: track.eta
    };
  } catch (error) {
    console.error('Error getting tracking info:', error);
    return null;
  }
} 