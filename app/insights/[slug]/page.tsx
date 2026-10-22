import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getBlogPost } from '@/lib/mdx';
import Script from 'next/script';
import RelatedItems from '@/components/RelatedItems';
import { TableOfContents, AmperageCalculator, QuickReferenceCard } from '@/components/BasicInteractiveComponents';
import { StructuredData } from '@/components/SEOComponents';
import { generatePageAlternates } from '@/app/seo-defaults';
import BreadcrumbJsonLd from '@/components/seo/BreadcrumbJsonLd';

type Props = {
  params: {
    slug: string;
  };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const post = await getBlogPost(params.slug);

    if (!post) {
      return {
        title: 'Post Not Found', // Template adds " | Flat Earth Equipment"
        description: 'The requested post could not be found.',
      };
    }

    // Normalize keywords (frontmatter may use keywords or tags)
    const rawKeywords = (post.keywords ?? post.tags) as string | string[] | undefined;
    const normalizedKeywords = Array.isArray(rawKeywords) 
      ? rawKeywords 
      : (typeof rawKeywords === 'string' ? rawKeywords.split(',').map(k => k.trim()) : []);

    // Safely handle potentially empty or missing fields
    const title = post.title || 'Industry Insight';
    const description = (post.description && post.description.length > 0) 
      ? post.description.slice(0, 160) 
      : 'Industry insights and equipment maintenance tips from Flat Earth Equipment.';

    return {
      title, // Don't add suffix - layout.tsx title template adds " | Flat Earth Equipment"
      description,
      keywords: normalizedKeywords,
      alternates: generatePageAlternates(`/insights/${params.slug}`),
      openGraph: {
        title,
        description,
        type: 'article',
        publishedTime: post.date || new Date().toISOString(),
        ...(post.image && { images: [post.image] }),
      },
    };
  } catch (error) {
    // Graceful fallback if metadata generation fails
    console.error(`Error generating metadata for insight ${params.slug}:`, error);
    return {
      title: 'Industry Insight', // Template adds " | Flat Earth Equipment"
      description: 'Industry insights and equipment maintenance tips.',
    };
  }
}

export default async function BlogPost({ params }: Props) {
  const post = await getBlogPost(params.slug);

  if (!post) {
    notFound();
  }

  // Normalize keywords (frontmatter may use keywords or tags)
  const rawKeywords = (post.keywords ?? post.tags) as string | string[] | undefined;
  const normalizedKeywords = Array.isArray(rawKeywords) 
    ? rawKeywords 
    : (typeof rawKeywords === 'string' ? rawKeywords.split(',').map(k => k.trim()) : []);

  // Get related posts based on keywords
  const relatedItems = normalizedKeywords.map(keyword => ({
    name: keyword,
    href: `/insights?keyword=${encodeURIComponent(keyword)}`
  }));

  // Check if this is a forklift charger guide for special treatment
  const isChargerGuide = params.slug === 'complete-guide-forklift-battery-chargers' || 
                         params.slug === 'how-to-choose-forklift-battery-charger' ||
                         params.slug === 'forklift-charger-voltage-comparison' ||
                         params.slug === 'fast-vs-overnight-forklift-charging' ||
                         params.slug === 'lithium-forklift-battery-chargers-complete-guide' ||
                         params.slug === 'lead-acid-vs-lithium-forklift-chargers' ||
                         params.slug === 'bms-integration-lithium-forklift-chargers';

  const isCertGuide = params.slug === 'how-to-get-forklift-certified';

  const certFAQs = isCertGuide
    ? [
        {
          question: 'Can I get fully forklift certified online?',
          answer:
            'No. Online or app training covers OSHA formal instruction. You still need practical training and a workplace performance evaluation by a qualified person on the equipment you will use.',
        },
        {
          question: 'Do I need an in-person classroom course to get forklift certified?',
          answer:
            'Not for the knowledge portion. OSHA allows interactive computer and video instruction for formal training. Many operators complete theory online or in the Forklift Certified app for $49 (study free in the app, pay at the exam), then finish evaluation with their employer on-site.',
        },
        {
          question: 'How much does forklift certification cost?',
          answer:
            'Flat Earth Equipment formal instruction is $49 online, or free to study in the app with $49 due only at the final exam. This page does not publish an in-person price. The employer still handles the required hands-on evaluation.',
        },
        {
          question: 'How long does it take to get forklift certified?',
          answer:
            'Formal instruction often takes under an hour online or in the app. On-site practice and evaluation usually happen the same day or within a few days. Many operators go from start to evaluated within a week.',
        },
        {
          question: 'Does forklift certification transfer to a new employer?',
          answer:
            'Not automatically. Your training history helps, but the new employer must evaluate you on their equipment in their workplace and maintain their own certification records.',
        },
      ]
    : [];

  const isJcbJoystickGuide = params.slug === 'jcb-telehandler-joystick-controls';

  const jcbJoystickFAQs = isJcbJoystickGuide
    ? [
        {
          question: 'How do JCB telehandler joystick controls work?',
          answer:
            'JCB telehandlers use a single, fully proportional, seat-mounted servo joystick to control boom lift/lower, extend/retract, and crowd/dump (tilt), plus auxiliary hydraulics via a rocker or roller on the grip. The joystick only arms when the seat switch is engaged.',
        },
        {
          question: 'What should I check before replacing a JCB telehandler joystick?',
          answer:
            'Check the seat switch, the multi-pin connector at the joystick base for corrosion or a loose latch, and the harness for chafe points along the seat riser. If only one function fails while others work, the fault is usually inside the joystick itself and replacement is the fix.',
        },
        {
          question: 'Are left-hand and right-hand joysticks interchangeable?',
          answer:
            'No. LH and RH joystick assemblies are built for a specific cab mounting position and are not interchangeable. Always confirm LH/RH, function count, and your model/serial number before ordering.',
        },
        {
          question: 'Can I use an aftermarket JCB joystick like 332/X6237?',
          answer:
            'Yes, once you have confirmed LH/RH position, function count, and fitment against your model and serial number. Eligible aftermarket JCB parts, including joysticks, ship with a 2-year warranty.',
        },
        {
          question: 'Where can I buy JCB telehandler joystick and cab parts online?',
          answer:
            "You can browse in-stock aftermarket JCB joystick, seat, and fork parts online, with fitment details listed on each part page. If you don't see your exact part number, request a quote and we'll help confirm the right fit.",
        },
      ]
    : [];

  // FAQ data for structured data - different for each guide
  const getChargerFAQs = (slug: string) => {
    if (slug === 'complete-guide-forklift-battery-chargers') {
      return [
        {
          question: "What voltage charger do I need for my forklift?",
          answer: "The charger voltage must match your battery voltage exactly. Check your battery nameplate or count the cells (each cell = 2V). Common voltages are 24V (12 cells), 36V (18 cells), 48V (24 cells), and 80V (40 cells). Never use a charger with different voltage than your battery."
        },
        {
          question: "How do I calculate the right amperage for my forklift charger?",
          answer: "This page does not publish a required amperage or a charge-time formula. Voltage still has to match the battery."
        },
        {
          question: "Can I use a higher amperage charger to charge faster?",
          answer: "This page does not publish a battery-life year count for a charge rate."
        },
        {
          question: "What's the difference between single-phase and three-phase chargers?",
          answer: "This page does not publish an input voltage or an output amp."
        },
        {
          question: "Do I need special ventilation for forklift battery charging?",
          answer: "This page does not publish a ventilation rate or a CFM formula."
        },
        {
          question: "Can I use aftermarket chargers with my Crown/Toyota/Yale forklift?",
          answer: "A listing is not a fit for every truck. Voltage and amperage still have to match the battery. This page does not publish a percent off an OEM charger."
        }
      ];
    } else if (slug === 'how-to-choose-forklift-battery-charger') {
      return [
        {
          question: "How do I know what voltage charger I need?",
          answer: "Check your battery nameplate for voltage marking, or count the cells (each cell = 2V). Common voltages are 24V (12 cells), 36V (18 cells), 48V (24 cells), and 80V (40 cells). The charger voltage must match your battery voltage exactly - never use a different voltage."
        },
        {
          question: "What happens if I use the wrong amperage charger?",
          answer: "This page does not publish a required amperage or a charge rate. Voltage still has to match the battery."
        },
        {
          question: "Can I use any charger brand with my forklift?",
          answer: "A listing is not a fit for every truck. Voltage still has to match the battery. This page does not publish a connector for every brand."
        },
        {
          question: "Do I need single-phase or three-phase power?",
          answer: "This page does not publish an input voltage or an output amp."
        },
        {
          question: "How much should I expect to spend on a forklift charger?",
          answer: "The price is on the product page. This page does not publish a price band by voltage."
        },
        {
          question: "What's the difference between overnight and fast charging?",
          answer: "This page does not publish a battery-life year count for a charge rate."
        }
      ];
    } else if (slug === 'lithium-forklift-battery-chargers-complete-guide') {
      return [
        {
          question: "What makes lithium forklift chargers different from lead-acid chargers?",
          answer: "A lead-acid charger is not a lithium charger. This page does not publish a charge time or an efficiency percent."
        },
        {
          question: "Do I need a special charger for lithium forklift batteries?",
          answer: "Yes, lithium batteries require chargers with BMS communication capability and lithium-specific charging profiles. Standard lead-acid chargers cannot properly charge lithium batteries and may damage them or create safety hazards."
        },
        {
          question: "How fast can lithium forklift batteries charge?",
          answer: "This page does not publish a required amperage or a charge-time formula. Voltage still has to match the battery. A lead-acid charger is not a lithium charger."
        },
        {
          question: "Are lithium forklift chargers more expensive?",
          answer: "The price is on the product page. This page does not publish a percent more than a lead-acid charger or a five-year total."
        },
        {
          question: "Can I use opportunity charging with lithium forklift batteries?",
          answer: "Yes, lithium batteries are optimized for opportunity charging. You can charge during breaks, lunch periods, or any downtime without damaging the battery. This eliminates the need for battery swapping and enables continuous multi-shift operations."
        },
        {
          question: "Do lithium forklift chargers require special installation?",
          answer: "Lithium chargers require adequate electrical capacity for fast charging and proper grounding, but they don't need special ventilation like lead-acid chargers. They're often easier to install due to no hydrogen gas ventilation requirements and smaller space needs."
        }
      ];
    } else if (slug === 'lead-acid-vs-lithium-forklift-chargers') {
      return [
        {
          question: "What's the main difference between lead-acid and lithium forklift chargers?",
          answer: "This page does not publish a charge time, an efficiency percent, or a price gap versus lead-acid. A lead-acid charger is not a lithium charger."
        },
        {
          question: "Which is more cost-effective: lead-acid or lithium forklift chargers?",
          answer: "The price is on the product page. This page does not publish a percent more than a lead-acid charger or a five-year total."
        },
        {
          question: "Can I upgrade from lead-acid to lithium chargers?",
          answer: "Yes, but you'll need new chargers since lead-acid chargers cannot charge lithium batteries. The upgrade requires BMS-compatible chargers, updated charging stations, and staff training. Most forklifts can use lithium batteries with proper voltage matching."
        },
        {
          question: "Which charging technology is better for multi-shift operations?",
          answer: "Lithium chargers are strongly recommended for multi-shift operations. They enable opportunity charging between shifts, eliminate battery swapping, and support continuous 24/7 operations. Lead-acid requires multiple battery sets and complex rotation systems."
        },
        {
          question: "Do lithium forklift chargers require special safety considerations?",
          answer: "This page does not publish a fire class or a ventilation requirement."
        },
        {
          question: "How long do lead-acid vs lithium forklift chargers last?",
          answer: "This page does not publish a charger lifespan or a maintenance interval."
        }
      ];
    } else if (slug === 'bms-integration-lithium-forklift-chargers') {
      return [
        {
          question: "What is BMS integration and why is it needed for lithium forklift chargers?",
          answer: "BMS (Battery Management System) integration allows the charger to communicate with the battery's control unit for real-time monitoring and safety. Unlike lead-acid batteries, lithium batteries require dynamic charging adjustments based on cell conditions, temperature monitoring, and safety coordination to prevent damage and optimize performance."
        },
        {
          question: "What communication protocols do lithium forklift chargers use?",
          answer: "This page does not publish a protocol, a baud rate, or a termination resistance."
        },
        {
          question: "Can any lithium charger work with any lithium forklift battery?",
          answer: "No, the charger and BMS must use compatible communication protocols and data formats. While voltage must match exactly, compatibility also requires matching CAN bus message IDs, data structures, and timing requirements. Always verify compatibility before purchasing."
        },
        {
          question: "How do I troubleshoot BMS communication errors?",
          answer: "This page does not publish a troubleshooting procedure, a termination resistance, or a baud rate."
        },
        {
          question: "What safety features does BMS integration provide?",
          answer: "BMS integration provides overvoltage/undervoltage protection, temperature monitoring with thermal shutoff, current limiting based on cell conditions, fault detection and reporting, and emergency stop coordination. This creates multiple layers of safety protection beyond what lead-acid chargers offer."
        },
        {
          question: "Do I need special training for BMS-integrated lithium chargers?",
          answer: "Yes, staff should understand BMS communication basics, fault code interpretation, proper connection procedures, and safety protocols specific to lithium technology. The complexity is higher than lead-acid chargers but the operational benefits justify the learning investment."
        }
      ];
    } else if (slug === 'forklift-charger-voltage-comparison') {
      return [
        {
          question: "What's the difference between 24V, 36V, 48V, and 80V forklift chargers?",
          answer: "The charger voltage has to match the battery. This page does not publish which truck uses 24V, 36V, 48V, or 80V."
        },
        {
          question: "Which forklift charger voltage is most common?",
          answer: "This page does not publish a most-common voltage. The charger voltage has to match the battery on the truck."
        },
        {
          question: "Can I use a different voltage charger than my battery?",
          answer: "No, never use a different voltage charger than your battery. This can cause fires, explosions, or equipment damage. Always verify the battery voltage on the nameplate and ensure your charger matches exactly - 24V battery needs 24V charger, 48V battery needs 48V charger, etc."
        },
        {
          question: "Do I need single-phase or three-phase power for different voltages?",
          answer: "This page does not publish an input voltage or an output amp."
        },
        {
          question: "How do I know what voltage my forklift battery is?",
          answer: "Check the battery nameplate which clearly shows the voltage, count the battery cells (each cell = 2V), or consult your forklift manual. Common configurations: 12 cells = 24V, 18 cells = 36V, 24 cells = 48V, 40 cells = 80V."
        },
        {
          question: "Which voltage is best for my warehouse operation?",
          answer: "This page does not assign a voltage to a warehouse. The charger voltage has to match the battery."
        }
      ];
    } else if (slug === 'fast-vs-overnight-forklift-charging') {
      return [
        {
          question: "What's the difference between fast charging and overnight charging for forklifts?",
          answer: "This page does not publish a battery-life year count for a charge rate."
        },
        {
          question: "Which charging method is more cost-effective?",
          answer: "The price is on the product page. This page does not publish a setup cost or a five-year total."
        },
        {
          question: "Does fast charging damage forklift batteries?",
          answer: "This page does not publish a battery-life year count for a charge rate."
        },
        {
          question: "Can I use both fast and overnight charging on the same battery?",
          answer: "Yes, many facilities use a hybrid approach - overnight charging for daily routine and fast charging for emergency situations or peak demand periods. This provides operational flexibility while minimizing battery wear from constant fast charging."
        },
        {
          question: "What electrical upgrades do I need for fast charging?",
          answer: "This page does not publish an amperage, an input voltage, or an installation step."
        },
        {
          question: "Which charging method is better for multi-shift operations?",
          answer: "Fast charging or opportunity charging is better for multi-shift operations (16+ hours daily) as it reduces downtime and eliminates the need for battery swapping. The productivity gains from continuous operation often justify the higher costs and shorter battery life."
        }
      ];
    }
    return [];
  };

  const chargerFAQs = getChargerFAQs(params.slug);

  return (
    <div className="min-h-screen bg-white">
      {/* Enhanced Structured Data for Charger Guide */}
      {isChargerGuide && (
        <StructuredData
          title={post.title}
          description={post.description}
          publishDate={post.date}
          faqs={chargerFAQs}
        />
      )}

      {/* Additive FAQPage JSON-LD for high-traffic certification guide */}
      {isCertGuide && certFAQs.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'FAQPage',
              mainEntity: certFAQs.map((faq) => ({
                '@type': 'Question',
                name: faq.question,
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: faq.answer,
                },
              })),
            }),
          }}
        />
      )}

      {/* Additive FAQPage JSON-LD for JCB telehandler joystick guide */}
      {isJcbJoystickGuide && jcbJoystickFAQs.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'FAQPage',
              mainEntity: jcbJoystickFAQs.map((faq) => ({
                '@type': 'Question',
                name: faq.question,
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: faq.answer,
                },
              })),
            }),
          }}
        />
      )}

      <Script id="blogposting-ld-json" type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          "headline": post.title,
          "description": post.description,
          "image": post.image
            ? (post.image.startsWith('http') ? post.image : `https://www.flatearthequipment.com${post.image}`)
            : "https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/public-assets/images/generated/og-default.png",
          "datePublished": post.date,
          "dateModified": post.date,
          "keywords": normalizedKeywords.join(', '),
          "inLanguage": "en-US",
          "isAccessibleForFree": true,
          "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": `https://www.flatearthequipment.com/insights/${params.slug}`
          },
          "author": {
            "@type": "Organization",
            "name": "Flat Earth Equipment",
            "url": "https://www.flatearthequipment.com"
          },
          "publisher": {
            "@type": "Organization",
            "@id": "https://www.flatearthequipment.com/#organization",
            "name": "Flat Earth Equipment",
            "logo": {
              "@type": "ImageObject",
              "url": "https://www.flatearthequipment.com/logo.png",
              "width": 512,
              "height": 512
            }
          }
        })}
      </Script>

      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: 'https://www.flatearthequipment.com' },
          { name: 'Insights', url: 'https://www.flatearthequipment.com/insights' },
          { name: post.title, url: `https://www.flatearthequipment.com/insights/${params.slug}` },
        ]}
      />

      {/* Enhanced Hero Section for Charger Guide */}
      {isChargerGuide ? (
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white">
          <div className="max-w-4xl mx-auto px-4 py-16">
            <div className="flex items-center gap-4 text-sm text-slate-300 mb-4">
              <time dateTime={post.date}>
                {new Date(post.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </time>
              <span>•</span>
              <span>15 min read</span>
              <span>•</span>
              <span>Technical Guide</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              {post.title}
            </h1>
            
            <p className="text-xl text-slate-300 mb-8 max-w-3xl">
              {post.description}
            </p>
            
            {/* Quick Stats - different for each guide */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white/10 backdrop-blur-sm rounded-lg p-6">
              {params.slug === 'complete-guide-forklift-battery-chargers' ? (
                <>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-canyon-rust">24V-80V</div>
                    <div className="text-sm text-slate-300">Voltage Range</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-canyon-rust">Not published</div>
                    <div className="text-sm text-slate-300">Amperage Range</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-canyon-rust">Not every truck</div>
                    <div className="text-sm text-slate-300">Compatibility</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-canyon-rust">On the product page</div>
                    <div className="text-sm text-slate-300">Selection Guide</div>
                  </div>
                </>
              ) : params.slug === 'lithium-forklift-battery-chargers-complete-guide' ? (
                // Lithium guide stats
                <>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-canyon-rust">Product page</div>
                    <div className="text-sm text-slate-300">Price</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-canyon-rust">Not published</div>
                    <div className="text-sm text-slate-300">Charge time</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-canyon-rust">Not published</div>
                    <div className="text-sm text-slate-300">Efficiency</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-canyon-rust">Not every truck</div>
                    <div className="text-sm text-slate-300">Fit</div>
                  </div>
                </>
              ) : params.slug === 'lead-acid-vs-lithium-forklift-chargers' ? (
                // Lead-acid vs Lithium comparison stats
                <>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-canyon-rust">2 Technologies</div>
                    <div className="text-sm text-slate-300">Lead-Acid vs Lithium</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-canyon-rust">28% Savings</div>
                    <div className="text-sm text-slate-300">5-Year TCO</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-canyon-rust">2-3 Years</div>
                    <div className="text-sm text-slate-300">ROI Timeline</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-canyon-rust">TCO Tool</div>
                    <div className="text-sm text-slate-300">Cost Calculator</div>
                  </div>
                </>
              ) : params.slug === 'bms-integration-lithium-forklift-chargers' ? (
                // BMS integration guide stats
                <>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-canyon-rust">CAN Bus</div>
                    <div className="text-sm text-slate-300">Communication</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-canyon-rust">Real-Time</div>
                    <div className="text-sm text-slate-300">Monitoring</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-canyon-rust">Safety First</div>
                    <div className="text-sm text-slate-300">Protection</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-canyon-rust">Technical</div>
                    <div className="text-sm text-slate-300">Deep Dive</div>
                  </div>
                </>
              ) : (
                // Default for other guides
                <>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-canyon-rust">6 Steps</div>
                    <div className="text-sm text-slate-300">Selection Process</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-canyon-rust">4 Voltages</div>
                    <div className="text-sm text-slate-300">24V-80V Options</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-canyon-rust">All Brands</div>
                    <div className="text-sm text-slate-300">Universal Compatibility</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-canyon-rust">Calculator</div>
                    <div className="text-sm text-slate-300">Amperage Tool</div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      ) : (
        // Standard hero for other posts
        <div className="max-w-4xl mx-auto px-4 pt-16">
          <Link
            href="/insights"
            className="inline-flex items-center text-canyon-rust hover:text-canyon-rust/80 mb-8"
          >
            ← Back to Insights
          </Link>
        </div>
      )}

      <main className="max-w-4xl mx-auto px-4 py-12">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm text-slate-600 mb-8">
          <a href="/" className="hover:text-canyon-rust transition-colors">Home</a>
          <span>/</span>
          <a href="/insights" className="hover:text-canyon-rust transition-colors">Insights</a>
          <span>/</span>
          <span className="text-slate-900 truncate">{post.title}</span>
        </nav>

        {/* Table of Contents for Charger Guide */}
        {isChargerGuide && (
          <div className="lg:float-right lg:w-80 lg:ml-8 lg:mb-8">
            <TableOfContents />
          </div>
        )}

        {/* Quick Summary for Charger Guide */}
        {isChargerGuide && (
          <div className="bg-gradient-to-r from-canyon-rust/5 to-canyon-rust/10 border border-canyon-rust/20 rounded-xl p-6 mb-12">
            <h2 className="text-lg font-semibold text-slate-900 mb-3">📋 Quick Summary</h2>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              {params.slug === 'complete-guide-forklift-battery-chargers' ? (
                <>
                  <div>
                    <div className="font-medium text-slate-900">What You'll Learn</div>
                    <div className="text-slate-600">Voltage selection, amperage calculation, installation requirements</div>
                  </div>
                  <div>
                    <div className="font-medium text-slate-900">Who This Is For</div>
                    <div className="text-slate-600">Fleet managers, facility operators, maintenance teams</div>
                  </div>
                  <div>
                    <div className="font-medium text-slate-900">Time Investment</div>
                    <div className="text-slate-600">15 minutes reading, lifetime of proper charging</div>
                  </div>
                </>
              ) : params.slug === 'lithium-forklift-battery-chargers-complete-guide' ? (
                // Lithium guide summary
                <>
                  <div>
                    <div className="font-medium text-slate-900">Advanced Technology</div>
                    <div className="text-slate-600">BMS integration, smart charging profiles, efficiency gains</div>
                  </div>
                  <div>
                    <div className="font-medium text-slate-900">Fast Charging</div>
                    <div className="text-slate-600">This page does not publish a charge time.</div>
                  </div>
                  <div>
                    <div className="font-medium text-slate-900">ROI Benefits</div>
                    <div className="text-slate-600">The price is on the product page</div>
                  </div>
                </>
              ) : (
                // Default for other guides
                <>
                  <div>
                    <div className="font-medium text-slate-900">Voltage</div>
                    <div className="text-slate-600">The charger voltage has to match the battery.</div>
                  </div>
                  <div>
                    <div className="font-medium text-slate-900">Amperage</div>
                    <div className="text-slate-600">This page does not publish a required amperage.</div>
                  </div>
                  <div>
                    <div className="font-medium text-slate-900">Price</div>
                    <div className="text-slate-600">The price is on the product page.</div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Standard title for non-charger guides */}
        {!isChargerGuide && (
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-slate-900 mb-4">{post.title}</h1>
            <div className="text-slate-600 mb-8">
              {new Date(post.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>
          </div>
        )}

        {/* Enhanced Article Content */}
        <article className="prose prose-slate max-w-none prose-headings:font-bold prose-h1:text-4xl prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-6 prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-4 prose-p:text-slate-700 prose-li:text-slate-700 prose-strong:text-slate-900 prose-a:text-canyon-rust prose-a:no-underline hover:prose-a:underline">
          {post.content && typeof post.content === 'object' && 'isRawHTML' in post.content ? (
            <div dangerouslySetInnerHTML={{ __html: post.content.__html }} />
          ) : (
            post.content
          )}
        </article>

        {/* Call to Action for Charger Guide */}
        {isChargerGuide && (
          <div className="mt-12 mb-4 rounded-xl border border-slate-200 bg-slate-50 p-8">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-slate-900 mb-3">
                Ready to match a charger to your fleet?
              </h3>
              <p className="text-slate-600 mb-6 max-w-2xl mx-auto">
                Browse stocked 24V–80V chargers by voltage, or request a quote with your battery and facility power details.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/battery-chargers#chargers"
                  className="bg-canyon-rust text-white px-6 py-3 rounded-lg font-semibold hover:bg-canyon-rust/90 transition-colors"
                >
                  Shop chargers
                </a>
                
                <a
                  href="/quote?equipment=Forklift%20battery%20charger&notes=Need%20help%20matching%20voltage%2C%20amps%2C%20and%20facility%20power"
                  className="border border-slate-300 bg-white text-slate-800 px-6 py-3 rounded-lg font-semibold hover:border-canyon-rust/40 hover:text-canyon-rust transition-colors"
                >
                  Request a quote
                </a>

                <a
                  href="/contact"
                  className="text-slate-600 px-6 py-3 rounded-lg font-medium hover:text-canyon-rust transition-colors"
                >
                  Ask a tech question
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Related Items */}
        {relatedItems.length > 0 && (
          <div className="mt-16 pt-8 border-t border-slate-200">
            <RelatedItems items={relatedItems} />
          </div>
        )}

        {/* Enhanced Related Resources for Charger Guide */}
        {isChargerGuide && (
          <div className="mt-16 pt-8 border-t border-slate-200">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Related Resources</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  title: "Forklift Battery Chargers",
                  description: "Shop stocked 24V–80V chargers or request a quote",
                  href: "/battery-chargers#chargers",
                  type: "Shop"
                },
                {
                  title: "24V vs 36V vs 48V Comparison",
                  description: "Detailed voltage comparison guide",
                  href: "/insights/forklift-charger-voltage-comparison",
                  type: "Guide"
                },
                {
                  title: "Fast vs Overnight Charging",
                  description: "Complete charging strategy comparison",
                  href: "/insights/fast-vs-overnight-forklift-charging",
                  type: "Guide"
                }
              ].map((resource, index) => (
                <a
                  key={index}
                  href={resource.href}
                  className="group block bg-white border border-slate-200 rounded-lg p-4 hover:shadow-md hover:border-canyon-rust/30 transition-all"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-medium text-canyon-rust bg-canyon-rust/10 px-2 py-1 rounded">
                      {resource.type}
                    </span>
                  </div>
                  <h3 className="font-semibold text-slate-900 group-hover:text-canyon-rust transition-colors mb-2">
                    {resource.title}
                  </h3>
                  <p className="text-sm text-slate-600">{resource.description}</p>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Certification CTA — soft-sell after education */}
        {isCertGuide && (
          <div className="mt-12 rounded-xl border border-slate-200 bg-slate-950 p-8 text-center text-white">
            <h3 className="text-xl font-semibold mb-3">
              Try before you certify
            </h3>
            <p className="text-slate-300 mb-6 max-w-2xl mx-auto">
              Study all five modules free in the Forklift Certified app, then pay $49 only at the final exam —
              or get the same OSHA-aligned formal instruction on the web for $49. Your employer still completes
              the required on-site evaluation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/safety"
                className="bg-[#F76511] text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors"
              >
                Get certified — $49
              </a>
              <a
                href="/safety"
                className="border border-slate-600 text-white px-6 py-3 rounded-lg font-semibold hover:border-[#F76511] transition-colors"
              >
                See app + web options
              </a>
            </div>
          </div>
        )}

        {/* Expert Support CTA — charger guides only (not certification posts) */}
        {isChargerGuide && (
          <div className="mt-12 bg-slate-50 border border-slate-200 rounded-xl p-8 text-center">
            <h3 className="text-xl font-semibold text-slate-900 mb-3">
              Charger catalog
            </h3>
            <p className="text-slate-600 mb-6 max-w-2xl mx-auto">
              This page does not offer a consultation, installation planning, or a repair visit.
              The price is on the product page. A listing is not a fit for every truck.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/battery-chargers"
                className="bg-canyon-rust text-white px-6 py-3 rounded-lg font-semibold hover:bg-canyon-rust/90 transition-colors"
              >
                Browse chargers
              </a>
              <a
                href="tel:+1-888-392-9175"
                className="border-2 border-canyon-rust text-canyon-rust px-6 py-3 rounded-lg font-semibold hover:bg-canyon-rust hover:text-white transition-colors"
              >
                Call (888) 392-9175
              </a>
            </div>
          </div>
        )}
      </main>
    </div>
  );
} 