import sgMail from '@sendgrid/mail';

const SG = process.env.SENDGRID_API_KEY;
const FROM = process.env.SENDGRID_FROM || 'noreply@flatearthequipment.com';
const TO = process.env.ADMIN_NOTIFICATIONS_TO || '';

export async function notifySubmission(payload: any){
  if (!SG || !TO) return;
  
  sgMail.setApiKey(SG);
  const subj = `[FEE] New ${payload.suggestion_type} submission — ${payload.brand}`;
  const text = JSON.stringify(payload, null, 2);
  
  try{ 
    await sgMail.send({ 
      to: TO.split(',').map(s=>s.trim()), 
      from: FROM, 
      subject: subj, 
      text 
    }); 
  }catch{}
}
