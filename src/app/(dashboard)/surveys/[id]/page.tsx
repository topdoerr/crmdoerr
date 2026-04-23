import Link from "next/link";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import {
  addQuestion,
  deleteQuestion,
  updateSurvey,
} from "../actions";

export default async function SurveyDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const survey = await prisma.survey.findUnique({
    where: { id: Number(params.id) },
    include: {
      questions: {
        orderBy: { questionOrder: "asc" },
      },
    },
  });

  if (!survey) notFound();

  const updateAction = updateSurvey.bind(null, survey.id);
  const addQuestionAction = addQuestion.bind(null, survey.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/surveys">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight">{survey.name}</h1>
          <Badge variant={survey.active === 1 ? "success" : "secondary"}>
            {survey.active === 1 ? "Active" : "Inactive"}
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Questions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {survey.questions.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No questions yet. Add your first question below.
              </p>
            ) : (
              <div className="space-y-2">
                {survey.questions.map((q, i) => (
                  <div
                    key={q.id}
                    className="flex items-start gap-3 rounded-md border p-3"
                  >
                    <span className="text-sm font-medium text-muted-foreground">
                      {i + 1}.
                    </span>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">{q.question}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant="outline">{q.questionType}</Badge>
                        {q.required === 1 && (
                          <Badge variant="secondary">Required</Badge>
                        )}
                      </div>
                    </div>
                    <form action={deleteQuestion.bind(null, q.id)}>
                      <Button type="submit" variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </form>
                  </div>
                ))}
              </div>
            )}

            <form action={addQuestionAction} className="space-y-3 pt-4 border-t">
              <div className="space-y-2">
                <Label>Question</Label>
                <Input name="question" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select name="questionType" defaultValue="text">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Short Text</SelectItem>
                      <SelectItem value="textarea">Long Text</SelectItem>
                      <SelectItem value="radio">Radio (single)</SelectItem>
                      <SelectItem value="checkbox">Checkbox (multi)</SelectItem>
                      <SelectItem value="input">Input (open)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end gap-2">
                  <div className="flex items-center gap-2 h-10">
                    <Checkbox id="required" name="required" value="1" />
                    <Label htmlFor="required">Required</Label>
                  </div>
                </div>
              </div>
              <Button type="submit" size="sm">
                <Plus className="h-4 w-4 mr-1" /> Add Question
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Survey Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={updateAction} className="space-y-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input name="name" defaultValue={survey.name} />
              </div>
              <div className="space-y-2">
                <Label>Subject</Label>
                <Input name="subject" defaultValue={survey.subject ?? ""} />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <textarea
                  name="description"
                  rows={3}
                  defaultValue={survey.description ?? ""}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="active2"
                    name="active"
                    value="1"
                    defaultChecked={survey.active === 1}
                  />
                  <Label htmlFor="active2">Active</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="forStaff2"
                    name="forStaff"
                    value="1"
                    defaultChecked={survey.forStaff === 1}
                  />
                  <Label htmlFor="forStaff2">For staff</Label>
                </div>
              </div>
              <Button type="submit" className="w-full">Save</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
