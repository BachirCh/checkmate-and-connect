import Link from 'next/link';
import { Logo } from '@/components/brand/Logo';
import { Container } from '@/components/ui/Container';
import { Icon } from '@/components/ui/Icon';
import { site } from '@/lib/site';

const COLUMNS = [
  {
    heading: 'Community',
    links: [
      { label: 'About', href: '/about' },
      { label: 'Members', href: '/members' },
      { label: 'Join the directory', href: '/join' },
    ],
  },
  {
    heading: 'Follow',
    links: [
      { label: 'LinkedIn', href: site.social.linkedin },
      { label: 'Instagram', href: site.social.instagram },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="pb-16 pt-0">
      <Container>
        <div className="h-px w-full bg-hairline" />

        <div className="flex flex-col gap-12 pt-12 md:flex-row md:justify-between">
          <div>
            <Logo size={22.18} />
            <p className="mt-5 text-ui text-muted">{site.tagline}</p>
          </div>

          <div className="flex gap-16 md:gap-20">
            {COLUMNS.map((column) => (
              <nav key={column.heading} aria-label={column.heading}>
                <h2 className="font-sans text-eyebrow font-semibold uppercase text-faint">
                  {column.heading}
                </h2>
                <ul className="mt-6 flex flex-col gap-4">
                  {column.links.map((link) => {
                    const external = link.href.startsWith('http');
                    return (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          className="text-ui text-secondary transition-colors hover:text-ink"
                          {...(external
                            ? { target: '_blank', rel: 'noopener noreferrer' }
                            : {})}
                        >
                          {link.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        <div className="mt-14 flex flex-col-reverse gap-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-micro text-faint">
            © {new Date().getFullYear()} {site.name} · Casablanca
          </p>
          <div className="flex gap-5">
            <SocialIcon
              href={site.social.linkedin}
              icon="linkedin-logo"
              label={`${site.name} on LinkedIn`}
            />
            <SocialIcon
              href={site.social.instagram}
              icon="instagram-logo"
              label={`${site.name} on Instagram`}
            />
          </div>
        </div>
      </Container>
    </footer>
  );
}

function SocialIcon({
  href,
  icon,
  label,
}: {
  href: string;
  icon: 'linkedin-logo' | 'instagram-logo';
  label: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-secondary transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lime rounded-badge"
    >
      <Icon name={icon} size={22} title={label} />
    </a>
  );
}
