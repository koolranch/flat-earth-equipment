import QRCode from 'qrcode';

/**
 * Generate QR code as data URL for embedding in PDFs
 * @param url - URL to encode in QR code
 * @param options - QR code generation options
 * @returns Promise resolving to data URL string
 */
export async function qrDataUrl(url: string, options: {
  width?: number;
  margin?: number;
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
} = {}): Promise<string> {
  const defaultOptions = {
    width: 200,
    margin: 1,
    errorCorrectionLevel: 'M' as const,
    color: {
      dark: '#000000',
      light: '#FFFFFF'
    }
  };

  const qrOptions = { ...defaultOptions, ...options };

  try {
    return await QRCode.toDataURL(url, qrOptions);
  } catch (error) {
    console.error('QR code generation failed:', error);
    throw new Error(`Failed to generate QR code for URL: ${url}`);
  }
}

/**
 * Generate QR code as PNG buffer for direct PDF embedding
 * @param url - URL to encode in QR code
 * @param options - QR code generation options
 * @returns Promise resolving to PNG buffer
 */
export async function qrPngBuffer(url: string, options: {
  width?: number;
  margin?: number;
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
} = {}): Promise<Buffer> {
  const dataUrl = await qrDataUrl(url, options);
  
  // Extract base64 data from data URL
  const base64Data = dataUrl.split(',')[1];
  if (!base64Data) {
    throw new Error('Invalid QR code data URL generated');
  }
  
  return Buffer.from(base64Data, 'base64');
}

/**
 * Generate verification URL for a certificate
 * @param verificationCode - Certificate verification code
 * @param baseUrl - Base URL for the application
 * @returns Full verification URL
 */
export function getVerificationUrl(verificationCode: string, baseUrl?: string): string {
  const base = baseUrl || process.env.NEXT_PUBLIC_BASE_URL || 'https://www.flatearthequipment.com';
  return `${base.replace(/\/$/, '')}/verify/${verificationCode}`;
}

/**
 * Generate QR code for certificate verification
 * @param verificationCode - Certificate verification code
 * @param baseUrl - Base URL for the application
 * @param options - QR code generation options
 * @returns Promise resolving to QR code data URL
 */
export async function generateVerificationQR(
  verificationCode: string, 
  baseUrl?: string,
  options: {
    width?: number;
    margin?: number;
    errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  } = {}
): Promise<string> {
  const verifyUrl = getVerificationUrl(verificationCode, baseUrl);
  return await qrDataUrl(verifyUrl, options);
}

/**
 * Generate QR code PNG buffer for certificate verification
 * @param verificationCode - Certificate verification code
 * @param baseUrl - Base URL for the application
 * @param options - QR code generation options
 * @returns Promise resolving to PNG buffer
 */
export async function generateVerificationQRBuffer(
  verificationCode: string,
  baseUrl?: string,
  options: {
    width?: number;
    margin?: number;
    errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  } = {}
): Promise<Buffer> {
  const verifyUrl = getVerificationUrl(verificationCode, baseUrl);
  return await qrPngBuffer(verifyUrl, options);
}
