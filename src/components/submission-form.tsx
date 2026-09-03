"use client";

import { useActionState, useState } from "react";
import { saveSubmissionAction, type SubmissionActionState } from "@/app/submissions/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PRESENTATION_TYPE_LABELS, PRESENTATION_CATEGORY_LABELS } from "@/lib/labels";

type Track = { id: string; name: string };
type MaterialSystem = { id: string; name: string };
type ResearchTopic = { id: string; name: string };
type SecondaryTopic = { id: string; name: string };

type Author = {
  name: string;
  email: string;
  affiliation: string;
  isCorresponding: boolean;
};

type SubmissionFormValues = {
  id?: string;
  title: string;
  trackId: string;
  materialSystemId: string;
  primaryTopicId: string;
  secondaryTopicId: string;
  presentationType: "ORAL" | "POSTER";
  presentationCategory: "GENERAL" | "INVITED";
  submissionCode?: string | null;
  keywords: string[];
  authors: Author[];
  existingFileName?: string | null;
};

const emptyAuthor: Author = { name: "", email: "", affiliation: "", isCorresponding: false };

const initialState: SubmissionActionState = {};

export function SubmissionForm({
  tracks,
  materialSystems,
  primaryTopics,
  secondaryTopics,
  defaultValues,
}: {
  tracks: Track[];
  materialSystems: MaterialSystem[];
  primaryTopics: ResearchTopic[];
  secondaryTopics: SecondaryTopic[];
  defaultValues?: SubmissionFormValues;
}) {
  const [state, formAction, isPending] = useActionState(saveSubmissionAction, initialState);
  const [keywords, setKeywords] = useState<string[]>(defaultValues?.keywords ?? []);
  const [keywordInput, setKeywordInput] = useState("");
  const [authors, setAuthors] = useState<Author[]>(
    defaultValues?.authors && defaultValues.authors.length > 0
      ? defaultValues.authors
      : [{ ...emptyAuthor, isCorresponding: true }]
  );

  function addKeyword() {
    const value = keywordInput.trim();
    if (value && !keywords.includes(value) && keywords.length < 10) {
      setKeywords([...keywords, value]);
    }
    setKeywordInput("");
  }

  function removeKeyword(kw: string) {
    setKeywords(keywords.filter((k) => k !== kw));
  }

  function updateAuthor(index: number, patch: Partial<Author>) {
    setAuthors(authors.map((a, i) => (i === index ? { ...a, ...patch } : a)));
  }

  function addAuthor() {
    setAuthors([...authors, { ...emptyAuthor }]);
  }

  function removeAuthor(index: number) {
    setAuthors(authors.filter((_, i) => i !== index));
  }

  return (
    <form action={formAction} className="space-y-6">
      {defaultValues?.id && <input type="hidden" name="id" value={defaultValues.id} />}
      <input type="hidden" name="keywordsJson" value={JSON.stringify(keywords)} />
      <input type="hidden" name="authorsJson" value={JSON.stringify(authors)} />

      {state.message && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.message}
        </p>
      )}

      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" required maxLength={300} defaultValue={defaultValues?.title} />
        {state.errors?.title && (
          <p className="text-sm text-destructive">{state.errors.title[0]}</p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="trackId">Track</Label>
          <Select name="trackId" defaultValue={defaultValues?.trackId}>
            <SelectTrigger id="trackId" className="w-full">
              <SelectValue placeholder="Select a track">
                {(value: string | null) => tracks.find((t) => t.id === value)?.name ?? "Select a track"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {tracks.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {state.errors?.trackId && (
            <p className="text-sm text-destructive">{state.errors.trackId[0]}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="presentationType">Presentation Type</Label>
          <Select name="presentationType" defaultValue={defaultValues?.presentationType ?? "ORAL"}>
            <SelectTrigger id="presentationType" className="w-full">
              <SelectValue>
                {(value: keyof typeof PRESENTATION_TYPE_LABELS) => PRESENTATION_TYPE_LABELS[value]}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {Object.entries(PRESENTATION_TYPE_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="presentationCategory">Presentation Category</Label>
        {defaultValues?.submissionCode ? (
          <>
            <input
              type="hidden"
              name="presentationCategory"
              value={defaultValues.presentationCategory}
            />
            <p className="text-sm">
              {PRESENTATION_CATEGORY_LABELS[defaultValues.presentationCategory]}
            </p>
            <p className="text-xs text-muted-foreground">
              Locked — your submission ID ({defaultValues.submissionCode}) was already assigned
              based on this. Contact the Chair if it needs to change.
            </p>
          </>
        ) : (
          <>
            <Select
              name="presentationCategory"
              defaultValue={defaultValues?.presentationCategory ?? "GENERAL"}
            >
              <SelectTrigger id="presentationCategory" className="w-full">
                <SelectValue>
                  {(value: keyof typeof PRESENTATION_CATEGORY_LABELS) =>
                    PRESENTATION_CATEGORY_LABELS[value]
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {Object.entries(PRESENTATION_CATEGORY_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Only select Invited if the Chair has invited you to give this talk.
            </p>
          </>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="materialSystemId">Material System</Label>
          <Select name="materialSystemId" defaultValue={defaultValues?.materialSystemId}>
            <SelectTrigger id="materialSystemId" className="w-full">
              <SelectValue placeholder="Select a material system">
                {(value: string | null) =>
                  materialSystems.find((m) => m.id === value)?.name ?? "Select a material system"
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {materialSystems.map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  {m.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {state.errors?.materialSystemId && (
            <p className="text-sm text-destructive">{state.errors.materialSystemId[0]}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="primaryTopicId">Primary Research Topic</Label>
          <Select name="primaryTopicId" defaultValue={defaultValues?.primaryTopicId}>
            <SelectTrigger id="primaryTopicId" className="w-full">
              <SelectValue placeholder="Select a primary topic">
                {(value: string | null) =>
                  primaryTopics.find((t) => t.id === value)?.name ?? "Select a primary topic"
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {primaryTopics.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {state.errors?.primaryTopicId && (
            <p className="text-sm text-destructive">{state.errors.primaryTopicId[0]}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="secondaryTopicId">Secondary Research Topic (optional)</Label>
        <Select name="secondaryTopicId" defaultValue={defaultValues?.secondaryTopicId || undefined}>
          <SelectTrigger id="secondaryTopicId" className="w-full">
            <SelectValue placeholder="None">
              {(value: string | null) => secondaryTopics.find((t) => t.id === value)?.name ?? "None"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {secondaryTopics.map((t) => (
              <SelectItem key={t.id} value={t.id}>
                {t.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="abstractFile">Abstract PDF</Label>
        {defaultValues?.existingFileName && (
          <p className="text-sm text-muted-foreground">
            Current file: <span className="font-medium">{defaultValues.existingFileName}</span>.
            Upload a new file to replace it.
          </p>
        )}
        <Input id="abstractFile" name="abstractFile" type="file" accept="application/pdf" />
        <p className="text-xs text-muted-foreground">PDF only, up to 10MB.</p>
        {state.errors?.abstractFile && (
          <p className="text-sm text-destructive">{state.errors.abstractFile[0]}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="keywordInput">Keywords (up to 10)</Label>
        <div className="flex gap-2">
          <Input
            id="keywordInput"
            value={keywordInput}
            onChange={(e) => setKeywordInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addKeyword();
              }
            }}
            placeholder="Type a keyword and press Enter"
          />
          <Button type="button" variant="outline" onClick={addKeyword}>
            Add
          </Button>
        </div>
        {keywords.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {keywords.map((kw) => (
              <Badge key={kw} variant="secondary" className="gap-1">
                {kw}
                <button
                  type="button"
                  onClick={() => removeKeyword(kw)}
                  className="ml-1 text-muted-foreground hover:text-foreground"
                  aria-label={`Remove ${kw}`}
                >
                  ×
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Authors</Label>
          <Button type="button" variant="outline" size="sm" onClick={addAuthor}>
            + Add Author
          </Button>
        </div>
        {state.errors?.authors && (
          <p className="text-sm text-destructive">{state.errors.authors[0]}</p>
        )}
        <div className="space-y-3">
          {authors.map((author, index) => (
            <div key={index} className="grid gap-2 rounded-md border p-3 sm:grid-cols-[1fr_1fr_1fr_auto_auto]">
              <Input
                placeholder="Name"
                value={author.name}
                onChange={(e) => updateAuthor(index, { name: e.target.value })}
                required
              />
              <Input
                placeholder="Email"
                type="email"
                value={author.email}
                onChange={(e) => updateAuthor(index, { email: e.target.value })}
                required
              />
              <Input
                placeholder="Affiliation"
                value={author.affiliation}
                onChange={(e) => updateAuthor(index, { affiliation: e.target.value })}
              />
              <label className="flex items-center gap-2 whitespace-nowrap px-2 text-sm">
                <Checkbox
                  checked={author.isCorresponding}
                  onCheckedChange={(checked) =>
                    updateAuthor(index, { isCorresponding: checked === true })
                  }
                />
                Corresponding
              </label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={authors.length <= 1}
                onClick={() => removeAuthor(index)}
              >
                Remove
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" name="intent" value="draft" variant="outline" disabled={isPending}>
          Save Draft
        </Button>
        <Button type="submit" name="intent" value="submit" disabled={isPending}>
          Submit
        </Button>
      </div>
    </form>
  );
}
