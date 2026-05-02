import { Link } from 'react-router-dom';

export default function CategoryGrid({ categories }) {
  return (
    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-11 gap-1">
      {categories.map(cat => (
        <Link key={cat.id} to={`/danh-muc/${cat.slug}`}
          className="flex flex-col items-center gap-1 p-2 bg-white rounded hover:bg-orange-50 transition-colors group">
          <span className="text-3xl">{cat.icon}</span>
          <span className="text-xs text-center text-gray-600 group-hover:text-primary leading-tight line-clamp-2">{cat.name}</span>
        </Link>
      ))}
    </div>
  );
}
