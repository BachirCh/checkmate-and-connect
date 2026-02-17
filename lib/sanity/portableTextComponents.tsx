import type { PortableTextComponents } from '@portabletext/react';
import { urlFor } from '@/lib/sanity/imageUrl';

export const portableTextComponents: PortableTextComponents = {
  types: {
    image: ({ value }) => {
      if (!value?.asset) return null;

      // Generate optimized image URL with Sanity CDN
      const imageUrl = urlFor(value).width(800).auto('format').url();

      return (
        <figure className="my-8">
          <img
            src={imageUrl || ''}
            alt={value.alt || 'Blog post image'}
            className="w-full rounded-lg"
          />
          {value.caption && (
            <figcaption className="text-center text-gray-400 text-sm mt-2">
              {value.caption}
            </figcaption>
          )}
        </figure>
      );
    },
  },
  marks: {
    link: ({ children, value }) => {
      const href = value?.href || '';
      const isExternal = !href.startsWith('/');

      return (
        <a
          href={href}
          className="text-blue-400 hover:underline"
          rel={isExternal ? 'noopener noreferrer' : undefined}
          target={isExternal ? '_blank' : undefined}
        >
          {children}
        </a>
      );
    },
  },
  block: {
    h2: ({ children }) => (
      <h2 className="text-3xl font-bold mt-8 mb-4">{children}</h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-2xl font-bold mt-6 mb-3">{children}</h3>
    ),
    normal: ({ children }) => (
      <p className="text-gray-300 leading-relaxed mb-4">{children}</p>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="list-disc list-inside space-y-2 mb-4 text-gray-300">
        {children}
      </ul>
    ),
    number: ({ children }) => (
      <ol className="list-decimal list-inside space-y-2 mb-4 text-gray-300">
        {children}
      </ol>
    ),
  },
};
