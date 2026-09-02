import type { Metadata } from 'next';
import { MemberGrid, type DirectoryMember } from '@/components/members/MemberGrid';
import { ButtonLink } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { DepthText } from '@/components/ui/DepthText';
import { PageHeader } from '@/components/ui/PageHeader';
import { JsonLd } from '@/components/seo/JsonLd';
import { client } from '@/lib/sanity/client';
import { site } from '@/lib/site';

export const revalidate = 86400;

const title = 'Members';
const description =
  'Founders, investors, engineers and designers who show up on Wednesdays in Casablanca. Browse the Checkmate & Connect member directory.';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: '/members' },
  openGraph: {
    title: `${title} | ${site.name}`,
    description,
    url: `${site.url}/members`,
    type: 'website',
  },
};

export default async function MembersPage() {
  // The status filter is a privacy control, not a display preference: members
  // opt in through /join and only appear once an organiser approves them.
  const members: DirectoryMember[] = await client.fetch(
    `*[_type == "member" && status == "approved"] | order(approvedAt desc) {
      _id, name, photo, jobTitle, role, company, linkedIn
    }`
  );

  const count = members.length;

  return (
    <>
      <JsonLd
        graphs={[
          {
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: `${title} | ${site.name}`,
            description,
            url: `${site.url}/members`,
            isPartOf: { '@id': `${site.url}/#organization` },
            ...(count > 0 && {
              mainEntity: {
                '@type': 'ItemList',
                numberOfItems: count,
                itemListElement: members.slice(0, 50).map((m, i) => ({
                  '@type': 'ListItem',
                  position: i + 1,
                  item: {
                    '@type': 'Person',
                    name: m.name,
                    jobTitle: m.jobTitle,
                    ...(m.company && { worksFor: { '@type': 'Organization', name: m.company } }),
                    ...(m.linkedIn && { sameAs: [m.linkedIn] }),
                  },
                })),
              },
            }),
          },
        ]}
      />

      <main>
        <PageHeader
          eyebrow="The community"
          title={
            <>
              The people who took the <DepthText text="move" className="italic" />
            </>
          }
          lead="Join our next event to be findable by founders, entrepreneurs, next-gen startups and established companies."
        >
          <div className="mt-10">
            <ButtonLink href="/join">Add yourself</ButtonLink>
          </div>
        </PageHeader>

        <section className="pb-24">
          <Container>
            {count > 0 ? (
              <MemberGrid members={members} />
            ) : (
              <div className="rounded-card border border-line bg-surface px-6 py-16 text-center md:px-20">
                <h2 className="font-display text-[clamp(24px,3.5vw,32px)] font-bold tracking-[-0.02em]">
                  Nobody listed yet.
                </h2>
                <p className="mx-auto mt-4 max-w-[520px] text-body text-secondary">
                  The directory fills up as people add themselves. It takes a
                  minute and an organiser reviews each one.
                </p>
                <div className="mt-8 flex justify-center">
                  <ButtonLink href="/join">Add yourself</ButtonLink>
                </div>
              </div>
            )}
          </Container>
        </section>
      </main>
    </>
  );
}
