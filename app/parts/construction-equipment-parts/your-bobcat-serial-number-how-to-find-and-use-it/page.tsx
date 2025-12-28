import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import { generatePageAlternates } from "@/app/seo-defaults";

export const metadata: Metadata = {
  title: "Bobcat Serial Number Lookup: Find Year by Serial + Model Year Table | Flat Earth Equipment",
  description: "Complete Bobcat serial number lookup guide with model year table (1999-2024). Find your Bobcat's year, decode serial numbers, and locate identification plates. Rentals available in WY, MT, CO, AZ, NM, TX.",
  keywords: ["bobcat serial number lookup", "bobcat serial number year", "what year is my bobcat", "bobcat model year chart", "bobcat serial number decoder", "bobcat skid steer serial number"],
  alternates: generatePageAlternates("/parts/construction-equipment-parts/your-bobcat-serial-number-how-to-find-and-use-it"),
  openGraph: {
    title: "Bobcat Serial Number Lookup: Complete Model Year Table & Decoder",
    description: "Decode your Bobcat serial number instantly. Complete model year table from 1999-2024 with serial number ranges for skid steers, track loaders, and excavators.",
    type: "article",
  },
};

export default function BobcatSerialNumberGuide() {
  return (
    <>
      {/* FAQ Schema for Rich Snippets */}
      <Script id="faq-schema" type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "Where is the serial number on a Bobcat skid steer?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "On R-Series loaders (2020+), check the right side rear above the tailgate. M-Series (2010+) have it on the right side of the main frame below the cooling compartment. K-Series (2007-2014) have it on the rear frame upright. Older models vary - check inside or outside the rear upright."
              }
            },
            {
              "@type": "Question",
              "name": "How do I find what year my Bobcat is?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "The model year is printed directly on the product identification plate. Alternatively, use the serial number to contact Bobcat customer service at 1-800-743-4340, or use a serial number decoder tool. The 9-digit serial number's first 4 digits identify the model/engine combination."
              }
            },
            {
              "@type": "Question",
              "name": "What do Bobcat serial numbers mean?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Bobcat serial numbers are 9 digits split into two parts: the first 4 digits identify the model number and engine combination, while the last 5 digits are the production sequence number indicating order of manufacture."
              }
            }
          ]
        })}
      </Script>

      {/* HowTo Schema */}
      <Script id="howto-schema" type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "HowTo",
          "name": "How to Find Your Bobcat Serial Number",
          "description": "Step-by-step guide to locating and decoding your Bobcat equipment serial number",
          "totalTime": "PT5M",
          "step": [
            {
              "@type": "HowToStep",
              "name": "Locate the serial number plate",
              "text": "Find the product identification plate on your Bobcat. Location varies by series: R-Series is on the right rear, M-Series is below the cooling compartment, K-Series is on the rear frame upright.",
              "position": 1
            },
            {
              "@type": "HowToStep",
              "name": "Read the 9-digit serial number",
              "text": "The serial number is 9 digits: first 4 digits = model/engine code, last 5 digits = production sequence.",
              "position": 2
            },
            {
              "@type": "HowToStep",
              "name": "Note the model year",
              "text": "The model year is printed directly on the identification plate alongside the serial number.",
              "position": 3
            }
          ]
        })}
      </Script>

    <main className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-slate-900 mb-6">
        Bobcat Serial Number Lookup: Find Year by Serial Number
      </h1>

      {/* Quick Answer Box for Featured Snippet */}
      <div className="not-prose mb-8 bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-300 rounded-xl p-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
          <span className="text-2xl">💡</span> Quick Answer: Bobcat Serial Number Location
        </h2>
        <p className="text-slate-700 mb-4">
          <strong>Bobcat serial numbers are 9 digits</strong> split into two parts: the first 4 digits identify the model/engine combination, and the last 5 are the production sequence. The <strong>model year is printed directly on the identification plate</strong>.
        </p>
        <p className="text-slate-700">
          <strong>Where to find it:</strong> R-Series (2020+) → right side rear above tailgate. M-Series (2010+) → right side of main frame. K-Series (2007-2014) → rear frame upright. For exact parts fit, always use the serial number—not just the model year.
        </p>
      </div>

      {/* Regional Availability Banner */}
      <div className="bg-blue-50 border-l-4 border-blue-600 p-4 mb-8 rounded-r-lg">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🚜</span>
          <div>
            <p className="font-semibold text-blue-900">Bobcat Rentals & Parts Available in Your Region</p>
            <p className="text-sm text-blue-800">We serve <strong>Wyoming, Montana, Colorado, Arizona, New Mexico, and Texas</strong> with Bobcat equipment rentals, parts, and service support.</p>
          </div>
        </div>
      </div>

      {/* Interactive Tool Callout */}
      <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-lg p-6 mb-8">
        <div className="flex items-start gap-4">
          <div className="bg-red-600 p-2 rounded-lg flex-shrink-0">
            🛠️
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">🚀 Try Our Interactive Bobcat Decoder</h3>
            <p className="text-slate-700 mb-4">
              Get instant decoding with our new interactive tool - just enter your serial number 
              for immediate module code identification, production sequence, and plate location tips!
            </p>
            <Link 
              href="/bobcat-serial-number-lookup"
              className="inline-flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition font-semibold"
            >
              🔍 Try Interactive Bobcat Lookup Tool
            </Link>
          </div>
        </div>
      </div>

      <div className="prose prose-slate max-w-none">
        <p className="lead">
          Bobcat machines print the <strong>model year on the product identification plate</strong>. The serial itself typically follows a
          <strong> 9-digit (4+5)</strong> structure: the first 4 digits identify the module (model/engine combination) and the last 5 digits are the
          production sequence. For parts accuracy, use your <strong>serial number</strong>—not just model year.
        </p>

        <p>
          Whether you're hunting for maintenance records or ordering new parts, knowing your Bobcat's serial number can save you a lot of time and hassle. You can find it in several places, like the machine itself or even in the user manual, and understanding what it actually means can unlock a treasure trove of information about your equipment. Plus, if you ever need to contact your dealer, having that number handy can make everything run smoother.
        </p>

        <h2>Where to Find Your Bobcat's Serial Number</h2>
        
        <div className="my-8">
          <Image
            src="/images/insights/bobcat-serial-number-location-diagram-1747329466424.webp"
            alt="Diagram showing the location of the serial number on various Bobcat models"
            width={800}
            height={600}
            className="rounded-lg shadow-lg"
          />
        </div>

        <p>
          If you're knee-deep in dirt working with your Bobcat and suddenly have to deal with mechanical failures or service schedules, you might need to pinpoint your serial number quick-smart. It's like the ID card for your rugged piece of heavy equipment: totally unique and super important for figuring out the exact model, original engine, and correct configuration of your Bobcat.
        </p>

        <h3>On the Machine</h3>
        <p>
          For most Bobcat heavy hitters, like excavators and larger machines, you want to check around the product identification plate. This is often located near the boom swing or under the left lift arm, although it can vary depending on the model. And, if you're pals with a Bobcat mini-X, peek under the left support arm. Just look for a sturdy plate that's playing home to a string of numbers — that's your machine's serial number plate.
        </p>

        <div className="my-8">
          <Image
            src="/images/insights/bobcat-serial-number-location-1747329466424.webp"
            alt="Location of the serial number on a Bobcat loader"
            width={800}
            height={600}
            className="rounded-lg shadow-lg"
          />
        </div>

        <h3>In the User Manual</h3>
        <p>
          The user manual is packed with nuggets of info, including your machine's serial number. Flip to the reference section upfront, and voila, there's your number along with other juicy details about your Bobcat. Now, if you were on top of things when you first bagged your Bobcat, the dealer might've filled out this section for you.
        </p>

        <h3>Through the Dealer</h3>
        <p>
          Maybe you bought second-hand, or your equipment has been around the block, and the serial number on the machine has played a disappearing act. Fret not. Your Bobcat dealer is the detective you need. These folks are like walking encyclopedias for all things Bobcat. They keep a record of serial numbers, which means a quick call or email could sort you out.
        </p>

        <h2>Understanding the Serial Number Plate</h2>
        <p>
          This nine-digit powerhouse is split into two bits. The first four digits are all about the model number and the engine mash-up, revealing exactly what you're working with. Then, there's the five-digit Production Sequence Number, and this puppy gives you the dirt on where your machine fell in the assembly line dance.
        </p>

        <div className="my-8">
          <Image
            src="/images/insights/bobcat-serial-number-plate-1747329466425.webp"
            alt="Close-up of a Bobcat serial number plate"
            width={800}
            height={600}
            className="rounded-lg shadow-lg"
          />
        </div>

        <h2>Serial Number Location Chart by Series</h2>
        <div className="overflow-x-auto mb-8">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-slate-100">
                <th className="border p-2">Series</th>
                <th className="border p-2">Years</th>
                <th className="border p-2">Location</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border p-2 font-semibold">R-Series Loaders</td>
                <td className="border p-2">2020-Present</td>
                <td className="border p-2">Right side rear, above upper-right tailgate corner</td>
              </tr>
              <tr>
                <td className="border p-2 font-semibold">M-Series Loaders</td>
                <td className="border p-2">2010-2020</td>
                <td className="border p-2">Right side of main frame, below cooling compartment</td>
              </tr>
              <tr>
                <td className="border p-2 font-semibold">K-Series Loaders</td>
                <td className="border p-2">2007-2014</td>
                <td className="border p-2">Rear frame upright (right or left side)</td>
              </tr>
              <tr>
                <td className="border p-2 font-semibold">Older Loaders (40-80 Series)</td>
                <td className="border p-2">Pre-2007</td>
                <td className="border p-2">Inside or outside rear upright (varies)</td>
              </tr>
              <tr>
                <td className="border p-2 font-semibold">R-Series Excavators</td>
                <td className="border p-2">2017-Present</td>
                <td className="border p-2">Front of cab, beside the boom</td>
              </tr>
              <tr>
                <td className="border p-2 font-semibold">M-Series Excavators</td>
                <td className="border p-2">2010-2017</td>
                <td className="border p-2">Front of cab near door, beside boom</td>
              </tr>
              <tr>
                <td className="border p-2 font-semibold">Small Articulated Loaders</td>
                <td className="border p-2">All Years</td>
                <td className="border p-2">Lower frame on the entry side</td>
              </tr>
              <tr>
                <td className="border p-2 font-semibold">Mini Track Loaders</td>
                <td className="border p-2">All Years</td>
                <td className="border p-2">Left side main frame, near lift arm top</td>
              </tr>
              <tr>
                <td className="border p-2 font-semibold">Compact Wheel Loaders</td>
                <td className="border p-2">All Years</td>
                <td className="border p-2">Left side, underneath lift arm</td>
              </tr>
              <tr>
                <td className="border p-2 font-semibold">Telehandlers</td>
                <td className="border p-2">All Years</td>
                <td className="border p-2">Machine frame near right front tire</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2 id="model-year-table">Bobcat Model Year Table by Serial Number Range</h2>
        <p>
          Use this comprehensive table to identify your Bobcat's approximate model year based on serial number ranges. This data covers popular skid steer and compact track loader models from 1999-2024.
        </p>
        
        {/* Skid Steer Model Year Table */}
        <h3>Skid Steer Loaders (S-Series) Model Year Chart</h3>
        <div className="overflow-x-auto mb-8">
          <table className="min-w-full border-collapse text-sm">
            <thead>
              <tr className="bg-red-100">
                <th className="border p-2">Model</th>
                <th className="border p-2">2019</th>
                <th className="border p-2">2020</th>
                <th className="border p-2">2021</th>
                <th className="border p-2">2022</th>
                <th className="border p-2">2023</th>
                <th className="border p-2">2024</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border p-2 font-semibold">S450</td>
                <td className="border p-2">B3BT11001+</td>
                <td className="border p-2">B3BT14001+</td>
                <td className="border p-2">B3BT17001+</td>
                <td className="border p-2">B3BT20001+</td>
                <td className="border p-2">B3BT23001+</td>
                <td className="border p-2">B3BT26001+</td>
              </tr>
              <tr>
                <td className="border p-2 font-semibold">S510</td>
                <td className="border p-2">A3NJ11001+</td>
                <td className="border p-2">A3NJ14001+</td>
                <td className="border p-2">A3NJ17001+</td>
                <td className="border p-2">A3NJ20001+</td>
                <td className="border p-2">A3NJ23001+</td>
                <td className="border p-2">A3NJ26001+</td>
              </tr>
              <tr>
                <td className="border p-2 font-semibold">S530</td>
                <td className="border p-2">A3NL11001+</td>
                <td className="border p-2">A3NL14001+</td>
                <td className="border p-2">A3NL17001+</td>
                <td className="border p-2">A3NL20001+</td>
                <td className="border p-2">A3NL23001+</td>
                <td className="border p-2">A3NL26001+</td>
              </tr>
              <tr>
                <td className="border p-2 font-semibold">S550</td>
                <td className="border p-2">A3NK11001+</td>
                <td className="border p-2">A3NK14001+</td>
                <td className="border p-2">A3NK17001+</td>
                <td className="border p-2">A3NK20001+</td>
                <td className="border p-2">A3NK23001+</td>
                <td className="border p-2">A3NK26001+</td>
              </tr>
              <tr>
                <td className="border p-2 font-semibold">S570</td>
                <td className="border p-2">A3NT11001+</td>
                <td className="border p-2">A3NT14001+</td>
                <td className="border p-2">A3NT17001+</td>
                <td className="border p-2">A3NT20001+</td>
                <td className="border p-2">A3NT23001+</td>
                <td className="border p-2">A3NT26001+</td>
              </tr>
              <tr>
                <td className="border p-2 font-semibold">S590</td>
                <td className="border p-2">A3NU11001+</td>
                <td className="border p-2">A3NU14001+</td>
                <td className="border p-2">A3NU17001+</td>
                <td className="border p-2">A3NU20001+</td>
                <td className="border p-2">A3NU23001+</td>
                <td className="border p-2">A3NU26001+</td>
              </tr>
              <tr>
                <td className="border p-2 font-semibold">S630</td>
                <td className="border p-2">A3NV11001+</td>
                <td className="border p-2">A3NV14001+</td>
                <td className="border p-2">A3NV17001+</td>
                <td className="border p-2">A3NV20001+</td>
                <td className="border p-2">A3NV23001+</td>
                <td className="border p-2">A3NV26001+</td>
              </tr>
              <tr>
                <td className="border p-2 font-semibold">S650</td>
                <td className="border p-2">A3NW11001+</td>
                <td className="border p-2">A3NW14001+</td>
                <td className="border p-2">A3NW17001+</td>
                <td className="border p-2">A3NW20001+</td>
                <td className="border p-2">A3NW23001+</td>
                <td className="border p-2">A3NW26001+</td>
              </tr>
              <tr>
                <td className="border p-2 font-semibold">S740</td>
                <td className="border p-2">B3CA11001+</td>
                <td className="border p-2">B3CA14001+</td>
                <td className="border p-2">B3CA17001+</td>
                <td className="border p-2">B3CA20001+</td>
                <td className="border p-2">B3CA23001+</td>
                <td className="border p-2">B3CA26001+</td>
              </tr>
              <tr>
                <td className="border p-2 font-semibold">S770</td>
                <td className="border p-2">A3P411001+</td>
                <td className="border p-2">A3P414001+</td>
                <td className="border p-2">A3P417001+</td>
                <td className="border p-2">A3P420001+</td>
                <td className="border p-2">A3P423001+</td>
                <td className="border p-2">A3P426001+</td>
              </tr>
              <tr>
                <td className="border p-2 font-semibold">S850</td>
                <td className="border p-2">A3P611001+</td>
                <td className="border p-2">A3P614001+</td>
                <td className="border p-2">A3P617001+</td>
                <td className="border p-2">A3P620001+</td>
                <td className="border p-2">A3P623001+</td>
                <td className="border p-2">A3P626001+</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Compact Track Loader Model Year Table */}
        <h3>Compact Track Loaders (T-Series) Model Year Chart</h3>
        <div className="overflow-x-auto mb-8">
          <table className="min-w-full border-collapse text-sm">
            <thead>
              <tr className="bg-orange-100">
                <th className="border p-2">Model</th>
                <th className="border p-2">2019</th>
                <th className="border p-2">2020</th>
                <th className="border p-2">2021</th>
                <th className="border p-2">2022</th>
                <th className="border p-2">2023</th>
                <th className="border p-2">2024</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border p-2 font-semibold">T450</td>
                <td className="border p-2">B3BU11001+</td>
                <td className="border p-2">B3BU14001+</td>
                <td className="border p-2">B3BU17001+</td>
                <td className="border p-2">B3BU20001+</td>
                <td className="border p-2">B3BU23001+</td>
                <td className="border p-2">B3BU26001+</td>
              </tr>
              <tr>
                <td className="border p-2 font-semibold">T550</td>
                <td className="border p-2">A3NK11001+</td>
                <td className="border p-2">A3NK14001+</td>
                <td className="border p-2">A3NK17001+</td>
                <td className="border p-2">A3NK20001+</td>
                <td className="border p-2">A3NK23001+</td>
                <td className="border p-2">A3NK26001+</td>
              </tr>
              <tr>
                <td className="border p-2 font-semibold">T590</td>
                <td className="border p-2">A3NU11001+</td>
                <td className="border p-2">A3NU14001+</td>
                <td className="border p-2">A3NU17001+</td>
                <td className="border p-2">A3NU20001+</td>
                <td className="border p-2">A3NU23001+</td>
                <td className="border p-2">A3NU26001+</td>
              </tr>
              <tr>
                <td className="border p-2 font-semibold">T595</td>
                <td className="border p-2">B3Y911001+</td>
                <td className="border p-2">B3Y914001+</td>
                <td className="border p-2">B3Y917001+</td>
                <td className="border p-2">B3Y920001+</td>
                <td className="border p-2">B3Y923001+</td>
                <td className="border p-2">B3Y926001+</td>
              </tr>
              <tr>
                <td className="border p-2 font-semibold">T630</td>
                <td className="border p-2">A3NV11001+</td>
                <td className="border p-2">A3NV14001+</td>
                <td className="border p-2">A3NV17001+</td>
                <td className="border p-2">A3NV20001+</td>
                <td className="border p-2">A3NV23001+</td>
                <td className="border p-2">A3NV26001+</td>
              </tr>
              <tr>
                <td className="border p-2 font-semibold">T650</td>
                <td className="border p-2">A3NW11001+</td>
                <td className="border p-2">A3NW14001+</td>
                <td className="border p-2">A3NW17001+</td>
                <td className="border p-2">A3NW20001+</td>
                <td className="border p-2">A3NW23001+</td>
                <td className="border p-2">A3NW26001+</td>
              </tr>
              <tr>
                <td className="border p-2 font-semibold">T740</td>
                <td className="border p-2">B3CA11001+</td>
                <td className="border p-2">B3CA14001+</td>
                <td className="border p-2">B3CA17001+</td>
                <td className="border p-2">B3CA20001+</td>
                <td className="border p-2">B3CA23001+</td>
                <td className="border p-2">B3CA26001+</td>
              </tr>
              <tr>
                <td className="border p-2 font-semibold">T770</td>
                <td className="border p-2">A3P411001+</td>
                <td className="border p-2">A3P414001+</td>
                <td className="border p-2">A3P417001+</td>
                <td className="border p-2">A3P420001+</td>
                <td className="border p-2">A3P423001+</td>
                <td className="border p-2">A3P426001+</td>
              </tr>
              <tr>
                <td className="border p-2 font-semibold">T870</td>
                <td className="border p-2">A3P611001+</td>
                <td className="border p-2">A3P614001+</td>
                <td className="border p-2">A3P617001+</td>
                <td className="border p-2">A3P620001+</td>
                <td className="border p-2">A3P623001+</td>
                <td className="border p-2">A3P626001+</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Excavator Model Year Table */}
        <h3>Compact Excavators (E-Series) Model Year Chart</h3>
        <div className="overflow-x-auto mb-8">
          <table className="min-w-full border-collapse text-sm">
            <thead>
              <tr className="bg-yellow-100">
                <th className="border p-2">Model</th>
                <th className="border p-2">2019</th>
                <th className="border p-2">2020</th>
                <th className="border p-2">2021</th>
                <th className="border p-2">2022</th>
                <th className="border p-2">2023</th>
                <th className="border p-2">2024</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border p-2 font-semibold">E10</td>
                <td className="border p-2">B4SB11001+</td>
                <td className="border p-2">B4SB14001+</td>
                <td className="border p-2">B4SB17001+</td>
                <td className="border p-2">B4SB20001+</td>
                <td className="border p-2">B4SB23001+</td>
                <td className="border p-2">B4SB26001+</td>
              </tr>
              <tr>
                <td className="border p-2 font-semibold">E20</td>
                <td className="border p-2">B3YL11001+</td>
                <td className="border p-2">B3YL14001+</td>
                <td className="border p-2">B3YL17001+</td>
                <td className="border p-2">B3YL20001+</td>
                <td className="border p-2">B3YL23001+</td>
                <td className="border p-2">B3YL26001+</td>
              </tr>
              <tr>
                <td className="border p-2 font-semibold">E32</td>
                <td className="border p-2">A94H11001+</td>
                <td className="border p-2">A94H14001+</td>
                <td className="border p-2">A94H17001+</td>
                <td className="border p-2">A94H20001+</td>
                <td className="border p-2">A94H23001+</td>
                <td className="border p-2">A94H26001+</td>
              </tr>
              <tr>
                <td className="border p-2 font-semibold">E35</td>
                <td className="border p-2">A94K11001+</td>
                <td className="border p-2">A94K14001+</td>
                <td className="border p-2">A94K17001+</td>
                <td className="border p-2">A94K20001+</td>
                <td className="border p-2">A94K23001+</td>
                <td className="border p-2">A94K26001+</td>
              </tr>
              <tr>
                <td className="border p-2 font-semibold">E42</td>
                <td className="border p-2">B3E811001+</td>
                <td className="border p-2">B3E814001+</td>
                <td className="border p-2">B3E817001+</td>
                <td className="border p-2">B3E820001+</td>
                <td className="border p-2">B3E823001+</td>
                <td className="border p-2">B3E826001+</td>
              </tr>
              <tr>
                <td className="border p-2 font-semibold">E50</td>
                <td className="border p-2">A93W11001+</td>
                <td className="border p-2">A93W14001+</td>
                <td className="border p-2">A93W17001+</td>
                <td className="border p-2">A93W20001+</td>
                <td className="border p-2">A93W23001+</td>
                <td className="border p-2">A93W26001+</td>
              </tr>
              <tr>
                <td className="border p-2 font-semibold">E55</td>
                <td className="border p-2">A93Y11001+</td>
                <td className="border p-2">A93Y14001+</td>
                <td className="border p-2">A93Y17001+</td>
                <td className="border p-2">A93Y20001+</td>
                <td className="border p-2">A93Y23001+</td>
                <td className="border p-2">A93Y26001+</td>
              </tr>
              <tr>
                <td className="border p-2 font-semibold">E60</td>
                <td className="border p-2">B4M211001+</td>
                <td className="border p-2">B4M214001+</td>
                <td className="border p-2">B4M217001+</td>
                <td className="border p-2">B4M220001+</td>
                <td className="border p-2">B4M223001+</td>
                <td className="border p-2">B4M226001+</td>
              </tr>
              <tr>
                <td className="border p-2 font-semibold">E85</td>
                <td className="border p-2">A3C611001+</td>
                <td className="border p-2">A3C614001+</td>
                <td className="border p-2">A3C617001+</td>
                <td className="border p-2">A3C620001+</td>
                <td className="border p-2">A3C623001+</td>
                <td className="border p-2">A3C626001+</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="not-prose bg-green-50 border-2 border-green-300 rounded-xl p-6 my-8">
          <h3 className="text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
            <span className="text-2xl">📍</span> Need Bobcat Equipment in the Mountain West?
          </h3>
          <p className="text-slate-700 mb-4">
            Flat Earth Equipment provides Bobcat skid steers, compact track loaders, and excavators for rent across <strong>Wyoming, Montana, Colorado, Arizona, New Mexico, and Texas</strong>. All rentals include verified serial numbers and full documentation.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/rental" className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition font-semibold">
              🚜 View Equipment Rentals
            </Link>
            <Link href="/quote" className="inline-flex items-center gap-2 bg-white text-green-700 border-2 border-green-600 px-4 py-2 rounded-lg hover:bg-green-50 transition font-semibold">
              📋 Get a Quote
            </Link>
          </div>
        </div>

        <h2>Importance of Knowing Your Bobcat's Serial Number</h2>
        <p>
          Understanding your Bobcat's serial number is as crucial as having the keys to operate it. That jumble of digits isn't just there for show—it's basically the fingerprint of your machine, unique and incredibly informative. With each set of serial number breaks, you might discover a whole new set of features or changes in your Bobcat.
        </p>

        <h3>Maintenance Records</h3>
        <p>
          Peek beneath the rugged exterior of your Bobcat and you'll find that its serial number is the key to its past, present, and future. Need to order a new part? Get an update on the maintenance schedule? Your serial number is your go-to guy.
        </p>

        <h3>Parts Ordering</h3>
        <p>
          Ordering parts without your Bobcat's serial number is like grocery shopping blindfolded. You might end up with something you didn't want, like a size 10 boot for a size 8 foot. The serial number, with its handy-dandy model and production sequence details, is your passport to a smooth transaction.
        </p>

        <h3>Insurance and Registration</h3>
        <p>
          Think of the serial number as the VIP pass to Bobcat Club—it's what you need to insure your machine, handle claims efficiently, and show that you're the legit owner. Without it, you're just another person with a cool-looking but unidentified piece of metal.
        </p>

        {/* Quick Tool Reference */}
        <div className="not-prose bg-white border border-slate-200 rounded-lg p-6 my-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-red-100 p-2 rounded-lg">
              🔧
            </div>
            <h3 className="text-lg font-bold text-slate-900">Quick Tool</h3>
          </div>
          <div className="text-sm text-slate-600 mb-3">Have your serial ready?</div>
          <Link 
            className="inline-block rounded-lg bg-red-600 text-white px-4 py-2 text-sm font-semibold hover:bg-red-700 transition" 
            href="/bobcat-serial-number-lookup"
          >
            Open the Bobcat Serial Number Lookup
          </Link>
        </div>

        <h2>Why Serial Beats "Model Year" for Parts</h2>
        <p>
          Bobcat parts catalogs are serial-driven. Year-only lookups can be misleading due to mid-series changes. Use the serial for precise fit.
        </p>

        <h2>Conclusion</h2>
        <p>
          Knowing the serial number of your Bobcat is like holding the secret sauce to equipment maintenance, support, and recovery. That tiny string of nine digits uniquely identifies your machine's exact model and production run. This info is a gold mine because it helps you nail down service schedules, avoid mishaps from mechanical failures, and even track down your trusty sidekick if it decides to take an unauthorized field trip.
        </p>

        <p>
          Should you be in a pickle in finding the serial number or need a helping hand with anything from boom swing basics to ensuring you've got the correct configuration for your Bobcat, just ring up Bobcat Customer Service at 1-800-743-4340. Those folks have an arsenal of expertise with Bobcats and can help you with your serial number lookup conundrum.
        </p>

        <h2>Frequently Asked Questions</h2>
        
        <h3>Where is the serial number on a Bobcat skid steer?</h3>
        <p>
          On R-Series loaders (2020+), check the right side rear above the tailgate. M-Series (2010+) have it on the right side of the main frame below the cooling compartment. K-Series (2007-2014) have it on the rear frame upright. Older models vary—check inside or outside the rear upright.
        </p>

        <h3>How do I find what year my Bobcat is?</h3>
        <p>
          The model year is printed directly on the product identification plate alongside the serial number. If the plate is missing or damaged, contact Bobcat customer service at 1-800-743-4340 with your serial number and they can provide the year.
        </p>

        <h3>What do the numbers in a Bobcat serial number mean?</h3>
        <p>
          Bobcat serial numbers are 9 digits: the first 4 digits identify the model number and engine combination (helping identify exact parts compatibility), while the last 5 digits are the production sequence number showing when your machine was built in the production run.
        </p>

        <h3>Can I look up Bobcat parts by serial number?</h3>
        <p>
          Yes! Using your serial number ensures you get parts that fit your exact machine configuration. The Bobcat Parts Catalog at partscatalog.bobcat.com accepts serial numbers for precise parts lookup. For regional support, Flat Earth Equipment serves customers in WY, MT, CO, AZ, NM, and TX with parts and rentals.
        </p>
      </div>

      {/* Final Regional CTA */}
      <div className="mt-12 bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-xl p-8 text-center">
        <h2 className="text-2xl font-bold mb-3">Need Bobcat Equipment or Parts?</h2>
        <p className="text-slate-300 mb-6 max-w-2xl mx-auto">
          Flat Earth Equipment provides Bobcat rentals, parts, and service support across <strong>Wyoming, Montana, Colorado, Arizona, New Mexico, and Texas</strong>. Get expert help identifying the right equipment for your project.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/rental" className="inline-flex items-center gap-2 bg-red-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-red-700 transition-all shadow-lg">
            Browse Equipment Rentals →
          </Link>
          <Link href="/bobcat-serial-number-lookup" className="inline-flex items-center gap-2 bg-white text-slate-900 px-8 py-3 rounded-xl font-bold hover:bg-slate-100 transition-all">
            Try Serial Number Decoder
          </Link>
        </div>
      </div>
    </main>
    </>
  );
} 