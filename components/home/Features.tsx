import { Icon, type IconName } from '@/components/ui/Icon';

/**
 * "What happens here" — the five reasons to show up.
 *
 * Full-bleed by design: the cells span the whole 1440 artboard with no page
 * gutter, and the rules between them bleed past the edge. The Figma header
 * above this grid is hidden on the artboard, so there is deliberately no
 * heading here.
 *
 * Layout is 3-up then 2-up centred on desktop, and 2-up on phones. Five is odd,
 * so the third cell spans the full width below lg rather than leaving a hole
 * beside it.
 *
 * The rules between cells are the grid's own 1px gaps showing the track colour
 * through, not borders on the cells. `divide-y` cannot do this — in a
 * multi-column grid it draws on DOM order rather than visual rows, so the cell
 * beside the first one picks up a stray top rule.
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
    icon: 'chess-pawn',
    title: 'Chess games and fun',
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

function Cell({ feature, className }: { feature: Feature; className?: string }) {
  return (
    <li
      className={`flex flex-col items-center bg-surface px-6 pb-14 pt-10 text-center ${className ?? ''}`}
    >
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
    <section
      className="bg-surface py-16"
      aria-label="What happens at Checkmate & Connect"
    >
      <ul className="grid grid-cols-2 gap-px bg-line lg:grid-cols-3">
        <Cell feature={first} />
        <Cell feature={second} />
        <Cell feature={third} className="col-span-2 lg:col-span-1" />
      </ul>

      <div className="h-px w-full bg-line" />

      <ul className="mx-auto grid grid-cols-2 gap-px bg-line lg:w-2/3">
        <Cell feature={fourth} />
        <Cell feature={fifth} />
      </ul>
    </section>
  );
}
