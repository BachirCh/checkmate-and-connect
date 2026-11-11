import { defineType, defineField } from 'sanity';

/**
 * One person checking in at one Wednesday.
 *
 * `eventDate` is set server-side from the day of submission — /presence only
 * accepts check-ins on the Wednesday itself, so there is no date in the URL.
 */
export default defineType({
  name: 'presence',
  title: 'Presence',
  type: 'document',
  fields: [
    defineField({
      name: 'fullName',
      title: 'Full name',
      type: 'string',
      validation: (Rule) => Rule.required().max(100),
    }),
    defineField({
      name: 'role',
      title: 'Role',
      type: 'string',
      validation: (Rule) => Rule.required().max(100),
    }),
    defineField({
      name: 'company',
      title: 'Company',
      type: 'string',
      validation: (Rule) => Rule.required().max(100),
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
    select: { name: 'fullName', company: 'company', date: 'eventDate' },
    prepare({ name, company, date }) {
      const day = date
        ? new Intl.DateTimeFormat('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            timeZone: 'UTC',
          }).format(new Date(`${date}T12:00:00Z`))
        : 'No date';
      return { title: name, subtitle: `${company ?? ''} · ${day}` };
    },
  },
});
