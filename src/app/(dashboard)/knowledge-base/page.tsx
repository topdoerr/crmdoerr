import Link from "next/link";
import prisma from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArticleForm } from "./article-form";

export default async function KnowledgeBasePage({
  searchParams,
}: {
  searchParams?: { q?: string };
}) {
  const query = (searchParams?.q ?? "").trim();

  const [groups, allArticles, matchingArticles] = await Promise.all([
    prisma.knowledgeBaseGroup.findMany({
      where: { active: 1 },
      orderBy: [{ groupOrder: "asc" }, { name: "asc" }],
    }),
    prisma.knowledgeBaseArticle.groupBy({
      by: ["groupId"],
      _count: { id: true },
      where: { active: 1 },
    }),
    query
      ? prisma.knowledgeBaseArticle.findMany({
          where: {
            active: 1,
            OR: [
              { subject: { contains: query } },
              { description: { contains: query } },
            ],
          },
          orderBy: { datecreated: "desc" },
          take: 50,
        })
      : Promise.resolve([] as any[]),
  ]);

  const countsByGroup = new Map<number | null, number>();
  for (const row of allArticles) {
    countsByGroup.set(row.groupId ?? null, row._count.id);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight">Knowledge Base</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/knowledge-base/groups">Manage Groups</Link>
          </Button>
          <ArticleForm groups={groups.map((g) => ({ id: g.id, name: g.name }))} />
        </div>
      </div>

      <form>
        <Input
          type="search"
          name="q"
          placeholder="Search articles…"
          defaultValue={query}
        />
      </form>

      {query ? (
        <Card>
          <CardHeader className="pb-2">
            <h2 className="text-lg font-semibold">
              Search Results ({matchingArticles.length})
            </h2>
          </CardHeader>
          <CardContent>
            {matchingArticles.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No articles matched “{query}”.
              </p>
            ) : (
              <ul className="space-y-2">
                {matchingArticles.map((a) => (
                  <li key={a.id}>
                    <Link
                      href={`/knowledge-base/${a.slug}`}
                      className="hover:underline font-medium"
                    >
                      {a.subject}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {groups.length === 0 ? (
          <Card className="md:col-span-2 lg:col-span-3">
            <CardContent className="pt-6 text-center text-muted-foreground">
              No groups yet.{" "}
              <Link
                href="/knowledge-base/groups"
                className="underline"
              >
                Create one
              </Link>
              .
            </CardContent>
          </Card>
        ) : (
          groups.map((g) => (
            <Card key={g.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: g.color ?? "#2a88d5" }}
                    />
                    <h3 className="font-semibold">{g.name}</h3>
                  </div>
                  <Badge variant="secondary">
                    {countsByGroup.get(g.id) ?? 0}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {g.description ? (
                  <p className="text-sm text-muted-foreground mb-3">
                    {g.description}
                  </p>
                ) : null}
                <GroupArticles groupId={g.id} />
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

async function GroupArticles({ groupId }: { groupId: number }) {
  const articles = await prisma.knowledgeBaseArticle.findMany({
    where: { groupId, active: 1 },
    orderBy: { datecreated: "desc" },
    take: 8,
  });

  if (articles.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No articles in this group.</p>
    );
  }

  return (
    <ul className="space-y-1 text-sm">
      {articles.map((a) => (
        <li key={a.id}>
          <Link
            href={`/knowledge-base/${a.slug}`}
            className="hover:underline"
          >
            {a.subject}
          </Link>
        </li>
      ))}
    </ul>
  );
}
