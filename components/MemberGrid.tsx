/**
 * @deprecated This component has been replaced by TeamSection (using shadcn/ui patterns).
 * Will be removed after successful deployment. Use TeamSection instead.
 */
import MemberCard from './MemberCard';

type Member = {
  _id: string;
  name: string;
  slug: { current: string };
  photo: any;
  jobTitle: string;
  company?: string;
  linkedIn?: string;
};

type MemberGridProps = {
  members: Member[];
};

export default function MemberGrid({ members }: MemberGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {members.map((member) => (
        <MemberCard key={member._id} member={member} />
      ))}
    </div>
  );
}
