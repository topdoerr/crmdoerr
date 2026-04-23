import Link from "next/link";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { incrementViews } from "../actions";

export default async function KnowledgeBaseArticlePage({
  params,
}: {
  params: { slug: string };
}) {
  const article = await prisma.knowledgeBaseArticle.findUnique({
    where: { slug: params.slug },
    include: { group: true },
  });

  if (!article || !article.active) notFound();

  // Fire-and-forget view increment
  try {
    await incrementViews(article.id);
  } catch {
    // ignore
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        {article.group ? (
          <Link
            href={`/knowledge-base#group-${article.group.id}`}
            className="text-sm text-muted-foreground hover:underline"
          >
            ← Back to {article.group.name}
          </Link>
        ) : (
          <Link
            href="/knowledge-base"
            className="text-sm text-muted-foreground hover:underline"
          >
            ← Back to Knowledge Base
          </Link>
        )}
      </div>

      <div className="flex items-start justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">{article.subject}</h1>
        <div className="flex gap-2 shrink-0">
          {article.staffArticle ? (
            <Badge variant="outline">Staff</Badge>
          ) : null}
          {article.group ? (
            <Badge
              style={{
                backgroundColor: article.group.color ?? "#2a88d5",
                color: "white",
              }}
            >
              {article.group.name}
            </Badge>
          ) : null}
        </div>
      </div>

      <div className="text-sm text-muted-foreground">
        {formatDate(article.datecreated)} · {article.views + 1} views
      </div>

      <Card>
        <CardContent className="pt-6">
          <div
            className="prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: article.description }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
