import React from 'react';
import QRCode from 'qrcode';

export async function renderCertificatePDF({ fullName, issuedAt, verifyUrl, trainerSignatureUrl, traineeSignatureUrl }: {
  fullName: string;
  issuedAt: string;
  verifyUrl: string;
  trainerSignatureUrl?: string | null;
  traineeSignatureUrl?: string | null;
}){
  const qrDataUrl = await QRCode.toDataURL(verifyUrl, { margin: 0, scale: 4 });
  // If you're using @react-pdf/renderer, compose a Document here; pseudo-markup below
  return (
    <div style={{ padding: 32, fontFamily: 'Inter' }}>
      <h1>Forklift Operator Certificate</h1>
      <p>Issued to: <strong>{fullName}</strong></p>
      <p>Date: {new Date(issuedAt).toLocaleDateString()}</p>
      <div style={{ display: 'flex', gap: 24, marginTop: 24 }}>
        <div>
          <img src={qrDataUrl} alt="Verify QR" width={120} height={120} />
          <div style={{ fontSize: 12, color: '#555' }}>Verify: {verifyUrl}</div>
        </div>
        <div style={{ marginLeft: 'auto', textAlign: 'center' }}>
          {traineeSignatureUrl && <img src={traineeSignatureUrl} alt="Trainee signature" style={{ maxWidth: 220, maxHeight: 80 }} />}
          <div style={{ fontSize: 12 }}>Trainee</div>
          {trainerSignatureUrl && <img src={trainerSignatureUrl} alt="Trainer signature" style={{ maxWidth: 220, maxHeight: 80, marginTop: 12 }} />}
          <div style={{ fontSize: 12 }}>Trainer</div>
        </div>
      </div>
    </div>
  );
}
