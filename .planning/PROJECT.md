# Checkmate & Connect Website

## What This Is

A community website for Checkmate & Connect (C&C), a chess and entrepreneurship community in Casablanca that brings together 200+ members every Wednesday at 6pm at Commons. The site serves as the digital home for C&C, making it easy to explain what the community is to newcomers and providing a hub for existing members to connect.

## Core Value

Easy to share and explain. When someone asks "what's Checkmate & Connect?", send them a link that clearly shows what the community is, when and where they meet, and who's part of it.

## Requirements

### Validated

(None yet — ship to validate)

### Active

**Landing & Information**
- [ ] Visitor can understand what C&C is (chess + entrepreneurship community)
- [ ] Visitor can see when meetups happen (every Wednesday, 6pm)
- [ ] Visitor can see where meetups happen (Commons, Casablanca, Morocco)
- [ ] Visitor can see next event via embedded Meetup widget

**Member Directory**
- [ ] Visitor can browse member directory with photos and professional info
- [ ] Member directory shows: name, photo, job title, company (optional), LinkedIn link
- [ ] Member can submit their profile through a form
- [ ] Admin can review pending member submissions
- [ ] Admin can approve member submissions (makes them visible)
- [ ] Admin can reject member submissions
- [ ] Admin can edit existing member profiles
- [ ] Admin can remove members from directory

**Blog/Events**
- [ ] Visitor can read blog posts from past events
- [ ] Blog posts include: photos, title, description with key takeaways
- [ ] Admin can create new blog posts
- [ ] Admin can edit existing blog posts
- [ ] Admin can delete blog posts
- [ ] Blog posts are displayed in reverse chronological order

**Admin System**
- [ ] Admin can log in securely
- [ ] Support for 2-3 admin users
- [ ] Admin has access to member management interface
- [ ] Admin has access to blog management interface

### Out of Scope

- Member accounts/authentication — Keep it simple; members submit once, admins manage. If updates needed, members contact admins.
- Real-time chat or forums — Focus on the in-person meetups, not building online discussion spaces
- Event management system — Meetup.com already handles this well; just embed their widget
- Mobile app — Web-first approach, mobile-responsive is sufficient
- Payment processing — Community is free to join
- Multilingual support — Start with English/French for Casablanca audience

## Context

**Community Background**
- C&C has been running successfully for 2 years
- Consistent weekly meetups every Wednesday at 6pm
- 200+ active community members
- Unique positioning: combines chess with entrepreneurship/networking
- Location: Commons, Casablanca, Morocco
- Currently uses Meetup.com for event organization

**Problem Being Solved**
- Hard to explain what C&C is when people ask
- No central place to showcase the community online
- Difficult for potential members to see who's involved
- No archive of past events and key moments
- Need shareable link for social media, word-of-mouth, etc.

**Target Audiences**
1. **Newcomers** - People who heard about C&C and want to learn more
2. **Potential Members** - Evaluating if they want to join the community
3. **Existing Members** - Want to connect with other members, see who's in the community
4. **Admins** - Need to manage member directory and share community updates

## Constraints

- **Budget**: Keep costs low/free - prefer free hosting solutions (Vercel, Netlify, etc.)
- **Maintenance**: Easy for non-technical team to manage - no dedicated developers on the team
- **Timeline**: Fast to ship - want to launch quickly, not months of development
- **Team**: 2-3 admin users who will manage content
- **Integration**: Must work with existing Meetup.com setup (embed their widget)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| No member authentication | Simpler to build and maintain; members submit profiles, admins manage | — Pending |
| Embed Meetup widget vs custom events | Meetup already works well, no need to rebuild event management | — Pending |

---
*Last updated: 2026-02-14 after initialization*
