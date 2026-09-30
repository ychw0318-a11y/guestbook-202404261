"use client";

import { useActionState } from "react";
import { createEntry, type ActionState } from "@/app/actions";

const initialState: ActionState = { ok: false, error: null };

export function EntryForm() {
  const [state, formAction, pending] = useActionState(createEntry, initialState);

  return (
    <form
      action={formAction}
      // Remount after each success so the refilled defaultValues are cleared.
      key={state.successAt ?? "new"}
      className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm"
    >
      <h2 className="text-lg font-semibold">글 남기기</h2>
      <div className="flex flex-col gap-3 sm:flex-row">
        <label className="flex flex-1 flex-col gap-1 text-sm">
          이름
          <input
            name="name"
            required
            maxLength={30}
            defaultValue={state.values?.name}
            className="rounded-md border border-zinc-300 px-3 py-2 text-base"
          />
        </label>
        <label className="flex flex-1 flex-col gap-1 text-sm">
          비밀번호 (수정·삭제용, 4자 이상)
          <input
            name="password"
            type="password"
            required
            minLength={4}
            maxLength={72}
            autoComplete="new-password"
            className="rounded-md border border-zinc-300 px-3 py-2 text-base"
          />
        </label>
      </div>
      <label className="flex flex-col gap-1 text-sm">
        메시지
        <textarea
          name="message"
          required
          maxLength={500}
          rows={3}
          defaultValue={state.values?.message}
          className="rounded-md border border-zinc-300 px-3 py-2 text-base"
        />
      </label>
      {state.error && (
        <p role="alert" className="text-sm text-red-600">
          {state.error}
        </p>
      )}
      {state.ok && !state.error && (
        <p role="status" className="text-sm text-green-700">
          글이 등록되었습니다.
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="self-end rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {pending ? "등록 중..." : "등록"}
      </button>
    </form>
  );
}
