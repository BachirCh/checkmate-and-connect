// GROQ queries for Sanity CMS

export const membersQuery = `*[_type == "member" && status == "approved"] | order(name asc) {
  _id,
  name,
  slug,
  photo,
  jobTitle,
  company,
  linkedIn,
  bio,
  status,
  approvedAt
}`;

export const blogPostsQuery = `*[_type == "blogPost" && defined(publishedAt)] | order(publishedAt desc) {
  _id,
  title,
  slug,
  coverImage,
  excerpt,
  publishedAt,
  author
}`;

export const blogPostBySlugQuery = `*[_type == "blogPost" && slug.current == $slug][0] {
  _id,
  title,
  slug,
  coverImage,
  excerpt,
  body,
  publishedAt,
  author
}`;

export const upcomingEventsQuery = `*[
  _type == "event"
  && status == "approved"
  && (
    eventType == "recurring"
    || dateTime(eventDateTime) > dateTime(now())
  )
] | order(eventDateTime asc) {
  _id,
  title,
  slug,
  image,
  description,
  eventType,
  eventDateTime,
  recurrencePattern,
  author
}`;

export const allEventsQuery = `*[
  _type == "event"
  && status == "approved"
] | order(eventDateTime desc) {
  _id,
  title,
  slug,
  image,
  description,
  eventType,
  eventDateTime,
  recurrencePattern,
  author
}`;
