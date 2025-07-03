import React from 'react'
import { Helmet } from 'react-helmet-async'

interface SEOProps {
  title?: string
  description?: string
  keywords?: string
  image?: string
  url?: string
}

const SEO: React.FC<SEOProps> = ({
  title = 'Rent A Bike - Cheapest Bike Rentals in Halifax Regional Municipality',
  description = 'HRM\'s cheapest bike rentals! Explore Halifax, Dartmouth, and surrounding areas with our affordable, quality bikes. Best prices guaranteed - starting from just $6/hour! Discover the best cycling trails in HRM.',
  keywords = 'cheap bike rental halifax, affordable bicycle rental dartmouth, budget bike rental HRM, cheapest cycling halifax, discount bike tours nova scotia, rent a bike halifax, halifax waterfront trail, shearwater flyer trail, salt marsh trail, cycling trails hrm',
  image = 'https://images.pexels.com/photos/100582/pexels-photo-100582.jpeg',
  url = 'https://rent-a-bike.ca'
}) => {
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      
      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="Rent A Bike" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      
      {/* Additional SEO */}
      <meta name="robots" content="index, follow" />
      <meta name="googlebot" content="index, follow" />
      <link rel="canonical" href={url} />
      
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          "name": "Rent A Bike",
          "description": description,
          "url": url,
          "telephone": "+1-902-414-5894",
          "email": "rentabikehrm@gmail.com",
          "address": {
            "@type": "PostalAddress",
            "addressLocality": "Halifax",
            "addressRegion": "NS",
            "addressCountry": "CA"
          },
          "geo": {
            "@type": "GeoCoordinates",
            "latitude": "44.6488",
            "longitude": "-63.5752"
          },
          "openingHours": "Mo-Su 08:00-20:00",
          "priceRange": "$",
          "hasOfferCatalog": {
            "@type": "OfferCatalog",
            "name": "Bike Rental Services",
            "itemListElement": [
              {
                "@type": "Offer",
                "itemOffered": {
                  "@type": "Service",
                  "name": "Hourly Bike Rental",
                  "description": "Affordable hourly bike rentals starting from $6/hour"
                }
              }
            ]
          },
          "areaServed": [
            {
              "@type": "Place",
              "name": "Halifax Regional Municipality"
            },
            {
              "@type": "Place", 
              "name": "Halifax"
            },
            {
              "@type": "Place",
              "name": "Dartmouth"
            },
            {
              "@type": "Place",
              "name": "Bedford"
            },
            {
              "@type": "Place",
              "name": "Sackville"
            }
          ]
        })}
      </script>
    </Helmet>
  )
}

export default SEO