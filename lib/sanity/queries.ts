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

/**
 * Homepage image collections.
 *
 * Every one of these stores a Cloudinary asset rather than a Sanity asset —
 * see lib/sanity/schemas/*. The `image` projection returns the raw plugin
 * payload; lib/cloudinary/url.ts turns it into a delivery URL.
 */

export const logosQuery = `*[_type == "logo"] | order(order asc, name asc) {
  _id,
  name,
  url,
  image
}`;

export const pastEventsQuery = `*[_type == "pastEvent"] | order(order asc, _createdAt desc) {
  _id,
  caption,
  eventDate,
  image
}`;

export const testimonialsQuery = `*[_type == "testimonial"] | order(order asc, _createdAt desc) {
  _id,
  quote,
  authorName,
  authorRole,
  image
}`;

export const upcomingPostsQuery = `*[_type == "upcomingPost" && (!defined(eventDate) || dateTime(eventDate) > dateTime(now()))] | order(eventDate asc) {
  _id,
  title,
  eventDate,
  url,
  image
}`;
