import { NextResponse } from 'next/server';
import { createReturnLabel } from '@/lib/shippo';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Test customer address (you can customize this)
    const testCustomerAddress = {
      name: body.name || "Test Customer",
      street1: body.street1 || "123 Test Street",
      street2: body.street2 || "",
      city: body.city || "Denver",
      state: body.state || "CO", 
      zip: body.zip || "80202",
      country: "US",
      phone: "(555) 123-4567",
      email: "test@example.com"
    };

    // Test order metadata
    const testOrderMetadata = {
      orderId: `test_${Date.now()}`,
      moduleType: "Enersys 6LA20671",
      firmwareVersion: "v2.12"
    };

    console.log('🧪 Testing Shippo integration...');
    console.log('📍 Customer Address:', testCustomerAddress);
    console.log('📦 Order Metadata:', testOrderMetadata);

    // Generate the shipping label
    const shippingLabel = await createReturnLabel(testCustomerAddress, testOrderMetadata);

    console.log('✅ Shippo test successful!');
    console.log('📧 Label URL:', shippingLabel.labelUrl);
    console.log('📦 Tracking Number:', shippingLabel.trackingNumber);

    return NextResponse.json({
      success: true,
      message: 'Shippo integration working correctly!',
      data: {
        labelUrl: shippingLabel.labelUrl,
        trackingNumber: shippingLabel.trackingNumber,
        trackingUrl: shippingLabel.trackingUrl,
        carrier: shippingLabel.carrier,
        serviceName: shippingLabel.serviceName,
        cost: shippingLabel.cost
      }
    });

  } catch (error) {
    console.error('❌ Shippo test failed:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Shippo integration test failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 