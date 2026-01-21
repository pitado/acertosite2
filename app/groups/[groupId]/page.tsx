// app/groups/[groupId]/page.tsx
import GroupPageClient from "./GroupPageClient";

export default function GroupPage({ params }: { params: { groupId: string } }) {
  return <GroupPageClient groupId={params.groupId} />;
}
