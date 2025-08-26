// app/verify/[code]/page.tsx
import React from "react";
import { I18nProvider } from "@/lib/i18n";
import { getUserLocale } from "@/lib/getUserLocale";
import VerifyContent from "./VerifyContent";
import ShareControls from "./ShareControls";
import QRCode from 'qrcode';

async function getVerification(code: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL ?? ''}/api/verify/${code}`, { cache: 'no-store' });
  if (!res.ok) return null;
  return res.json();
}

async function generateQRCode(text: string): Promise<string | null> {
  try {
    return await QRCode.toDataURL(text, {
      width: 256,
      margin: 2,
      color: {
        dark: '#0F172A',
        light: '#FFFFFF'
      }
    });
  } catch (error) {
    console.error('QR code generation failed:', error);
    return null;
  }
}

export default async function VerifyPage({ params }: { params: { code: string } }) {
  const verificationUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.flatearthequipment.com'}/verify/${params.code}`;
  
  // Fetch verification data and generate QR code in parallel
  const [data, qrCode] = await Promise.all([
    getVerification(params.code),
    generateQRCode(verificationUrl)
  ]);
  
  return (
    <div>
      <VerifyContent data={data} />
      {data && <ShareControls url={verificationUrl} qrCode={qrCode} />}
    </div>
  );
}
