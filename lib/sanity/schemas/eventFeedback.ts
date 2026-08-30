import { defineType, defineField } from 'sanity';

/**
 * One participant's feedback on one Wednesday.
 *
 * `eventDate` is the session it belongs to, taken from the DDMMYY in the form
 * URL — that is what groups responses in the admin view, so it is required.
 */
export default defineType({
  name: 'eventFeedback',
  title: 'Event feedback',
  type: 'document',
  fields: [
    defineField({
      name: 'fullName',
      title: 'Full name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'liked',
      title: 'What worked',
      description: 'One thing to keep as is.',
      type: 'text',
      rows: 4,
      validation: (Rule) => Rule.required().max(500),
    }),
    defineField({
      name: 'improve',
      title: 'What to improve',
      description: 'One thing to change next time.',
      type: 'text',
      rows: 4,
      validation: (Rule) => Rule.required().max(500),
    }),
    defineField({
      name: 'eventDate',
      title: 'Session date',
      type: 'date',
      options: { dateFormat: 'dddd D MMMM YYYY' },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'submittedAt',
      title: 'Submitted at',
      type: 'datetime',
    }),
  ],
  orderings: [
    {
      name: 'eventDateDesc',
      title: 'Latest session first',
      by: [
        { field: 'eventDate', direction: 'desc' },
        { field: 'submittedAt', direction: 'desc' },
      ],
    },
  ],
  preview: {
    select: { name: 'fullName', date: 'eventDate', liked: 'liked' },
    prepare({ name, date, liked }) {
      const day = date
        ? new Intl.DateTimeFormat('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            timeZone: 'UTC',
          }).format(new Date(`${date}T12:00:00Z`))
        : 'No date';
      return { title: `${name || 'Anonymous'} · ${day}`, subtitle: liked };
    },
  },
});
