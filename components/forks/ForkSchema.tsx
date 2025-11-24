import Script from 'next/script';

export default function ForkSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": "How to Measure Forklift Carriage Class",
    "description": "Determine your forklift's carriage class by measuring the distance between the top and bottom bars.",
    "step": [
      {
        "@type": "HowToStep",
        "name": "Measure Top to Bottom",
        "text": "Use a tape measure to find the distance from the top edge of the upper carriage bar to the bottom edge of the lower carriage bar.",
        "image": "https://flatearthequipment.com/images/carriage-measure-guide.jpg"
      },
      {
        "@type": "HowToStep",
        "name": "Identify Class II (16 inches)",
        "text": "If the measurement is approximately 16 inches (407mm), your forklift has a Class II carriage."
      },
      {
        "@type": "HowToStep",
        "name": "Identify Class III (20 inches)",
        "text": "If the measurement is approximately 20 inches (508mm), your forklift has a Class III carriage."
      },
      {
        "@type": "HowToStep",
        "name": "Identify Class IV (25 inches)",
        "text": "If the measurement is approximately 25 inches (635mm), your forklift has a Class IV carriage."
      }
    ]
  };

  return (
    <Script
      id="fork-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
