import { listEntries, type Entry } from "@/lib/db";
import { EntryForm } from "./_components/EntryForm";
import { EntryItem } from "./_components/EntryItem";

// Entries change on every write, so always render at request time.
export const dynamic = "force-dynamic";

export default async function Home() {
  let entries: Entry[] = [];
  let loadError = false;
  try {
    entries = await listEntries();
  } catch (err) {
    console.error(err);
    loadError = true;
  }

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-10">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold">미니 방명록</h1>
        <p className="text-sm text-zinc-600">개발자: 윤채원 (학번 202404261)</p>
      </header>

      <EntryForm />

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">방명록 ({entries.length})</h2>
        {loadError ? (
          <p role="alert" className="text-sm text-red-600">
            글 목록을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.
          </p>
        ) : entries.length === 0 ? (
          <p className="text-sm text-zinc-500">아직 글이 없습니다. 첫 글을 남겨 보세요.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {entries.map((entry) => (
              <EntryItem key={entry.id} entry={entry} />
            ))}
          </ul>
        )}
      </section>

      <footer className="border-t border-zinc-200 pt-4 text-center text-xs text-zinc-500">
        윤채원 · 202404261
      </footer>
    </main>
  );
}
