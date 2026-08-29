import { Icon, type IconName } from '@/components/ui/Icon';

/**
 * "What happens here" — the five reasons to show up.
 *
 * Full-bleed by design: the cells span the whole 1440 artboard with no page
 * gutter, and the rules between them bleed past the edge. The Figma header
 * above this grid is hidden on the artboard, so there is deliberately no
 * heading here.
 *
 * Layout is 3-up then 2-up centred on desktop, collapsing to a single column
 * on phones where side-by-side cells would leave a 2-word measure.
 */

type Feature = {
  icon: IconName;
  title: string;
  detail: string;
};

const FEATURES: Feature[] = [
  {
    icon: 'users-three',
    title: 'Networking opportunities',
    detail: 'founders, investors and builders in one room',
  },
  {
    icon: 'microphone-stage',
    title: 'Talks and workshops',
    detail: 'practical sessions from people who did it',
  },
  {
    icon: 'puzzle-piece',
    title: 'Games and fun',
    detail: 'chess boards and ice breakers on every table',
  },
  {
    icon: 'handshake',
    title: 'Mutual respect',
    detail: 'an open room where everyone is welcome',
  },
  {
    icon: 'share-network',
    title: 'Connecting talents and entrepreneurs',
    detail: 'talent and founders in the same conversation',
  },
];

function Cell({ feature }: { feature: Feature }) {
  return (
    <li className="flex flex-col items-center px-6 pb-14 pt-10 text-center">
      <span className="grid h-16 w-16 place-items-center text-ink">
        <Icon name={feature.icon} size={40} />
      </span>
      <h3 className="mt-[30px] max-w-[440px] text-feature font-semibold text-ink">
        {feature.title}
      </h3>
      <p className="mt-2 max-w-[440px] text-feature text-muted">{feature.detail}</p>
    </li>
  );
}

export default function Features() {
  const [first, second, third, fourth, fifth] = FEATURES;

  return (
    <section className="py-16" aria-label="What happens at Checkmate & Connect">
      <ul className="grid divide-y divide-line lg:grid-cols-3 lg:divide-y-0 lg:[&>li:not(:last-child)]:border-r lg:[&>li]:border-line">
        <Cell feature={first} />
        <Cell feature={second} />
        <Cell feature={third} />
      </ul>

      <div className="h-px w-full bg-line" />

      <ul className="mx-auto grid divide-y divide-line lg:w-2/3 lg:grid-cols-2 lg:divide-y-0 lg:[&>li:not(:last-child)]:border-r lg:[&>li]:border-line">
        <Cell feature={fourth} />
        <Cell feature={fifth} />
      </ul>
    </section>
  );
}
