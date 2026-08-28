import { defineType, defineField } from 'sanity';
import { cloudinaryImageField, orderField } from './cloudinaryImage';

export default defineType({
  name: 'logo',
  title: 'Partner logo',
  type: 'document',
  description:
    'Logos shown in the speakers band on the homepage. Only add organisations that have actually spoken at or partnered with C&C.',
  fields: [
    defineField({
      name: 'name',
      title: 'Organisation name',
      type: 'string',
      description: 'Used as the image alt text.',
      validation: (Rule) => Rule.required().max(80),
    }),
    defineField({
      name: 'url',
      title: 'Website',
      type: 'url',
      description: 'Optional. Makes the logo a link.',
    }),
    cloudinaryImageField('logos'),
    orderField,
  ],
  preview: {
    select: { title: 'name', subtitle: 'url', media: 'image' },
  },
});
