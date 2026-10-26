import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { moveRow, nextPosition } from "@/lib/reorder";
import { AForm } from "@/components/admin/Toast";
import { Card, CardGrid, CardHead, Field, FieldGrid, PageTitle, btnD, btnP, btnS, input, monoHead } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

type Row = {
  id: string;
  kind: "online" | "campus";
  genre: string;
  title: string;
  description: string;
  prize: string;
  theme: string;
  deadline: string;
  url: string;
  live: boolean;
};

function formatUrl(raw: string): string {
  if (!raw) return "";
  let url = raw.trim();
  const match = url.match(/src=["']([^"']+)["']/i);
  if (match) url = match[1].trim();
  if (url && !/^https?:\/\//i.test(url)) {
    url = "https://" + url;
  }
  return url;
}

async function act(form: FormData) {
  "use server";
  await requireAdmin("super");
  const op = String(form.get("op")), id = String(form.get("id") ?? ""), g = (k: string) => String(form.get(k) ?? "").trim();
  const sb = db();

  if (op === "add") {
    const kind = g("kind");
    const { error } = await sb.from("competitions").insert({
      kind,
      title: kind === "campus" ? "New in-campus competition" : "New competition",
      genre: "Genre",
      position: await nextPosition("competitions", { kind }),
      live: false,
    });
    if (error) throw new Error(error.message);
  } else if (op === "delete") {
    await sb.from("competitions").delete().eq("id", id);
    // Clean up sheet link in settings if present
    try {
      const { data: sRow } = await sb.from("settings").select("value").eq("key", "competition_sheets").maybeSingle();
      if (sRow?.value) {
        const sheets = { ...(sRow.value as Record<string, string>) };
        delete sheets[id];
        await sb.from("settings").upsert({ key: "competition_sheets", value: sheets });
      }
    } catch {}
  } else if (op === "up" || op === "down") {
    await moveRow("competitions", id, op === "up" ? -1 : 1, { kind: g("kind") });
  } else {
    const status = String(form.get("status") ?? "");
    let live: boolean;
    if (op === "toggle") {
      live = g("live") !== "true";
    } else if (status === "live") {
      live = true;
    } else if (status === "soon") {
      live = false;
    } else {
      live = g("live") === "true";
    }

    const url = formatUrl(g("url"));
    const sheetUrl = formatUrl(g("sheet_url"));

    const { error } = await sb.from("competitions").update({
      title: g("title"),
      genre: g("genre"),
      prize: g("prize"),
      theme: g("theme"),
      deadline: g("deadline"),
      url,
      description: g("description"),
      live,
    }).eq("id", id);
    if (error) throw new Error(error.message);

    // Save admin response sheet link in settings
    try {
      const { data: sRow } = await sb.from("settings").select("value").eq("key", "competition_sheets").maybeSingle();
      const sheets = { ...((sRow?.value as Record<string, string>) ?? {}) };
      sheets[id] = sheetUrl;
      await sb.from("settings").upsert({ key: "competition_sheets", value: sheets });
    } catch {}
  }

  revalidatePath("/competitions");
  revalidatePath("/admin/competitions");
}

const MSG = {
  save: "Saved",
  toggle: "Updated",
  add: "Competition added",
  delete: "Deleted",
  up: "Moved up",
  down: "Moved down",
};

function Comp({ c, linkLabel, sheetUrl }: { c: Row; linkLabel: string; sheetUrl: string }) {
  const isCampus = c.kind === "campus";

  return (
    <Card>
      <AForm action={act} messages={MSG} confirm={{ delete: `Delete "${c.title || "this competition"}"? This action cannot be undone.` }} className="flex flex-col gap-4">
        <input type="hidden" name="id" value={c.id} />
        <input type="hidden" name="kind" value={c.kind} />
        <input type="hidden" name="live" value={String(c.live)} />
        <CardHead
          title={c.title || "Untitled"}
          sub={c.genre}
          right={
            <button
              name="op"
              value="toggle"
              title="Click to toggle between Live and Coming soon"
              className={`cursor-pointer whitespace-nowrap rounded-full border-[1.5px] px-3.5 py-1.5 text-[13px] font-bold transition-colors ${
                c.live ? "border-ok bg-ok text-white hover:bg-ok/90" : "border-fg/40 bg-transparent text-fg hover:border-fg"
              }`}
            >
              {c.live ? "● Live" : "○ Coming soon"}
            </button>
          }
        />
        <FieldGrid>
          <Field label="Title" wide>
            <input name="title" defaultValue={c.title} className={input} />
          </Field>
          <Field label="Genre">
            <input name="genre" defaultValue={c.genre} className={input} />
          </Field>
          <Field label="Status">
            <select name="status" defaultValue={c.live ? "live" : "soon"} className={input}>
              <option value="live">● Live (Open for submissions)</option>
              <option value="soon">○ Coming soon</option>
            </select>
          </Field>
          <Field label="Prize">
            <input name="prize" defaultValue={c.prize} className={input} />
          </Field>
          <Field label="Theme">
            <input name="theme" defaultValue={c.theme} placeholder="Announced 26 Oct" className={input} />
          </Field>
          <Field label="Deadline">
            <input name="deadline" defaultValue={c.deadline} placeholder="Announced 26 Oct" className={input} />
          </Field>
          <Field
            label={linkLabel}
            hint={isCampus ? "Participants are directed to this Google Form when clicking 'Submit Entry ↗'." : "Participants are directed to this Unstop link."}
            wide
          >
            <input name="url" defaultValue={c.url} placeholder="https://" className={input} />
          </Field>
          {isCampus && (
            <Field
              label="Response Sheet Link (Admin-only)"
              hint="Only visible to admins. Allows organizers to view student submissions in Google Sheets."
              wide
            >
              <div className="flex flex-wrap sm:flex-nowrap gap-2">
                <input
                  name="sheet_url"
                  defaultValue={sheetUrl}
                  placeholder="https://docs.google.com/spreadsheets/d/..."
                  className={input}
                />
                {sheetUrl ? (
                  <a
                    href={sheetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${btnS} whitespace-nowrap inline-flex items-center gap-1.5 shrink-0`}
                  >
                    <span>Open Sheet</span>
                    <span>↗</span>
                  </a>
                ) : null}
              </div>
            </Field>
          )}
          <Field label="Description" wide>
            <textarea name="description" rows={4} defaultValue={c.description} className={`${input} resize-y leading-normal`} />
          </Field>
        </FieldGrid>
        <div className="flex flex-wrap gap-2">
          <button name="op" value="save" className={btnP}>Save</button>
          <button name="op" value="up" className={btnS}>↑ Up</button>
          <button name="op" value="down" className={btnS}>↓ Down</button>
          <button name="op" value="delete" className={btnD}>Delete</button>
        </div>
      </AForm>
    </Card>
  );
}

export default async function Page() {
  const { data } = await db().from("competitions").select("*").order("position").order("id");
  const rows = (data ?? []) as Row[];

  // Fetch admin response sheet URLs from settings
  let sheetMap: Record<string, string> = {};
  try {
    const { data: sRow } = await db().from("settings").select("value").eq("key", "competition_sheets").maybeSingle();
    if (sRow?.value) sheetMap = sRow.value as Record<string, string>;
  } catch {}

  const onl = rows.filter((r) => r.kind === "online"), cam = rows.filter((r) => r.kind === "campus");
  const add = (kind: string, label: string, primary = false) => (
    <AForm action={act} messages={MSG}>
      <input type="hidden" name="kind" value={kind} />
      <button name="op" value="add" className={primary ? btnP : btnS}>{label}</button>
    </AForm>
  );

  return (
    <>
      <PageTitle
        title="Competitions"
        sub="Add, edit, reorder and delete. Switch each one between Live and Coming soon."
        actions={
          <>
            {add("online", "Add Unstop competition")}
            {add("campus", "Add in-campus competition")}
          </>
        }
      />
      {rows.length === 0 && (
        <p className="m-0 text-fg-3">
          Nothing here yet. Click &quot;Add Unstop competition&quot; or &quot;Add in-campus competition&quot; above to add one.
        </p>
      )}
      <div className="flex flex-col gap-3.5">
        <div className={monoHead}>Online · Unstop</div>
        <CardGrid>{onl.map((c) => <Comp key={c.id} c={c} linkLabel="Unstop URL" sheetUrl={sheetMap[c.id] ?? ""} />)}</CardGrid>
      </div>
      <div className="flex flex-col gap-3.5">
        <div className={monoHead}>In-campus · Google Forms</div>
        <CardGrid>{cam.map((c) => <Comp key={c.id} c={c} linkLabel="Google Form URL" sheetUrl={sheetMap[c.id] ?? ""} />)}</CardGrid>
      </div>
    </>
  );
}
