const brand = { name: 'Flat Earth Safety', color: '#F76511' };
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://flatearthequipment.com';

export const T = {
  enrolled: (email: string) => ({
    subject: 'You are enrolled — Forklift Training',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: ${brand.color}; margin: 0 0 20px 0; font-size: 24px;">${brand.name}</h1>
        <p style="font-size: 16px; line-height: 1.5; margin: 0 0 15px 0;">Welcome to your forklift operator safety training!</p>
        <p style="font-size: 14px; color: #666; margin: 0 0 20px 0;">Your account ${email} is enrolled and ready to begin.</p>
        <p style="margin: 20px 0;">
          <a href="${siteUrl}/training" style="background-color: ${brand.color}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">Start Training</a>
        </p>
        <p style="font-size: 12px; color: #999; margin-top: 30px;">This is an automated message from ${brand.name}.</p>
      </div>
    `
  }),
  
  exam_pass: (name: string) => ({
    subject: 'Exam passed — Certificate ready',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: ${brand.color}; margin: 0 0 20px 0;">Nice work, ${name}!</h2>
        <p style="font-size: 16px; line-height: 1.5; margin: 0 0 15px 0;">Congratulations on passing your forklift operator exam.</p>
        <p style="font-size: 14px; color: #666; margin: 0 0 20px 0;">Your certificate has been generated and is ready for download.</p>
        <p style="margin: 20px 0;">
          <a href="${siteUrl}/records" style="background-color: ${brand.color}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">View Certificate</a>
        </p>
        <p style="font-size: 12px; color: #999; margin-top: 30px;">Keep up the great work with safety training!</p>
      </div>
    `
  }),
  
  exam_fail: (name: string) => ({
    subject: 'Exam results — Keep going',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: ${brand.color}; margin: 0 0 20px 0;">Heads up, ${name}.</h2>
        <p style="font-size: 16px; line-height: 1.5; margin: 0 0 15px 0;">You did not pass the exam this time, but do not worry!</p>
        <p style="font-size: 14px; color: #666; margin: 0 0 20px 0;">Review your focus areas and take the exam again when you are ready.</p>
        <p style="margin: 20px 0;">
          <a href="${siteUrl}/training/exam" style="background-color: ${brand.color}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">Retake Exam</a>
        </p>
        <p style="font-size: 12px; color: #999; margin-top: 30px;">You have got this! Safety training takes practice.</p>
      </div>
    `
  }),
  
  cert_issued: (name: string, code: string) => ({
    subject: 'Certificate issued',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: ${brand.color}; margin: 0 0 20px 0; font-size: 24px;">Certificate Issued</h1>
        <p style="font-size: 16px; line-height: 1.5; margin: 0 0 15px 0;">Your forklift operator certification has been officially issued.</p>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0 0 10px 0; font-weight: bold;">Verification Details:</p>
          <p style="margin: 0; font-family: monospace; font-size: 18px; color: ${brand.color};">${code}</p>
        </div>
        <p style="margin: 20px 0;">
          <a href="${siteUrl}/verify/${code}" style="background-color: ${brand.color}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">Verify Certificate</a>
        </p>
        <p style="font-size: 12px; color: #999; margin-top: 30px;">Keep this verification code for your records. Employers can verify your certification anytime.</p>
      </div>
    `
  }),
  
  eval_finalized: (to: string, url: string) => ({
    subject: 'Practical evaluation PDF ready',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: ${brand.color}; margin: 0 0 20px 0; font-size: 24px;">Evaluation Complete</h1>
        <p style="font-size: 16px; line-height: 1.5; margin: 0 0 15px 0;">Your practical evaluation has been completed and the PDF is ready.</p>
        <p style="font-size: 14px; color: #666; margin: 0 0 20px 0;">This document serves as your employer's record of practical competency assessment.</p>
        <p style="margin: 20px 0;">
          <a href="${url}" style="background-color: ${brand.color}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">View Evaluation PDF</a>
        </p>
        <p style="font-size: 12px; color: #999; margin-top: 30px;">This evaluation PDF should be retained by your employer per OSHA requirements.</p>
      </div>
    `
  })
};
