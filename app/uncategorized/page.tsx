import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Uncategorized Articles | Flat Earth Equipment',
  description: 'Miscellaneous articles and insights about material handling, equipment trends, and industry developments.',
};

export default function UncategorizedPage() {
  const articles = [
    {
      slug: 'future-green-material-handling',
      title: 'Future Green Material Handling: Sustainable Equipment Solutions',
      description: 'Exploring the future of environmentally sustainable material handling equipment and green technology innovations.',
      date: '2025-01-04',
      image: '/images/green-material-handling.jpg'
    }
  ];

  return (
    <main className="max-w-6xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold text-slate-900 mb-8">Uncategorized Articles</h1>
      <p className="text-lg text-slate-600 mb-12">
        Miscellaneous articles and insights about material handling, equipment trends, and industry developments.
      </p>
      
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {articles.map((article) => (
          <Link
            key={article.slug}
            href={`/uncategorized/${article.slug}`}
            className="group block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-slate-200"
          >
            <div className="aspect-video relative overflow-hidden rounded-t-lg bg-gradient-to-br from-green-400 to-green-600">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-white text-center">
                  <div className="text-4xl mb-2">🌱</div>
                  <div className="text-sm font-medium">Green Technology</div>
                </div>
              </div>
            </div>
            <div className="p-6">
              <h2 className="text-xl font-semibold text-slate-900 group-hover:text-canyon-rust transition-colors">
                {article.title}
              </h2>
              <p className="mt-2 text-slate-600 line-clamp-2">{article.description}</p>
              <time
                dateTime={article.date}
                className="mt-4 block text-sm text-slate-500"
              >
                {new Date(article.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </time>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
