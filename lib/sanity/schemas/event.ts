import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'event',
  title: 'Event',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required().min(5).max(100),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      validation: (Rule) => Rule.required().max(500),
    }),
    defineField({
      name: 'eventType',
      title: 'Event Type',
      type: 'string',
      options: {
        list: [
          { title: 'One-Time Event', value: 'one-time' },
          { title: 'Recurring Event', value: 'recurring' },
        ],
        layout: 'radio',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'eventDateTime',
      title: 'Event Date & Time',
      type: 'datetime',
      hidden: ({ parent }) => parent?.eventType !== 'one-time',
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const parent = context.parent as { eventType?: string };
          if (parent?.eventType === 'one-time' && !value) {
            return 'Date & time is required for one-time events';
          }
          return true;
        }),
    }),
    defineField({
      name: 'recurrencePattern',
      title: 'Recurrence Pattern',
      type: 'string',
      placeholder: 'Every Saturday at 10:00 AM',
      hidden: ({ parent }) => parent?.eventType !== 'recurring',
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const parent = context.parent as { eventType?: string };
          if (parent?.eventType === 'recurring' && !value) {
            return 'Recurrence pattern is required for recurring events';
          }
          return true;
        }),
    }),
    defineField({
      name: 'author',
      title: 'Organizer Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'image',
      title: 'Event Image',
      type: 'image',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          { title: 'Pending', value: 'pending' },
          { title: 'Approved', value: 'approved' },
          { title: 'Rejected', value: 'rejected' },
        ],
        layout: 'radio',
      },
      initialValue: 'pending',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'submittedAt',
      title: 'Submitted At',
      type: 'datetime',
    }),
    defineField({
      name: 'approvedAt',
      title: 'Approved At',
      type: 'datetime',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      author: 'author',
      eventType: 'eventType',
      eventDateTime: 'eventDateTime',
      recurrencePattern: 'recurrencePattern',
      media: 'image',
    },
    prepare({ title, author, eventType, eventDateTime, recurrencePattern, media }) {
      const timeInfo =
        eventType === 'recurring'
          ? recurrencePattern
          : eventDateTime
          ? new Date(eventDateTime).toLocaleString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
            })
          : 'No date set';

      return {
        title: title || 'Untitled Event',
        subtitle: `${author} • ${timeInfo}`,
        media,
      };
    },
  },
});
