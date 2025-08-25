import React from 'react';

interface JsonLdProps {
  json: any;
}

export default function JsonLd({ json }: JsonLdProps) {
  return (
    <script 
      type="application/ld+json" 
      dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }} 
    />
  );
}
