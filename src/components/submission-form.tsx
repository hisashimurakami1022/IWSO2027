"use client";

import { useActionState, useRef, useState } from "react";
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
import { PRESENTATION_TYPE_LABELS } from "@/lib/labels";

type Track = { id: string; name: string; studentAward: boolean };
type MaterialSystem = { id: string; name: string };
type ResearchTopic = { id: string; name: string };
type SecondaryTopic = { id: string; name: string };

// `affiliationIndexes` are 1-based positions into `affiliations`.
type Author = {
  name: string;
  email: string;
  affiliationIndexes: number[];
  isPresenter: boolean;
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
  affiliations: string[];
  authors: Author[];
  studentAwardApplied: boolean;
  supervisorName: string;
  supervisorEmail: string;
  existingFileName?: string | null;
};

// Affiliations are held with a stable local key so rows can be reordered or
// removed without disturbing which author points at which institution; the
// key -> 1-based-position mapping is resolved only at submit time.
type AffiliationEntry = { key: string; name: string };
type AuthorRow = {
  name: string;
  email: string;
  affiliationKeys: string[];
  isPresenter: boolean;
};

function buildInitialState(defaultValues?: SubmissionFormValues) {
  // Always start with at least one affiliation row visible (like Authors),
  // so submitters don't miss the field. Blank rows are dropped on submit.
  const names = defaultValues?.affiliations?.length ? defaultValues.affiliations : [""];
  const affiliations: AffiliationEntry[] = names.map((name, i) => ({
    key: `aff-${i}`,
    name,
  }));
  const source =
    defaultValues?.authors && defaultValues.authors.length > 0
      ? defaultValues.authors
      : [{ name: "", email: "", affiliationIndexes: [], isPresenter: true }];
  const authors: AuthorRow[] = source.map((a) => ({
    name: a.name,
    email: a.email,
    isPresenter: a.isPresenter,
    affiliationKeys: a.affiliationIndexes
      .filter((n) => n >= 1 && n <= affiliations.length)
      .map((n) => affiliations[n - 1].key),
  }));
  return { affiliations, authors, nextKey: affiliations.length };
}

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
  const [initial] = useState(() => buildInitialState(defaultValues));
  const [affiliations, setAffiliations] = useState<AffiliationEntry[]>(initial.affiliations);
  const [authors, setAuthors] = useState<AuthorRow[]>(initial.authors);
  const nextKey = useRef(initial.nextKey);
  const [trackId, setTrackId] = useState(defaultValues?.trackId ?? "");
  const [studentAwardApplied, setStudentAwardApplied] = useState(
    defaultValues?.studentAwardApplied ?? false
  );
  const [supervisorName, setSupervisorName] = useState(defaultValues?.supervisorName ?? "");
  const [supervisorEmail, setSupervisorEmail] = useState(defaultValues?.supervisorEmail ?? "");

  const studentAwardTrack = tracks.find((t) => t.id === trackId)?.studentAward ?? false;

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

  function addAffiliation() {
    setAffiliations((prev) => [...prev, { key: `aff-${nextKey.current++}`, name: "" }]);
  }

  function updateAffiliation(key: string, name: string) {
    setAffiliations((prev) => prev.map((a) => (a.key === key ? { ...a, name } : a)));
  }

  function removeAffiliation(key: string) {
    setAffiliations((prev) => prev.filter((a) => a.key !== key));
    setAuthors((prev) =>
      prev.map((a) => ({ ...a, affiliationKeys: a.affiliationKeys.filter((k) => k !== key) }))
    );
  }

  function moveAffiliation(index: number, dir: -1 | 1) {
    setAffiliations((prev) => {
      const j = index + dir;
      if (j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[j]] = [next[j], next[index]];
      return next;
    });
  }

  function updateAuthor(index: number, patch: Partial<AuthorRow>) {
    setAuthors((prev) => prev.map((a, i) => (i === index ? { ...a, ...patch } : a)));
  }

  function toggleAuthorAffiliation(index: number, key: string, on: boolean) {
    setAuthors((prev) =>
      prev.map((a, i) => {
        if (i !== index) return a;
        const keep = new Set(a.affiliationKeys);
        if (on) keep.add(key);
        else keep.delete(key);
        // Store keys in affiliation-list order so byline markers read 1,2,3.
        return { ...a, affiliationKeys: affiliations.filter((e) => keep.has(e.key)).map((e) => e.key) };
      })
    );
  }

  function addAuthor() {
    setAuthors((prev) => [
      ...prev,
      { name: "", email: "", affiliationKeys: [], isPresenter: false },
    ]);
  }

  function removeAuthor(index: number) {
    setAuthors((prev) => prev.filter((_, i) => i !== index));
  }

  // Derived submit payload: drop blank affiliation rows, renumber the rest
  // 1..N, and translate each author's keys into those numbers.
  const keyToNumber = new Map<string, number>();
  const cleanAffiliations: string[] = [];
  for (const entry of affiliations) {
    const name = entry.name.trim();
    if (!name) continue;
    cleanAffiliations.push(name);
    keyToNumber.set(entry.key, cleanAffiliations.length);
  }
  const authorsPayload = authors.map((a) => ({
    name: a.name,
    email: a.email,
    isPresenter: a.isPresenter,
    affiliationIndexes: a.affiliationKeys
      .map((k) => keyToNumber.get(k))
      .filter((n): n is number => typeof n === "number")
      .sort((x, y) => x - y),
  }));

  return (
    <form action={formAction} className="space-y-6">
      {defaultValues?.id && <input type="hidden" name="id" value={defaultValues.id} />}
      <input type="hidden" name="keywordsJson" value={JSON.stringify(keywords)} />
      <input type="hidden" name="affiliationsJson" value={JSON.stringify(cleanAffiliations)} />
      <input type="hidden" name="authorsJson" value={JSON.stringify(authorsPayload)} />

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
          <Label htmlFor="trackId">Presentation Category</Label>
          <Select
            name="trackId"
            value={trackId}
            onValueChange={(value) => setTrackId((value as string) ?? "")}
          >
            <SelectTrigger id="trackId" className="w-full">
              <SelectValue placeholder="Select a presentation category">
                {(value: string | null) =>
                  tracks.find((t) => t.id === value)?.name ?? "Select a presentation category"
                }
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

      {/* Presentation Category (GENERAL/INVITED) is chair-controlled, not
          author-facing — it duplicated the Track field above. The author's
          choice always starts as GENERAL; the Chair can mark a talk Invited
          from the admin submission page. */}
      <input
        type="hidden"
        name="presentationCategory"
        value={defaultValues?.presentationCategory ?? "GENERAL"}
      />

      {/* Student Award. Hidden fields are always submitted; the server
          only stores them when the chosen track is a Student Award track. */}
      <input
        type="hidden"
        name="studentAwardApplied"
        value={studentAwardApplied ? "true" : "false"}
      />
      <input type="hidden" name="supervisorName" value={supervisorName} />
      <input type="hidden" name="supervisorEmail" value={supervisorEmail} />

      {studentAwardTrack && (
        <div className="space-y-3 rounded-md border p-4">
          <label className="flex items-start gap-2 text-sm">
            <Checkbox
              checked={studentAwardApplied}
              onCheckedChange={(checked) => setStudentAwardApplied(checked === true)}
              className="mt-0.5"
            />
            <span>
              Apply for the Student Award
              <span className="block text-xs text-muted-foreground">
                Open to both oral and poster student presentations. Optional — leave this
                unchecked if not applying.
              </span>
            </span>
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="supervisorName">Supervisor name</Label>
              <Input
                id="supervisorName"
                value={supervisorName}
                onChange={(e) => setSupervisorName(e.target.value)}
                maxLength={100}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="supervisorEmail">Supervisor email</Label>
              <Input
                id="supervisorEmail"
                type="email"
                value={supervisorEmail}
                onChange={(e) => setSupervisorEmail(e.target.value)}
                maxLength={200}
              />
            </div>
          </div>
          {state.errors?.supervisorEmail && (
            <p className="text-sm text-destructive">{state.errors.supervisorEmail[0]}</p>
          )}
        </div>
      )}

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
          <Label>Affiliations</Label>
          <Button type="button" variant="outline" size="sm" onClick={addAffiliation}>
            + Add Affiliation
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          List each institution once. Then tick the numbers that apply to each author below.
        </p>
        {affiliations.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No affiliations yet — add one so authors can be linked to it.
          </p>
        ) : (
          <div className="space-y-2">
            {affiliations.map((entry, index) => (
              <div key={entry.key} className="flex items-center gap-2">
                <span className="w-6 shrink-0 text-right text-sm tabular-nums text-muted-foreground">
                  {keyToNumber.has(entry.key) ? `${keyToNumber.get(entry.key)}.` : "–"}
                </span>
                <Input
                  placeholder="Institution, City, Country"
                  value={entry.name}
                  maxLength={200}
                  onChange={(e) => updateAffiliation(entry.key, e.target.value)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={index === 0}
                  onClick={() => moveAffiliation(index, -1)}
                  aria-label="Move up"
                >
                  ↑
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={index === affiliations.length - 1}
                  onClick={() => moveAffiliation(index, 1)}
                  aria-label="Move down"
                >
                  ↓
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={affiliations.length <= 1}
                  onClick={() => removeAffiliation(entry.key)}
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        )}
        {state.errors?.affiliations && (
          <p className="text-sm text-destructive">{state.errors.affiliations[0]}</p>
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
            <div key={index} className="space-y-2 rounded-md border p-3">
              <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
                <Input
                  placeholder="Name"
                  value={author.name}
                  onChange={(e) => updateAuthor(index, { name: e.target.value })}
                  required
                />
                <Input
                  placeholder={author.isPresenter ? "Email" : "Email (optional)"}
                  type="email"
                  value={author.email}
                  onChange={(e) => updateAuthor(index, { email: e.target.value })}
                  required={author.isPresenter}
                />
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
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <span className="text-sm text-muted-foreground">Affiliations:</span>
                {keyToNumber.size === 0 ? (
                  <span className="text-sm text-muted-foreground">
                    Fill in an affiliation above first.
                  </span>
                ) : (
                  affiliations
                    .filter((entry) => keyToNumber.has(entry.key))
                    .map((entry) => (
                      <label
                        key={entry.key}
                        className="flex items-center gap-1.5 text-sm"
                        title={entry.name}
                      >
                        <Checkbox
                          checked={author.affiliationKeys.includes(entry.key)}
                          onCheckedChange={(checked) =>
                            toggleAuthorAffiliation(index, entry.key, checked === true)
                          }
                        />
                        <span className="tabular-nums">{keyToNumber.get(entry.key)}</span>
                      </label>
                    ))
                )}
                <label className="ml-auto flex items-center gap-2 whitespace-nowrap text-sm">
                  <Checkbox
                    checked={author.isPresenter}
                    onCheckedChange={(checked) =>
                      updateAuthor(index, { isPresenter: checked === true })
                    }
                  />
                  Presenter
                </label>
              </div>
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
