export async function generateMetadata({ params }: { params: { sid: string } }) {
  return {
    title: `School Details - ${params.sid}`,
    description: 'School details page in the admin dashboard'
  };
}