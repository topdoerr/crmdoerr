import prisma from "@/lib/prisma";
import Link from "next/link";
import { Download } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DeleteFileButton } from "./delete-file-button";

interface FileListProps {
  relType: string;
  relId: number;
}

function formatBytes(bytes: number | null) {
  if (!bytes) return "—";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

export async function FileList({ relType, relId }: FileListProps) {
  const files = await prisma.fileAttachment.findMany({
    where: { relType, relId },
    orderBy: { dateAdded: "desc" },
  });

  const staffIds = Array.from(
    new Set(files.map((f) => f.staffId).filter((s): s is number => !!s))
  );
  const staff = staffIds.length
    ? await prisma.staff.findMany({
        where: { staffid: { in: staffIds } },
        select: { staffid: true, firstName: true, lastName: true },
      })
    : [];
  const staffMap = new Map(staff.map((s) => [s.staffid, s]));

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>File</TableHead>
          <TableHead>Size</TableHead>
          <TableHead>Uploaded By</TableHead>
          <TableHead>Date</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {files.length === 0 ? (
          <TableRow>
            <TableCell
              colSpan={5}
              className="text-center text-muted-foreground py-8"
            >
              No files uploaded.
            </TableCell>
          </TableRow>
        ) : (
          files.map((file) => {
            const uploader = file.staffId ? staffMap.get(file.staffId) : null;
            return (
              <TableRow key={file.id}>
                <TableCell className="font-medium">{file.fileName}</TableCell>
                <TableCell>{formatBytes(file.fileSize)}</TableCell>
                <TableCell>
                  {uploader
                    ? `${uploader.firstName} ${uploader.lastName}`
                    : "—"}
                </TableCell>
                <TableCell>{formatDate(file.dateAdded)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button asChild variant="outline" size="sm">
                      <Link href={file.filePath} download>
                        <Download className="h-4 w-4" />
                      </Link>
                    </Button>
                    <DeleteFileButton id={file.id} />
                  </div>
                </TableCell>
              </TableRow>
            );
          })
        )}
      </TableBody>
    </Table>
  );
}
