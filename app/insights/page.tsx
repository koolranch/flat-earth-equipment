import { Metadata } from 'next';
import Link from 'next/link';
import { getAllBlogPosts } from '@/lib/mdx';

export const metadata: Metadata = {
  title: 'Insights & Guides | Flat Earth Equipment',
  description: 'Expert guides and insights on forklift parts, scissor lifts, and industrial equipment maintenance.',
};

export default async function InsightsPage() {
  const posts = await getAllBlogPosts();

  // Categorize posts by keywords for better organization
  const categories = {
    'Forklift Parts': posts.filter(p => 
      p.keywords?.some(k => k.toLowerCase().includes('forklift')) || 
      p.title.toLowerCase().includes('forklift')
    ),
    'Battery Chargers': posts.filter(p => 
      p.keywords?.some(k => k.toLowerCase().includes('charger') || k.toLowerCase().includes('battery')) ||
      p.title.toLowerCase().includes('charger') || p.title.toLowerCase().includes('battery')
    ),
    'Maintenance': posts.filter(p => 
      p.keywords?.some(k => k.toLowerCase().includes('maintenance') || k.toLowerCase().includes('repair')) ||
      p.title.toLowerCase().includes('maintenance')
    ),
    'Safety': posts.filter(p => 
      p.keywords?.some(k => k.toLowerCase().includes('safety')) ||
      p.title.toLowerCase().includes('safety')
    ),
  };

  // Helper function to check if image exists and is valid
  const hasValidImage = (post: any) => {
    return post.image && 
           post.image !== '/images/insights/.jpg' && 
           post.image.length > 10 && 
           !post.image.includes('undefined');
  };

  // Get featured posts (most recent or most important)
  const featuredPosts = posts.slice(0, 3);
  const remainingPosts = posts.slice(3);

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'Flat Earth Equipment Insights',
    description: 'Expert guides and insights on forklift parts, scissor lifts, and industrial equipment maintenance.',
    url: 'https://flatearthequipment.com/insights',
    publisher: {
      '@type': 'Organization',
      name: 'Flat Earth Equipment',
      logo: {
        '@type': 'ImageObject',
        url: 'https://flatearthequipment.com/logo.png',
      },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <main className="max-w-7xl mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-canyon-rust/10 text-canyon-rust px-4 py-2 rounded-full text-sm font-semibold mb-6">
            <span>📚</span> Expert Knowledge Base
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
            Insights & Guides
          </h1>
          
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed mb-8">
            Expert guides and insights on forklift parts, scissor lifts, and industrial equipment maintenance. 
            Written by our technical team with real-world experience.
          </p>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white rounded-xl border border-slate-200 p-6 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-2xl font-bold text-canyon-rust">{posts.length}</div>
              <div className="text-sm text-slate-600">Articles</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-canyon-rust">{Object.keys(categories).length}</div>
              <div className="text-sm text-slate-600">Categories</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-canyon-rust">30+</div>
              <div className="text-sm text-slate-600">Brands Covered</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-canyon-rust">Free</div>
              <div className="text-sm text-slate-600">Expert Advice</div>
            </div>
          </div>
        </div>

        {/* Featured Articles */}
        {featuredPosts.length > 0 && (
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-slate-900 mb-8">Featured Articles</h2>
            <div className="grid gap-8 md:grid-cols-3">
              {featuredPosts.map((post, index) => (
                <Link
                  key={post.slug}
                  href={`/insights/${post.slug}`}
                  className={`group block bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 border-2 border-slate-200 hover:border-canyon-rust overflow-hidden ${
                    index === 0 ? 'md:col-span-2 md:row-span-1' : ''
                  }`}
                >
                  <div className={`relative overflow-hidden ${index === 0 ? 'aspect-[2/1]' : 'aspect-video'}`}>
                    <div className="relative w-full h-full">
                      {hasValidImage(post) && (
                        <img
                          src={post.image}
                          alt={post.title}
                          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                        />
                      )}
                      <div className={`absolute inset-0 bg-gradient-to-br from-canyon-rust/20 to-canyon-rust/5 flex items-center justify-center ${hasValidImage(post) ? 'hidden' : 'flex'}`}>
                        <div className="text-center text-canyon-rust/60">
                          <div className="text-4xl mb-2">
                            {post.title.toLowerCase().includes('forklift') ? '🏭' :
                             post.title.toLowerCase().includes('charger') || post.title.toLowerCase().includes('battery') ? '🔋' :
                             post.title.toLowerCase().includes('safety') ? '🛡️' :
                             post.title.toLowerCase().includes('maintenance') ? '🔧' : '📄'}
                          </div>
                          <div className="text-sm font-medium">Article</div>
                        </div>
                      </div>
                    </div>
                    <div className="absolute top-4 left-4 bg-canyon-rust text-white px-3 py-1 rounded-full text-xs font-semibold">
                      Featured
                    </div>
                  </div>
                  <div className="p-6">
                    <h2 className={`font-bold text-slate-900 group-hover:text-canyon-rust transition-colors mb-3 ${
                      index === 0 ? 'text-2xl' : 'text-xl'
                    }`}>
                      {post.title}
                    </h2>
                    <p className="text-slate-600 line-clamp-2 mb-4">{post.description}</p>
                    <div className="flex items-center justify-between">
                      <time
                        dateTime={post.date}
                        className="text-sm text-slate-500"
                      >
                        {new Date(post.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </time>
                      <span className="text-sm font-medium text-canyon-rust">
                        Read Article →
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Category Sections */}
        {Object.entries(categories).map(([categoryName, categoryPosts]) => 
          categoryPosts.length > 0 && (
            <section key={categoryName} className="mb-16">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-slate-900">{categoryName}</h2>
                <span className="text-sm text-slate-500">{categoryPosts.length} articles</span>
              </div>
              
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {categoryPosts.slice(0, 6).map((post) => (
                  <Link
                    key={post.slug}
                    href={`/insights/${post.slug}`}
                    className="group block bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 border border-slate-200 hover:border-canyon-rust/50 overflow-hidden"
                  >
                    <div className="aspect-video relative overflow-hidden">
                      {hasValidImage(post) ? (
                        <img
                          src={post.image}
                          alt={post.title}
                          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-canyon-rust/15 to-canyon-rust/5 flex items-center justify-center">
                          <div className="text-center text-canyon-rust/50">
                            <div className="text-3xl mb-1">
                              {post.title.toLowerCase().includes('forklift') ? '🏭' :
                               post.title.toLowerCase().includes('charger') || post.title.toLowerCase().includes('battery') ? '🔋' :
                               post.title.toLowerCase().includes('safety') ? '🛡️' :
                               post.title.toLowerCase().includes('maintenance') ? '🔧' : '📄'}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="p-5">
                      <h3 className="text-lg font-semibold text-slate-900 group-hover:text-canyon-rust transition-colors mb-2 line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="text-slate-600 text-sm line-clamp-2 mb-3">{post.description}</p>
                      <time
                        dateTime={post.date}
                        className="text-xs text-slate-500"
                      >
                        {new Date(post.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </time>
                    </div>
                  </Link>
                ))}
              </div>
              
              {categoryPosts.length > 6 && (
                <div className="text-center mt-8">
                  <button className="text-canyon-rust hover:underline font-medium">
                    View All {categoryName} Articles →
                  </button>
                </div>
              )}
            </section>
          )
        )}

        {/* All Other Articles */}
        {remainingPosts.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-8">More Articles</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {remainingPosts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/insights/${post.slug}`}
                  className="group block bg-white rounded-lg shadow-sm hover:shadow-md transition-all border border-slate-200 hover:border-canyon-rust/50"
                >
                  <div className="aspect-video relative overflow-hidden rounded-t-lg">
                    {hasValidImage(post) ? (
                      <img
                        src={post.image}
                        alt={post.title}
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-canyon-rust/10 to-slate-50 flex items-center justify-center">
                        <div className="text-center text-canyon-rust/40">
                          <div className="text-2xl">
                            {post.title.toLowerCase().includes('forklift') ? '🏭' :
                             post.title.toLowerCase().includes('charger') || post.title.toLowerCase().includes('battery') ? '🔋' :
                             post.title.toLowerCase().includes('safety') ? '🛡️' :
                             post.title.toLowerCase().includes('maintenance') ? '🔧' : '📄'}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-base font-semibold text-slate-900 group-hover:text-canyon-rust transition-colors line-clamp-2 mb-2">
                      {post.title}
                    </h3>
                    <time
                      dateTime={post.date}
                      className="text-xs text-slate-500"
                    >
                      {new Date(post.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </time>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      </main>
    </div>
  );
} 