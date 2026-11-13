/**
 * Community guidelines, shown at /terms.
 *
 * Source: the Checkmate & Connect Community Playbook (v1.0). Rule IDs (A1, B2…)
 * are the ones the board uses when it discusses the playbook, so they stay
 * stable even if a rule is reworded or moved. Bump TERMS_VERSION whenever a
 * rule changes in substance: /presence records the version each person agreed to.
 */
export const TERMS_VERSION = '1.0';

export type RuleKind = 'must' | 'etiquette' | 'approval' | 'info';

export const RULE_KINDS: Record<RuleKind, string> = {
  must: 'Required rule',
  etiquette: 'Good practice',
  approval: 'Board approval',
  info: 'How it works',
};

export interface Rule {
  id: string;
  kind: RuleKind;
  title: string;
  description: string;
  /** A short worked case, on the two rules that have one. */
  example?: string;
}

export interface Chapter {
  id: string;
  title: string;
  summary: string;
  rules: Rule[];
}

export const chapters: Chapter[] = [
  {
    id: 'boundaries',
    title: 'Respect and boundaries',
    summary: 'Treat people with respect and make space for them to set their own limits.',
    rules: [
      {
        id: 'A1',
        kind: 'must',
        title: 'Treat everyone with respect',
        description: 'Welcome people regardless of their background, role or experience. Harassment, intimidation, discrimination, threats and unwanted sexual attention are prohibited in the group, at events and in interactions that start through the community. Personal attacks, insults and public humiliation are also prohibited.',
      },
      {
        id: 'A2',
        kind: 'must',
        title: 'Respect a person’s boundaries',
        description: 'Give people room to decline a conversation, an introduction, an activity or a request for personal information. Stop when they decline or ask you to stop. Give them space if they disengage.',
      },
      {
        id: 'A3',
        kind: 'etiquette',
        title: 'Discuss ideas respectfully',
        description: 'Ask questions, give constructive feedback and make space for others. Challenge the idea and keep the discussion focused on the topic.',
      },
    ],
  },
  {
    id: 'privacy',
    title: 'Private contact and privacy',
    summary: 'Ask before messaging or calling and protect the information members share.',
    rules: [
      {
        id: 'B1',
        kind: 'must',
        title: 'Get permission before private contact',
        description: 'Get the person’s explicit permission before using a number or profile found through the community to send a private message or make a call. Ask in person or where you are already conversing, without putting them on the spot. Silence is not permission. Keep the contact within the purpose they agreed to.',
        example: 'You discussed a job at an event. Ask if the person would like you to send the link privately before messaging them.',
      },
      {
        id: 'B2',
        kind: 'must',
        title: 'Keep member contacts out of outreach lists',
        description: 'Do not collect, export, store or reuse member contacts for unsolicited sales, recruitment, marketing or bulk outreach. Ask before adding anyone to a group, mailing list or other channel.',
      },
      {
        id: 'B3',
        kind: 'must',
        title: 'Stop unwanted contact',
        description: 'If someone declines, withdraws permission or stops responding, do not pursue them with repeated messages, calls or outreach on another platform.',
      },
      {
        id: 'B4',
        kind: 'must',
        title: 'Protect private conversations and data',
        description: 'Get permission before forwarding private messages, screenshots, phone numbers or personal details. If you need to report an incident, send only the relevant evidence privately to the organizers or administrators handling it.',
      },
    ],
  },
  {
    id: 'whatsapp',
    title: 'WhatsApp and opportunities',
    summary: 'Share useful opportunities and keep the group free of spam, pressure and fraud.',
    rules: [
      {
        id: 'C1',
        kind: 'etiquette',
        title: 'Post in the right place',
        description: 'Use the relevant group for useful resources, questions, jobs, collaborations and events. Keep messages on topic and avoid flooding the group, cross-posting repeatedly or forwarding chain messages.',
      },
      {
        id: 'C2',
        kind: 'etiquette',
        title: 'Make opportunities easy to assess',
        description: 'Explain who is offering the opportunity, who it is for and how to respond. Disclose your connection to it and any known cost or material conditions. A relevant job post can link to the application page so members can opt in themselves.',
      },
      {
        id: 'C3',
        kind: 'must',
        title: 'Keep commercial pressure out of the group',
        description: 'A relevant, occasional share with clear context is welcome. Repeated ads, aggressive selling and posts aimed at harvesting leads are prohibited. Check with a group admin before posting a campaign or recurring promotion.',
      },
      {
        id: 'C4',
        kind: 'must',
        title: 'Protect the group from fraud',
        description: 'Do not post scams, phishing or malicious links, deliberately misleading offers or impersonations. If something looks suspicious, flag it privately to an admin and avoid forwarding it.',
      },
    ],
  },
  {
    id: 'representation',
    title: 'Initiatives and representation',
    summary: 'Propose ideas freely and get approval before you act on behalf of the community.',
    rules: [
      {
        id: 'D1',
        kind: 'must',
        title: 'Speak in your own capacity',
        description: 'Membership lets you participate and propose ideas. Official roles and announcements are reserved for people authorized to act within a specific mandate. Identify personal projects and opinions as your own.',
      },
      {
        id: 'D2',
        kind: 'approval',
        title: 'Get approval before acting in our name',
        description: 'Discuss your idea with the founders and board leadership and get their explicit approval before planning with outside parties, organizing or announcing an event, workshop, program or project in Checkmate & Connect’s name. An informal conversation or silence does not grant approval.',
        example: 'Pitch your chess tournament to the founders and board before inviting a speaker or publishing it as a community event.',
      },
      {
        id: 'D3',
        kind: 'approval',
        title: 'Get approval to use our identity',
        description: 'Get approval from the founders and board leadership before using the name, logo or visual identity in anything that could look official or endorsed, including a WhatsApp group, social account, page, poster or campaign. Personal references should make the relationship clear.',
      },
      {
        id: 'D4',
        kind: 'approval',
        title: 'Refer partners and sponsors to the board',
        description: 'Get explicit authorization from the founders and board leadership before approaching speakers, companies, institutions or sponsors as a representative, or negotiating, promising or announcing a partnership. If someone approaches you, offer to put them in touch with the team.',
      },
      {
        id: 'D5',
        kind: 'approval',
        title: 'Get approval before handling money in our name',
        description: 'Get prior approval from the founders and board leadership before selling tickets, collecting donations or fees, requesting contributions or making financial commitments in the community’s name.',
      },
      {
        id: 'D6',
        kind: 'etiquette',
        title: 'Propose ideas and collaborate',
        description: 'Share ideas for speakers, meetups or projects with the organizers. Members can collaborate independently in their own names while respecting each other’s consent, privacy and boundaries.',
      },
    ],
  },
  {
    id: 'events',
    title: 'Events and photography',
    summary: 'Take part considerately and know how event photography is handled.',
    rules: [
      {
        id: 'E1',
        kind: 'etiquette',
        title: 'Help events run smoothly',
        description: 'Follow the instructions of hosts and facilitators. Respect speakers, schedules, shared equipment and venue rules. Make room for newcomers and avoid interrupting sessions or turning a conversation into a sales pitch.',
      },
      {
        id: 'E2',
        kind: 'info',
        title: 'Official event photos and videos',
        description: 'The organizing team may photograph or film events. The community may use this material in event recaps, on official social channels or in other community communications. If you have concerns about appearing in a photo or video, speak to the organizers before or during the event, or contact them afterward with the post details.',
      },
      {
        id: 'E3',
        kind: 'must',
        title: 'Ask before focusing on someone',
        description: 'If you take your own photos or video, ask before taking a close-up or publishing identifiable content centered on another participant. Follow event-specific instructions. Do not use recordings or images to embarrass, harass, misrepresent or exploit people.',
      },
      {
        id: 'E4',
        kind: 'must',
        title: 'Respect private sessions',
        description: 'If a host marks a session or discussion as private, follow the announced sharing rules. Get permission before publishing private remarks, slides or unpublished project details.',
      },
    ],
  },
  {
    id: 'moderation',
    title: 'Reporting and moderation',
    summary: 'Know whom to contact and what the team can do when someone crosses a line.',
    rules: [
      {
        id: 'F1',
        kind: 'info',
        title: 'Know who is responsible',
        description: 'The founders and board set the community’s direction and decide who can represent it. Designated organizers and administrators run events and moderate community spaces. Members are responsible for following the guidelines and respecting moderation decisions.',
      },
      {
        id: 'F2',
        kind: 'info',
        title: 'Report a concern privately',
        description: 'Speak to a designated organizer at the event, contact a WhatsApp admin privately or use the reporting contact below when available. You can report something you experienced or witnessed. Share what happened, when and where, and any relevant evidence you feel comfortable providing. If the concern involves an admin or organizer, contact a different admin or a founder or board member.',
      },
      {
        id: 'F3',
        kind: 'must',
        title: 'Protect people who raise concerns',
        description: 'Do not retaliate against anyone who reports a concern in good faith or helps review it. The team should limit access to reports to those who need the information to assess and respond. Keep the discussion out of public chats.',
      },
      {
        id: 'F4',
        kind: 'info',
        title: 'Understand what happens after a report',
        description: 'The team assesses the facts, severity and any pattern of behavior. It may clarify a rule, remove a post, issue a warning, limit participation or remove someone from the group or an event. A serious incident may require immediate action. You can ask a founder or board member who was not involved in the decision to review it.',
      },
      {
        id: 'F5',
        kind: 'info',
        title: 'Follow the current guidelines',
        description: 'The founders and board may update these guidelines as the community develops. Use the current published version and ask an organizer or admin if a rule is unclear.',
      },
    ],
  },
];

/** The three rules to read even if you read nothing else. Each links to its chapter. */
export const priorities = [
  { title: 'Ask before reaching out privately', body: 'Get someone’s explicit permission before using contact details found through the community to message or call them.', chapter: 'privacy' },
  { title: 'Get approval to act in our name', body: 'Discuss any initiative in the community’s name with the founders and board leadership. Wait for explicit approval before organizing, announcing or making commitments.', chapter: 'representation' },
  { title: 'Events may be photographed or filmed', body: 'The organizing team may use event images in recaps and official communications. Tell an organizer if you have a concern about appearing.', chapter: 'events' },
] as const;
