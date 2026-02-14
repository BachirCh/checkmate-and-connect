import { Metadata } from 'next';
import { RecaptchaProvider } from '@/components/RecaptchaProvider';
import MemberSubmissionForm from '@/components/forms/MemberSubmissionForm';

export const metadata: Metadata = {
  title: 'Join the Directory | Checkmate & Connect',
  description: 'Apply to join the Checkmate & Connect member directory. Share your profile with 200+ chess and entrepreneurship enthusiasts in Casablanca.',
};

export default function JoinPage() {
  return (
    <RecaptchaProvider>
      <main className="min-h-screen bg-black text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">
              Join Our Member Directory
            </h1>
            <p className="text-lg text-gray-400">
              Apply to be featured in the Checkmate & Connect member directory.
              Share your profile with our community of chess players and entrepreneurs.
            </p>
          </div>

          <MemberSubmissionForm />
        </div>
      </main>
    </RecaptchaProvider>
  );
}
