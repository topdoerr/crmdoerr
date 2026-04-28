import Link from "next/link";
import prisma from "@/lib/prisma";
import { formatDate, formatFileSize } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { NewFolderForm, UploadDocumentForm } from "./document-form";
import { deleteFolder, deleteDocument } from "./actions";

const currentStaffId = 1;

export default async function DocumentsPage({
  searchParams,
}: {
  searchParams: { folder?: string };
}) {
  const folderId = searchParams.folder ? parseInt(searchParams.folder) : null;

  // Build breadcrumb
  const breadcrumbs: { id: number | null; name: string }[] = [
    { id: null, name: "Documents" },
  ];
  if (folderId) {
    const trail: { id: number; name: string }[] = [];
    let currentId: number | null = folderId;
    while (currentId) {
      const found: { id: number; name: string; parentId: number | null } | null =
        await prisma.documentFolder.findUnique({
          where: { id: currentId },
        });
      if (!found) break;
      trail.unshift({ id: found.id, name: found.name });
      currentId = found.parentId;
    }
    breadcrumbs.push(...trail);
  }

  const folders = await prisma.documentFolder.findMany({
    where: { parentId: folderId },
    orderBy: { name: "asc" },
  });

  const documents = await prisma.document.findMany({
    where: { folderId: folderId },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Documents</h1>
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
            {breadcrumbs.map((crumb, i) => (
              <span key={crumb.id ?? "root"} className="flex items-center gap-1">
                {i > 0 && <span>/</span>}
                {i < breadcrumbs.length - 1 ? (
                  <Link
                    href={crumb.id ? `/documents?folder=${crumb.id}` : "/documents"}
                    className="hover:underline text-primary"
                  >
                    {crumb.name}
                  </Link>
                ) : (
                  <span className="text-foreground font-medium">{crumb.name}</span>
                )}
              </span>
            ))}
          </nav>
        </div>
        <div className="flex gap-2">
          <NewFolderForm parentId={folderId ?? undefined} createdBy={currentStaffId} />
          <UploadDocumentForm folderId={folderId ?? undefined} uploadedBy={currentStaffId} />
        </div>
      </div>

      {/* Folders Grid */}
      {folders.length > 0 && (
        <div className="grid gap-4 md:grid-cols-4 lg:grid-cols-6">
          {folders.map((folder) => (
            <Link key={folder.id} href={`/documents?folder=${folder.id}`}>
              <Card className="hover:border-primary transition-colors cursor-pointer">
                <CardContent className="pt-6 flex flex-col items-center gap-2">
                  <svg
                    className="h-10 w-10 text-muted-foreground"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z"
                    />
                  </svg>
                  <span className="text-sm font-medium text-center truncate w-full">
                    {folder.name}
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Documents Table */}
      <Card>
        <CardHeader>
          <CardTitle>Files</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>File Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Version</TableHead>
                <TableHead>Uploaded</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    No documents in this folder.
                  </TableCell>
                </TableRow>
              ) : (
                documents.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <svg
                          className="h-4 w-4 text-muted-foreground shrink-0"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
                          />
                        </svg>
                        <span className="font-medium">{doc.title}</span>
                      </div>
                      {doc.description && (
                        <p className="text-xs text-muted-foreground mt-0.5 ml-6">
                          {doc.description}
                        </p>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">{doc.fileName}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{doc.fileType || "—"}</Badge>
                    </TableCell>
                    <TableCell>{formatFileSize(doc.fileSize)}</TableCell>
                    <TableCell>v{doc.version}</TableCell>
                    <TableCell>{formatDate(doc.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <form action={async () => {
                        "use server";
                        await deleteDocument(doc.id);
                      }}>
                        <button
                          type="submit"
                          className="text-sm text-destructive hover:underline"
                        >
                          Delete
                        </button>
                      </form>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
