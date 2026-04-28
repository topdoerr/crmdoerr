"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getInitials } from "@/lib/utils";
import { toggleLike, addComment, deletePost, deleteComment } from "./actions";

interface Comment {
  id: number;
  staffId: number;
  content: string;
  createdAt: Date;
}

interface Like {
  id: number;
  staffId: number;
}

interface PostCardProps {
  post: {
    id: number;
    staffId: number;
    content: string;
    createdAt: Date;
    comments: Comment[];
    likes: Like[];
  };
  currentStaffId: number;
  staffMap: Record<number, string>;
}

function timeAgo(date: Date) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export function PostCard({ post, currentStaffId, staffMap }: PostCardProps) {
  const router = useRouter();
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const isLiked = post.likes.some((l) => l.staffId === currentStaffId);
  const authorName = staffMap[post.staffId] || "Unknown";

  async function handleLike() {
    await toggleLike(post.id, currentStaffId);
    router.refresh();
  }

  async function handleComment(e: React.FormEvent) {
    e.preventDefault();
    if (!commentText.trim()) return;
    setSubmitting(true);
    await addComment(post.id, currentStaffId, commentText);
    setCommentText("");
    setSubmitting(false);
    router.refresh();
  }

  async function handleDeletePost() {
    await deletePost(post.id);
    router.refresh();
  }

  async function handleDeleteComment(commentId: number) {
    await deleteComment(commentId);
    router.refresh();
  }

  return (
    <Card>
      <CardContent className="pt-5">
        <div className="flex items-start gap-3">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="text-xs">
              {getInitials(authorName)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">{authorName}</span>
              <span className="text-xs text-muted-foreground">
                {timeAgo(post.createdAt)}
              </span>
              {post.staffId === currentStaffId && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-auto h-6 text-xs text-muted-foreground"
                  onClick={handleDeletePost}
                >
                  Delete
                </Button>
              )}
            </div>
            <p className="text-sm mt-1 whitespace-pre-wrap">{post.content}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 mt-3 pl-12">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 gap-1 text-xs"
            onClick={handleLike}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill={isLiked ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth={2}
              className={`h-4 w-4 ${isLiked ? "text-red-500" : ""}`}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
              />
            </svg>
            {post.likes.length > 0 && post.likes.length}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 gap-1 text-xs"
            onClick={() => setShowComments(!showComments)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="h-4 w-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z"
              />
            </svg>
            {post.comments.length > 0 && post.comments.length}
          </Button>
        </div>

        {showComments && (
          <div className="mt-3 pl-12 space-y-3">
            <Separator />
            {post.comments.map((c) => (
              <div key={c.id} className="flex items-start gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="text-[10px]">
                    {getInitials(staffMap[c.staffId] || "?")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium">
                      {staffMap[c.staffId] || "Unknown"}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {timeAgo(c.createdAt)}
                    </span>
                    {c.staffId === currentStaffId && (
                      <button
                        onClick={() => handleDeleteComment(c.id)}
                        className="text-[10px] text-muted-foreground hover:text-destructive ml-auto"
                      >
                        delete
                      </button>
                    )}
                  </div>
                  <p className="text-xs mt-0.5">{c.content}</p>
                </div>
              </div>
            ))}
            <form onSubmit={handleComment} className="flex gap-2">
              <input
                className="flex-1 h-8 rounded-md border border-input bg-background px-2 text-xs ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="Write a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
              />
              <Button type="submit" size="sm" className="h-8" disabled={submitting}>
                Post
              </Button>
            </form>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
