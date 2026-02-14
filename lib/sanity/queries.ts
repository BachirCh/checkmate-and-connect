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

export const blogPostsQuery = `*[_type == "blogPost"] | order(publishedAt desc) {
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
