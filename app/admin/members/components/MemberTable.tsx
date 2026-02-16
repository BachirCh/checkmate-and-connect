import MemberRow from './MemberRow';

type Member = {
  _id: string;
  name: string;
  slug: { current: string };
  photo: any;
  jobTitle: string;
  company?: string;
  linkedIn?: string;
  status: string;
  submittedAt: string;
  approvedAt?: string;
};

type MemberTableProps = {
  members: Member[];
  status: string;
};

export default function MemberTable({ members, status }: MemberTableProps) {
  if (members.length === 0) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 text-center">
        <p className="text-gray-400">No {status} members found</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-950 border-b border-gray-800">
          <tr>
            <th className="text-left p-4 text-sm font-medium text-gray-400">Photo</th>
            <th className="text-left p-4 text-sm font-medium text-gray-400">Name/Title</th>
            <th className="text-left p-4 text-sm font-medium text-gray-400">Company</th>
            <th className="text-left p-4 text-sm font-medium text-gray-400">Submitted</th>
            <th className="text-left p-4 text-sm font-medium text-gray-400">Actions</th>
          </tr>
        </thead>
        <tbody>
          {members.map((member) => (
            <MemberRow key={member._id} member={member} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
