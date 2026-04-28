import prisma from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { PostCard } from "./post-card";
import { NewPostForm } from "./new-post-form";

const CURRENT_STAFF_ID = 1;

export default async function FeedPage() {
  const posts = await prisma.newsFeedPost.findMany({
    include: { comments: true, likes: true },
    orderBy: { createdAt: "desc" },
  });

  // Gather all unique staff IDs from posts, comments, and likes
  const staffIds = new Set<number>();
  posts.forEach((p) => {
    staffIds.add(p.staffId);
    p.comments.forEach((c) => staffIds.add(c.staffId));
    p.likes.forEach((l) => staffIds.add(l.staffId));
  });

  const staffList = await prisma.staff.findMany({
    where: { staffid: { in: [...staffIds] } },
  });
  const staffMap: Record<number, string> = {};
  staffList.forEach((s) => {
    staffMap[s.staffid] = `${s.firstName} ${s.lastName}`;
  });

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-3xl font-bold tracking-tight">News Feed</h1>

      <Card>
        <CardContent className="pt-5">
          <NewPostForm currentStaffId={CURRENT_STAFF_ID} />
        </CardContent>
      </Card>

      <div className="space-y-4">
        {posts.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No posts yet. Be the first to share something!
          </p>
        ) : (
          posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              currentStaffId={CURRENT_STAFF_ID}
              staffMap={staffMap}
            />
          ))
        )}
      </div>
    </div>
  );
}
