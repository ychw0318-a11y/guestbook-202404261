"use client";

import { useActionState, useState } from "react";
import { deleteEntry, updateEntry, type ActionState } from "@/app/actions";
import type { Entry } from "@/lib/db";

type Mode = "view" | "edit" | "delete";

const initialState: ActionState = { ok: false, error: null };

const dateFormat = new Intl.DateTimeFormat("ko-KR", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Seoul",
});

export function EntryItem({ entry }: { entry: Entry }) {
  const [mode, setMode] = useState<Mode>("view");

  return (
    <li className="flex flex-col gap-2 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <span className="font-semibold">{entry.name}</span>
        <span className="text-xs text-zinc-500">
          <time dateTime={entry.createdAt}>{dateFormat.format(new Date(entry.createdAt))}</time>
          {entry.updatedAt && " (수정됨)"}
        </span>
      </div>

      {mode === "edit" ? (
        <EditForm entry={entry} onDone={() => setMode("view")} />
      ) : (
        <p className="whitespace-pre-wrap break-words text-zinc-800">{entry.message}</p>
      )}

      {mode === "delete" && <DeleteForm id={entry.id} onCancel={() => setMode("view")} />}

      {mode === "view" && (
        <div className="flex gap-2 self-end text-sm">
          <button type="button" onClick={() => setMode("edit")} className="text-zinc-600 hover:underline">
            수정
          </button>
          <button type="button" onClick={() => setMode("delete")} className="text-red-600 hover:underline">
            삭제
          </button>
        </div>
      )}
    </li>
  );
}

function EditForm({ entry, onDone }: { entry: Entry; onDone: () => void }) {
  const [state, formAction, pending] = useActionState(
    async (prev: ActionState, formData: FormData) => {
      const next = await updateEntry(prev, formData);
      if (next.ok) onDone();
      return next;
    },
    initialState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <input type="hidden" name="id" value={entry.id} />
      <textarea
        name="message"
        required
        maxLength={500}
        rows={3}
        defaultValue={state.values?.message ?? entry.message}
        aria-label="수정할 메시지"
        className="rounded-md border border-zinc-300 px-3 py-2"
      />
      <PasswordRow pending={pending} submitLabel="수정 완료" onCancel={onDone} />
      <ErrorMessage error={state.error} />
    </form>
  );
}

function DeleteForm({ id, onCancel }: { id: number; onCancel: () => void }) {
  const [state, formAction, pending] = useActionState(deleteEntry, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <input type="hidden" name="id" value={id} />
      <p className="text-sm text-zinc-600">이 글을 삭제하려면 비밀번호를 입력하세요.</p>
      <PasswordRow pending={pending} submitLabel="삭제" danger onCancel={onCancel} />
      <ErrorMessage error={state.error} />
    </form>
  );
}

function PasswordRow({
  pending,
  submitLabel,
  danger,
  onCancel,
}: {
  pending: boolean;
  submitLabel: string;
  danger?: boolean;
  onCancel: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <input
        name="password"
        type="password"
        required
        placeholder="비밀번호"
        aria-label="비밀번호"
        autoComplete="current-password"
        className="min-w-0 flex-1 rounded-md border border-zinc-300 px-3 py-2 text-sm"
      />
      <button
        type="submit"
        disabled={pending}
        className={`rounded-md px-3 py-2 text-sm font-medium text-white disabled:opacity-50 ${
          danger ? "bg-red-600" : "bg-zinc-900"
        }`}
      >
        {pending ? "처리 중..." : submitLabel}
      </button>
      <button type="button" onClick={onCancel} className="px-2 py-2 text-sm text-zinc-600">
        취소
      </button>
    </div>
  );
}

function ErrorMessage({ error }: { error: string | null }) {
  if (!error) return null;
  return (
    <p role="alert" className="text-sm text-red-600">
      {error}
    </p>
  );
}
