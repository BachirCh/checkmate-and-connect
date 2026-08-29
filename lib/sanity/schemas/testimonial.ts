import { defineType, defineField } from 'sanity';
import { cloudinaryImageField, orderField } from './cloudinaryImage';

export default defineType({
  name: 'testimonial',
  title: 'Testimonial',
  type: 'document',
  description:
    'Designed quote cards in the "What people say" carousel. The card itself is an uploaded image, but the quote text below is what search engines and AI assistants can actually read — so it has to match the card.',
  fields: [
    defineField({
      name: 'quote',
      title: 'Quote text',
      type: 'text',
      rows: 3,
      description:
        'Type the quote exactly as it appears on the card. Drives the alt text and the Review structured data.',
      validation: (Rule) => Rule.required().min(20).max(400),
    }),
    defineField({
      name: 'authorName',
      title: 'Author name',
      type: 'string',
      validation: (Rule) => Rule.required().max(80),
    }),
    defineField({
      name: 'authorRole',
      title: 'Author role',
      type: 'string',
      description: 'e.g. "UX Designer · OCP · member since 2025"',
      validation: (Rule) => Rule.max(120),
    }),
    cloudinaryImageField('testimonials'),
    orderField,
  ],
  preview: {
    select: { title: 'authorName', subtitle: 'quote', media: 'image' },
  },
});
