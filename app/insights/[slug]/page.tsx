import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getBlogPost } from '@/lib/mdx';
import Script from 'next/script';
import RelatedItems from '@/components/RelatedItems';
import { TableOfContents, AmperageCalculator, QuickReferenceCard } from '@/components/BasicInteractiveComponents';
import { StructuredData } from '@/components/SEOComponents';

type Props = {
  params: {
    slug: string;
  };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getBlogPost(params.slug);

  if (!post) {
    return {
      title: 'Post Not Found | Flat Earth Equipment',
      description: 'The requested post could not be found.',
    };
  }

  return {
    title: `${post.title} | Flat Earth Equipment`,
    description: post.description?.slice(0, 160) || 'Industry insights and equipment maintenance tips.',
    keywords: post.keywords,
    alternates: {
      canonical: `/insights/${params.slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      publishedTime: post.date,
      images: [post.image],
    },
  };
}

export default async function BlogPost({ params }: Props) {
  const post = await getBlogPost(params.slug);

  if (!post) {
    notFound();
  }

  // Get related posts based on keywords
  const relatedItems = post.keywords?.map(keyword => ({
    name: keyword,
    href: `/insights?keyword=${encodeURIComponent(keyword)}`
  })) || [];

  // Check if this is a forklift charger guide for special treatment
  const isChargerGuide = params.slug === 'complete-guide-forklift-battery-chargers' || 
                         params.slug === 'how-to-choose-forklift-battery-charger' ||
                         params.slug === 'forklift-charger-voltage-comparison' ||
                         params.slug === 'fast-vs-overnight-forklift-charging' ||
                         params.slug === 'lithium-forklift-battery-chargers-complete-guide' ||
                         params.slug === 'lead-acid-vs-lithium-forklift-chargers' ||
                         params.slug === 'bms-integration-lithium-forklift-chargers';

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
          answer: "Use this formula: Required Amps = (Battery Ah ÷ Desired Charge Hours) ÷ 0.85. For example, a 750Ah battery charged in 8 hours needs: (750 ÷ 8) ÷ 0.85 = 110A charger. For overnight charging, use C/10 rate (10% of battery capacity). For fast charging, use C/5 to C/3 rates."
        },
        {
          question: "Can I use a higher amperage charger to charge faster?",
          answer: "Yes, but with trade-offs. Higher amperage reduces charging time but also reduces battery life. C/10 rate (overnight) gives 5-7 years battery life, while C/3 rate (fast charging) gives 2-4 years. Also ensure your electrical system can handle the higher current draw."
        },
        {
          question: "What's the difference between single-phase and three-phase chargers?",
          answer: "Single-phase chargers use standard 208V-240V power, suitable for smaller chargers (under 100A output). Three-phase chargers use 480V-600V industrial power, offering 5-10% better efficiency and supporting higher amperages (200A+). Choose based on your facility's electrical infrastructure."
        },
        {
          question: "Do I need special ventilation for forklift battery charging?",
          answer: "Yes, lead-acid batteries produce hydrogen gas during charging, which is explosive at 4% concentration. Install exhaust fans providing 6-12 air changes per hour. Calculate CFM needed: (Number of batteries × Ah capacity × 0.05) ÷ 0.25. Lithium batteries don't require special ventilation."
        },
        {
          question: "Can I use aftermarket chargers with my Crown/Toyota/Yale forklift?",
          answer: "Yes, most forklift brands use standard Anderson SB connectors and charging profiles. Aftermarket chargers are fully compatible and often cost 30-50% less than OEM chargers. Ensure voltage matches exactly and amperage is appropriate for your battery capacity."
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
          answer: "Too low amperage results in incomplete charging and reduced battery life. Too high amperage can overheat the battery and reduce its lifespan. For optimal battery life, use C/10 rate (10% of battery capacity) for overnight charging, or C/5 rate for faster charging."
        },
        {
          question: "Can I use any charger brand with my forklift?",
          answer: "Yes, most forklift brands use standard Anderson SB connectors and charging profiles. Aftermarket chargers are fully compatible with Crown, Toyota, Yale, Hyster, and other major brands. Just ensure voltage and amperage match your requirements."
        },
        {
          question: "Do I need single-phase or three-phase power?",
          answer: "Single-phase (208V-240V) works for smaller chargers under 100A output. Three-phase (480V-600V) is required for higher amperage chargers and provides 5-10% better efficiency. Choose based on your facility's available electrical infrastructure."
        },
        {
          question: "How much should I expect to spend on a forklift charger?",
          answer: "Prices range from $800-1,500 for 24V chargers, $1,000-2,000 for 36V, $1,200-3,500 for 48V, and $2,500-5,000+ for 80V chargers. Higher amperage and advanced features increase cost, but quality chargers pay for themselves through extended battery life."
        },
        {
          question: "What's the difference between overnight and fast charging?",
          answer: "Overnight charging (8-12 hours) uses lower amperage, extends battery life to 5-7 years, and requires standard electrical infrastructure. Fast charging (4-6 hours) uses higher amperage, reduces battery life to 3-5 years, but enables multi-shift operations with better productivity."
        }
      ];
    } else if (slug === 'lithium-forklift-battery-chargers-complete-guide') {
      return [
        {
          question: "What makes lithium forklift chargers different from lead-acid chargers?",
          answer: "Lithium chargers must communicate with the battery's BMS (Battery Management System) for cell balancing, temperature monitoring, and safety protection. They charge much faster (1-3 hours vs 8-12 hours), are more efficient (95-98% vs 80-85%), and don't require ventilation since lithium batteries don't produce hydrogen gas."
        },
        {
          question: "Do I need a special charger for lithium forklift batteries?",
          answer: "Yes, lithium batteries require chargers with BMS communication capability and lithium-specific charging profiles. Standard lead-acid chargers cannot properly charge lithium batteries and may damage them or create safety hazards."
        },
        {
          question: "How fast can lithium forklift batteries charge?",
          answer: "Lithium forklift batteries can charge in 1-3 hours depending on the charger amperage. Standard charging (2-4 hours) uses Battery Ah ÷ 3 amperage. Fast charging (1-2 hours) uses Battery Ah ÷ 2 amperage. Opportunity charging can add significant capacity in just 15-30 minutes."
        },
        {
          question: "Are lithium forklift chargers more expensive?",
          answer: "Yes, lithium chargers typically cost 25-50% more than lead-acid chargers ($3,000-$15,000 depending on features). However, they provide 20-40% lower total cost of ownership over 5 years through energy savings, reduced maintenance, and longer battery life."
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
          answer: "Lead-acid chargers use simple voltage control and take 8-12 hours to charge, while lithium chargers use advanced BMS communication and charge in 1-3 hours. Lithium chargers are 95-98% efficient vs 80-85% for lead-acid, but cost 25-50% more initially."
        },
        {
          question: "Which is more cost-effective: lead-acid or lithium forklift chargers?",
          answer: "Lithium chargers have higher initial costs ($3,000-$8,000 vs $1,500-$4,000) but provide 20-40% lower total cost of ownership over 5 years through energy savings, reduced maintenance, and longer battery life. ROI typically occurs in 2-3 years."
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
          answer: "Lithium chargers are actually safer in many ways - no hydrogen gas emission, no acid spills, and no heavy battery handling. They do require thermal runaway prevention and Class D fire suppression, but eliminate the ventilation requirements of lead-acid charging."
        },
        {
          question: "How long do lead-acid vs lithium forklift chargers last?",
          answer: "Lead-acid chargers typically last 3-5 years and require weekly maintenance. Lithium chargers last 7-10 years with minimal monthly maintenance. The longer lifespan and reduced maintenance contribute significantly to lithium's lower total cost of ownership."
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
          answer: "Most lithium forklift chargers use CAN bus communication (125 kbps to 1 Mbps) with twisted pair cables and 120Ω termination. Alternative protocols include RS485/Modbus for industrial applications and proprietary protocols for manufacturer-specific optimizations."
        },
        {
          question: "Can any lithium charger work with any lithium forklift battery?",
          answer: "No, the charger and BMS must use compatible communication protocols and data formats. While voltage must match exactly, compatibility also requires matching CAN bus message IDs, data structures, and timing requirements. Always verify compatibility before purchasing."
        },
        {
          question: "How do I troubleshoot BMS communication errors?",
          answer: "Start by checking physical connections and cable integrity, then verify termination resistors (120Ω at each CAN bus end). Check protocol settings like baud rate and message IDs. If issues persist, update firmware for both charger and BMS, and consult manufacturer documentation for specific fault codes."
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

      <Script id="blogposting-ld-json" type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          "headline": post.title,
          "description": post.description,
          "image": post.image,
          "datePublished": post.date,
          "keywords": post.keywords?.join(', ') || '',
          "author": {
            "@type": "Organization",
            "name": "Flat Earth Equipment"
          },
          "publisher": {
            "@type": "Organization",
            "name": "Flat Earth Equipment",
            "logo": {
              "@type": "ImageObject",
              "url": "https://flatearthequipment.com/logo.png"
            }
          }
        })}
      </Script>

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
                    <div className="text-2xl font-bold text-canyon-rust">15A-200A+</div>
                    <div className="text-sm text-slate-300">Amperage Range</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-canyon-rust">5+ Brands</div>
                    <div className="text-sm text-slate-300">Compatibility</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-canyon-rust">12 Steps</div>
                    <div className="text-sm text-slate-300">Selection Guide</div>
                  </div>
                </>
              ) : params.slug === 'lithium-forklift-battery-chargers-complete-guide' ? (
                // Lithium guide stats
                <>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-canyon-rust">1-3 Hours</div>
                    <div className="text-sm text-slate-300">Fast Charging</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-canyon-rust">95-98%</div>
                    <div className="text-sm text-slate-300">Efficiency</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-canyon-rust">3,000+</div>
                    <div className="text-sm text-slate-300">Charge Cycles</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-canyon-rust">No Venting</div>
                    <div className="text-sm text-slate-300">Required</div>
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
                    <div className="text-slate-600">1-3 hour charging, opportunity charging optimized</div>
                  </div>
                  <div>
                    <div className="font-medium text-slate-900">ROI Benefits</div>
                    <div className="text-slate-600">20-40% lower TCO, reduced maintenance</div>
                  </div>
                </>
              ) : (
                // Default for other guides
                <>
                  <div>
                    <div className="font-medium text-slate-900">Step-by-Step Process</div>
                    <div className="text-slate-600">6 clear steps to find your perfect charger</div>
                  </div>
                  <div>
                    <div className="font-medium text-slate-900">Interactive Tools</div>
                    <div className="text-slate-600">Amperage calculator and quick reference cards</div>
                  </div>
                  <div>
                    <div className="font-medium text-slate-900">Expert Support</div>
                    <div className="text-slate-600">Free consultation available for complex needs</div>
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
          {post.content}
        </article>

        {/* Call to Action for Charger Guide */}
        {isChargerGuide && (
          <div className="bg-gradient-to-r from-canyon-rust to-canyon-rust/90 text-white rounded-xl p-8 my-12">
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-3">Need Help Selecting the Right Charger?</h3>
              <p className="text-canyon-rust-100 mb-6 max-w-2xl mx-auto">
                Our technical experts provide free consultation to help you choose the perfect charger for your specific requirements.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/contact"
                  className="bg-white text-canyon-rust px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                >
                  Get Expert Consultation
                </a>
                
                <a
                  href="/battery-chargers"
                  className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-canyon-rust transition-colors"
                >
                  Browse Chargers
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
                  title: "Forklift Charger Selector Tool",
                  description: "Find your perfect charger in 3 easy steps",
                  href: "/battery-chargers",
                  type: "Tool"
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

        {/* Expert Support CTA */}
        <div className="mt-12 bg-slate-50 border border-slate-200 rounded-xl p-8 text-center">
          <h3 className="text-xl font-semibold text-slate-900 mb-3">
            🔧 Expert Technical Support
          </h3>
          <p className="text-slate-600 mb-6 max-w-2xl mx-auto">
            Our technical team provides free consultation for charger selection, installation planning, 
            and fleet optimization. Get personalized recommendations based on your specific requirements.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/contact"
              className="bg-canyon-rust text-white px-6 py-3 rounded-lg font-semibold hover:bg-canyon-rust/90 transition-colors"
            >
              Contact Technical Team
            </a>
            <a
              href="tel:+1-307-555-0123"
              className="border-2 border-canyon-rust text-canyon-rust px-6 py-3 rounded-lg font-semibold hover:bg-canyon-rust hover:text-white transition-colors"
            >
              Call (307) 555-0123
            </a>
          </div>
        </div>
      </main>
    </div>
  );
} 