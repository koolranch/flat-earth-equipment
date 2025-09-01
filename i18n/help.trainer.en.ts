export default {
  title: 'Trainer Guide',
  intro: 'Assign seats, evaluate practical skills, and export records.',
  sections: [
    { 
      h: 'Assign seats', 
      p: 'Go to Trainer Tools → Assign Seats. Paste emails or upload CSV. Existing users are enrolled; new emails are invited.', 
      tips: ['Use CSV with an email column', 'You can assign to multiple courses'] 
    },
    { 
      h: 'Roster & progress', 
      p: 'Filter by course, search by name/email, and export CSV for records.', 
      tips: ['Verify codes and PDFs appear after passing'] 
    },
    { 
      h: 'Practical evaluation', 
      p: 'Open Roster → Evaluate. Fill evaluator name/title, site, date, and sign. Mark practical pass to refresh the certificate.', 
      tips: ['Signatures are stored with time and user id'] 
    },
    { 
      h: 'Verify certificates', 
      p: 'Anyone can visit /verify/{code} to validate a certificate.', 
      tips: ['Codes are unique and QR-linked on the PDF'] 
    }
  ]
}
