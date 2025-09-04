const brand = { name: 'Flat Earth Safety', color: '#F76511' };
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://flatearthequipment.com';

export function pickLocale(l?: string) { 
  return (l === 'es' ? 'es' : 'en'); 
}

export const T = {
  enrolled: (email: string, locale?: string) => {
    const L = pickLocale(locale);
    return L === 'es' 
      ? ({
          subject: 'Inscripción confirmada — Capacitación de montacargas',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h1 style="color: ${brand.color}; margin: 0 0 20px 0; font-size: 24px;">${brand.name}</h1>
              <p style="font-size: 16px; line-height: 1.5; margin: 0 0 15px 0;">¡Bienvenido a tu capacitación de operador de montacargas!</p>
              <p style="font-size: 14px; color: #666; margin: 0 0 20px 0;">Tu cuenta ${email} está inscrita y lista para comenzar.</p>
              <p style="margin: 20px 0;">
                <a href="${siteUrl}/training" style="background-color: ${brand.color}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">Comenzar capacitación</a>
              </p>
              <p style="font-size: 12px; color: #999; margin-top: 30px;">Este es un mensaje automatizado de ${brand.name}.</p>
            </div>
          `
        })
      : ({
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
        });
  },
  
  exam_pass: (name: string, locale?: string) => {
    const L = pickLocale(locale);
    return L === 'es'
      ? ({
          subject: 'Aprobaste el examen — Certificado listo',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: ${brand.color}; margin: 0 0 20px 0;">¡Buen trabajo, ${name}!</h2>
              <p style="font-size: 16px; line-height: 1.5; margin: 0 0 15px 0;">Felicidades por aprobar tu examen de operador de montacargas.</p>
              <p style="font-size: 14px; color: #666; margin: 0 0 20px 0;">Tu certificado ha sido generado y está listo para descargar.</p>
              <p style="margin: 20px 0;">
                <a href="${siteUrl}/records" style="background-color: ${brand.color}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">Ver certificado</a>
              </p>
              <p style="font-size: 12px; color: #999; margin-top: 30px;">¡Sigue con el excelente trabajo en capacitación de seguridad!</p>
            </div>
          `
        })
      : ({
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
        });
  },
  
  exam_fail: (name: string, locale?: string) => {
    const L = pickLocale(locale);
    return L === 'es'
      ? ({
          subject: 'Resultados del examen — Sigue adelante',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: ${brand.color}; margin: 0 0 20px 0;">Atención, ${name}.</h2>
              <p style="font-size: 16px; line-height: 1.5; margin: 0 0 15px 0;">Esta vez no aprobaste el examen, ¡pero no te preocupes!</p>
              <p style="font-size: 14px; color: #666; margin: 0 0 20px 0;">Revisa tus áreas de enfoque e inténtalo de nuevo cuando estés listo.</p>
              <p style="margin: 20px 0;">
                <a href="${siteUrl}/training/exam" style="background-color: ${brand.color}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">Repetir examen</a>
              </p>
              <p style="font-size: 12px; color: #999; margin-top: 30px;">¡Tú puedes! La capacitación de seguridad requiere práctica.</p>
            </div>
          `
        })
      : ({
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
        });
  },
  
  cert_issued: (name: string, code: string, locale?: string) => {
    const L = pickLocale(locale);
    return L === 'es'
      ? ({
          subject: 'Certificado emitido',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h1 style="color: ${brand.color}; margin: 0 0 20px 0; font-size: 24px;">Certificado emitido</h1>
              <p style="font-size: 16px; line-height: 1.5; margin: 0 0 15px 0;">Tu certificación de operador de montacargas ha sido emitida oficialmente.</p>
              <div style="background-color: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0 0 10px 0; font-weight: bold;">ID de verificación:</p>
                <p style="margin: 0; font-family: monospace; font-size: 18px; color: ${brand.color};">${code}</p>
              </div>
              <p style="margin: 20px 0;">
                <a href="${siteUrl}/verify/${code}" style="background-color: ${brand.color}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">Verificar certificado</a>
              </p>
              <p style="font-size: 12px; color: #999; margin-top: 30px;">Guarda este código de verificación en tus registros. Los empleadores pueden verificar tu certificación en cualquier momento.</p>
            </div>
          `
        })
      : ({
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
        });
  },
  
  eval_finalized: (to: string, url: string, locale?: string) => {
    const L = pickLocale(locale);
    return L === 'es'
      ? ({
          subject: 'PDF de evaluación práctica listo',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h1 style="color: ${brand.color}; margin: 0 0 20px 0; font-size: 24px;">Evaluación completa</h1>
              <p style="font-size: 16px; line-height: 1.5; margin: 0 0 15px 0;">Tu evaluación práctica ha sido completada y el PDF está listo.</p>
              <p style="font-size: 14px; color: #666; margin: 0 0 20px 0;">Este documento sirve como registro de tu empleador de la evaluación de competencia práctica.</p>
              <p style="margin: 20px 0;">
                <a href="${url}" style="background-color: ${brand.color}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">Ver PDF de evaluación</a>
              </p>
              <p style="font-size: 12px; color: #999; margin-top: 30px;">Este PDF de evaluación debe ser conservado por tu empleador según los requisitos de OSHA.</p>
            </div>
          `
        })
      : ({
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
        });
  }
};
