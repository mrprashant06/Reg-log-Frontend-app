import React from 'react';
import { Link } from 'react-router-dom';

const MEGA_MENUS = {
  WOMAN: {
    columns: [
      {
        title: 'New & Featured',
        links: [
          { label: 'New Arrivals', to: '/products?gender=WOMEN&sort=newest' },
          { label: 'Best Sellers', to: '/products?gender=WOMEN&sort=popularity' },
          { label: 'The Edit: Monochrome', to: '/products?gender=WOMEN' },
          { label: 'Party & Evening', to: '/products?gender=WOMEN' },
        ]
      },
      {
        title: 'Clothing',
        links: [
          { label: 'Dresses & Jumpsuits', to: '/products?gender=WOMEN' },
          { label: 'Tops & Knits', to: '/products?gender=WOMEN' },
          { label: 'Shirts & Blouses', to: '/products?gender=WOMEN' },
          { label: 'Trousers & Skirts', to: '/products?gender=WOMEN' },
          { label: 'Blazers & Outerwear', to: '/products?gender=WOMEN' },
        ]
      },
      {
        title: 'Shoes & Accessories',
        links: [
          { label: 'Leather Boots', to: '/products?category=shoes' },
          { label: 'Minimalist Heels', to: '/products?category=shoes' },
          { label: 'Crossbody Bags', to: '/products?category=accessories' },
          { label: 'Jewelry & Watches', to: '/products?category=watches' },
          { label: 'Sunglasses', to: '/products?category=accessories' },
        ]
      },
      {
        title: 'Collections',
        links: [
          { label: 'Studio Autumn/Winter', to: '/products?gender=WOMEN' },
          { label: 'Pure Cashmere', to: '/products?gender=WOMEN' },
          { label: 'Modern Tailoring', to: '/products?gender=WOMEN' },
          { label: 'Sustainable Care', to: '/products?gender=WOMEN' },
        ]
      }
    ],
    spotlight: {
      image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800&auto=format&fit=crop',
      title: 'THE COUTURE SUIT',
      subtitle: 'VIEW EDITORIAL',
      link: '/products?gender=WOMEN'
    }
  },
  MAN: {
    columns: [
      {
        title: 'New & Featured',
        links: [
          { label: 'New Arrivals', to: '/products?gender=MEN&sort=newest' },
          { label: 'Editorial Collection', to: '/products?gender=MEN' },
          { label: 'Formal Wardrobe', to: '/products?gender=MEN' },
          { label: 'Smart Casual', to: '/products?gender=MEN' },
        ]
      },
      {
        title: 'Clothing',
        links: [
          { label: 'Tailored Suits & Blazers', to: '/products?gender=MEN' },
          { label: 'Crisp Cotton Shirts', to: '/products?gender=MEN' },
          { label: 'Merino Knitwear', to: '/products?gender=MEN' },
          { label: 'Chinos & Pleated Pants', to: '/products?gender=MEN' },
          { label: 'Selvedge Denim', to: '/products?gender=MEN' },
        ]
      },
      {
        title: 'Shoes & Accessories',
        links: [
          { label: 'Leather Loafers', to: '/products?category=shoes' },
          { label: 'Minimalist Sneakers', to: '/products?category=shoes' },
          { label: 'Swiss Chronographs', to: '/products?category=watches' },
          { label: 'Leather Wallets & Belts', to: '/products?category=accessories' },
        ]
      },
      {
        title: 'Editions',
        links: [
          { label: 'The Linen Drop', to: '/products?gender=MEN' },
          { label: 'Italian Wool Classics', to: '/products?gender=MEN' },
          { label: 'Urban Minimalist', to: '/products?gender=MEN' },
        ]
      }
    ],
    spotlight: {
      image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=800&auto=format&fit=crop',
      title: 'SUPER 130S MERINO',
      subtitle: 'DISCOVER NOW',
      link: '/products?gender=MEN'
    }
  },
  'NEW COLLECTION': {
    columns: [
      {
        title: 'Fresh Arrivals',
        links: [
          { label: 'Woman: New This Week', to: '/products?gender=WOMEN&sort=newest' },
          { label: 'Man: New This Week', to: '/products?gender=MEN&sort=newest' },
          { label: 'Trending Silhouettes', to: '/products?sort=popularity' },
          { label: 'Runway Highlights', to: '/products' },
        ]
      },
      {
        title: 'Campaigns',
        links: [
          { label: 'Studio Autumn/Winter', to: '/products' },
          { label: 'Evening Capsule', to: '/products' },
          { label: 'Neutral Tones Edit', to: '/products' },
        ]
      },
      {
        title: 'Essentials',
        links: [
          { label: 'Classic Trench Coats', to: '/products' },
          { label: 'Sculpted Footwear', to: '/products?category=shoes' },
          { label: 'Statement Eyewear', to: '/products?category=accessories' },
        ]
      },
      {
        title: 'Lookbook',
        links: [
          { label: 'Campaign Film', to: '/products' },
          { label: 'Behind the Design', to: '/products' },
        ]
      }
    ],
    spotlight: {
      image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop',
      title: 'CAPSULE 2026',
      subtitle: 'EXPLORE CAMPAIGN',
      link: '/products?sort=newest'
    }
  },
  SALE: {
    columns: [
      {
        title: 'Discounts by Department',
        links: [
          { label: "Women's Sale — Up to 50%", to: '/products?gender=WOMEN' },
          { label: "Men's Sale — Up to 50%", to: '/products?gender=MEN' },
          { label: 'Footwear Reductions', to: '/products?category=shoes' },
          { label: 'Accessories Markdowns', to: '/products?category=accessories' },
        ]
      },
      {
        title: 'Special Selections',
        links: [
          { label: 'Under ₹2,999', to: '/products?maxPrice=2999' },
          { label: 'Under ₹4,999', to: '/products?maxPrice=4999' },
          { label: 'Last Pieces / Final Reductions', to: '/products' },
        ]
      },
      {
        title: 'Featured Reductions',
        links: [
          { label: 'Tailored Coats on Sale', to: '/products' },
          { label: 'Silk Dresses on Sale', to: '/products' },
          { label: 'Leather Jackets', to: '/products' },
        ]
      },
      {
        title: 'Policies',
        links: [
          { label: 'Sale Return Terms', to: '/profile' },
          { label: 'Express Delivery on Sale', to: '/cart' },
        ]
      }
    ],
    spotlight: {
      image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=800&auto=format&fit=crop',
      title: 'SEASON END SALE',
      subtitle: 'SHOP REDUCTIONS',
      link: '/products'
    }
  }
};

export default function MegaMenu({ activeTab, onClose }) {
  if (!activeTab || !MEGA_MENUS[activeTab]) return null;

  const data = MEGA_MENUS[activeTab];

  return (
    <div
      className="aura-megamenu-overlay"
      onMouseLeave={onClose}
    >
      <div className="aura-megamenu-grid">
        {data.columns.map((col, idx) => (
          <div key={idx} className="aura-megamenu-col">
            <h4>{col.title}</h4>
            <ul>
              {col.links.map((link, lIdx) => (
                <li key={lIdx}>
                  <Link to={link.to} onClick={onClose}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {data.spotlight && (
          <Link to={data.spotlight.link} className="aura-megamenu-spotlight" onClick={onClose}>
            <img src={data.spotlight.image} alt={data.spotlight.title} />
            <div className="aura-megamenu-spotlight-caption">
              <h5>{data.spotlight.title}</h5>
              <span>{data.spotlight.subtitle}</span>
            </div>
          </Link>
        )}
      </div>
    </div>
  );
}
