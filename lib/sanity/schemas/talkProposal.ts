import { defineType, defineField } from 'sanity';

/**
 * A talk suggested by a visitor through /speak.
 *
 * Everything lands as `pending`: the form is open to anyone, so nothing here
 * is published or acted on until an organiser has read it.
 */
export default defineType({
  name: 'talkProposal',
  title: 'Talk proposal',
  type: 'document',
  fields: [
    defineField({
      name: 'fullName',
      title: 'Full name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'linkedIn',
      title: 'LinkedIn URL',
      type: 'url',
      validation: (Rule) => Rule.uri({ scheme: ['http', 'https'] }),
    }),
    defineField({
      name: 'subjectTitle',
      title: 'Subject title',
      type: 'string',
      validation: (Rule) => Rule.required().max(120),
    }),
    defineField({
      name: 'subjectDescription',
      title: 'Subject description',
      type: 'text',
      rows: 6,
      validation: (Rule) => Rule.required().max(1000),
    }),
    defineField({
      name: 'preferredDate',
      title: 'Preferred Wednesday',
      type: 'date',
      options: { dateFormat: 'dddd D MMMM YYYY' },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          { title: 'Pending', value: 'pending' },
          { title: 'Accepted', value: 'accepted' },
          { title: 'Declined', value: 'declined' },
        ],
        layout: 'radio',
      },
      initialValue: 'pending',
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
      name: 'submittedAtDesc',
      title: 'Newest first',
      by: [{ field: 'submittedAt', direction: 'desc' }],
    },
  ],
  preview: {
    select: {
      title: 'subjectTitle',
      name: 'fullName',
      date: 'preferredDate',
      status: 'status',
    },
    prepare({ title, name, date, status }) {
      // `date` is a plain YYYY-MM-DD string; parsing it as UTC keeps the day
      // from sliding backwards for anyone west of Greenwich.
      const day = date
        ? new Intl.DateTimeFormat('en-GB', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            timeZone: 'UTC',
          }).format(new Date(`${date}T12:00:00Z`))
        : 'No date';

      return {
        title: title || 'Untitled proposal',
        subtitle: `${name || 'Unknown'} · ${day} · ${status || 'pending'}`,
      };
    },
  },
});
