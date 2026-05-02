import { Link } from 'react-router-dom';
import { formatPrice, timeAgo } from '../utils/api';

export default function ListingCard({ listing }) {
  const img = listing.images?.[0] || `https://picsum.photos/seed/placeholder${listing.id}/400/300`;

  return (
    <Link to={`/tin/${listing.id}`} className="bg-white rounded overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
      <div className="relative">
        <img src={img} alt={listing.title} className="w-full h-44 object-cover" loading="lazy" onError={e => { e.target.src = `https://picsum.photos/seed/err${listing.id}/400/300`; }} />
        {listing.is_featured && (
          <span className="absolute top-1 left-1 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-1.5 py-0.5 rounded">VIP</span>
        )}
        {listing.item_condition === 'new' && (
          <span className="absolute top-1 right-1 bg-green-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">Mới</span>
        )}
      </div>
      <div className="p-2 flex flex-col flex-1">
        <p className="text-primary font-bold text-base leading-tight">
          {listing.price === 0 ? 'Miễn phí' : formatPrice(listing.price)}
          {listing.negotiable ? <span className="text-gray-400 text-xs font-normal ml-1">• TL</span> : null}
        </p>
        <h3 className="text-gray-800 text-sm mt-0.5 line-clamp-2 flex-1">{listing.title}</h3>
        <div className="flex items-center justify-between mt-1.5 text-gray-400 text-xs">
          <span className="truncate max-w-[60%]">{listing.province}</span>
          <span>{timeAgo(listing.created_at)}</span>
        </div>
      </div>
    </Link>
  );
}
