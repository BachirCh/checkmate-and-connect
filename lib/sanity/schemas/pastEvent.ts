import { defineType, defineField } from 'sanity';
import { cloudinaryImageField, orderField } from './cloudinaryImage';

export default defineType({
  name: 'pastEvent',
  title: 'Past event photo',
  type: 'document',
  description: 'Photos in the "What you missed" carousel on the homepage.',
  fields: [
    defineField({
      name: 'caption',
      title: 'Caption',
      type: 'string',
      description:
        'Describe what is happening in the photo. This becomes the alt text, so write it for someone who cannot see the image.',
      validation: (Rule) => Rule.required().min(10).max(160),
    }),
    defineField({
      name: 'eventDate',
      title: 'Event date',
      type: 'date',
      options: { dateFormat: 'YYYY-MM-DD' },
    }),
    cloudinaryImageField('pastEvents'),
    orderField,
  ],
  preview: {
    select: { title: 'caption', subtitle: 'eventDate', media: 'image' },
  },
});
