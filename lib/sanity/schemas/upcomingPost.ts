import { defineType, defineField } from 'sanity';
import { cloudinaryImageField } from './cloudinaryImage';

export default defineType({
  name: 'upcomingPost',
  title: 'Upcoming event post',
  type: 'document',
  description:
    'Social posts for events that have not happened yet. Nothing on the site renders these today — the type exists so uploads can start. Wire up a display before relying on it.',
  fields: [
    defineField({
      name: 'title',
      title: 'Event title',
      type: 'string',
      validation: (Rule) => Rule.required().max(120),
    }),
    defineField({
      name: 'eventDate',
      title: 'Event date & time',
      type: 'datetime',
    }),
    defineField({
      name: 'url',
      title: 'RSVP link',
      type: 'url',
      description: 'Usually the LinkedIn post for the event.',
    }),
    cloudinaryImageField('upcomingPosts'),
  ],
  preview: {
    select: { title: 'title', subtitle: 'eventDate', media: 'image' },
  },
});
