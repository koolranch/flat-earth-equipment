// app/verify/[code]/page.tsx
import React from "react";
import { I18nProvider } from "@/lib/i18n";
import { getUserLocale } from "@/lib/getUserLocale";
import VerifyContent from "./VerifyContent";

async function getVerification(code: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL ?? ''}/api/verify/${code}`, { cache: 'no-store' });
  if (!res.ok) return null;
  return res.json();
}

export default async function VerifyPage({ params }: { params: { code: string } }) {
  const data = await getVerification(params.code);
  
  return <VerifyContent data={data} />;
}
