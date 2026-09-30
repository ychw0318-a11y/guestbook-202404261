"use server";

import { hash, compare } from "bcryptjs";
import { revalidatePath } from "next/cache";
import {
  deleteEntryById,
  getPasswordHash,
  insertEntry,
  updateEntryMessage,
} from "@/lib/db";

export type ActionState = {
  ok: boolean;
  error: string | null;
  // Bumped on every success so forms can tell a new success from a stale one.
  successAt?: number;
  // Echoes submitted text (never the password) so the form can refill after React resets it.
  values?: { name?: string; message?: string };
};

const NAME_MAX = 30;
const MESSAGE_MAX = 500;
const PASSWORD_MIN = 4;
const PASSWORD_MAX = 72; // bcrypt ignores bytes past 72

function text(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function rawText(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function parseId(formData: FormData) {
  const id = Number(formData.get("id"));
  return Number.isInteger(id) && id > 0 ? id : null;
}

function validateMessage(message: string) {
  if (!message) return "메시지를 입력해 주세요.";
  if (message.length > MESSAGE_MAX) return `메시지는 ${MESSAGE_MAX}자 이하로 입력해 주세요.`;
  return null;
}

function fail(error: string, values?: ActionState["values"]): ActionState {
  return { ok: false, error, values };
}

function succeed(): ActionState {
  revalidatePath("/");
  return { ok: true, error: null, successAt: Date.now() };
}

// Checks the password against the stored hash. Returns an error message, or null when it matches.
async function checkPassword(id: number, password: string) {
  if (!password) return "비밀번호를 입력해 주세요.";
  const stored = await getPasswordHash(id);
  if (!stored) return "이미 삭제되었거나 없는 글입니다.";
  if (!(await compare(password, stored))) return "비밀번호가 일치하지 않습니다.";
  return null;
}

export async function createEntry(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const name = text(formData, "name");
  const message = text(formData, "message");
  const password = rawText(formData, "password");
  const values = { name, message };

  if (!name) return fail("이름을 입력해 주세요.", values);
  if (name.length > NAME_MAX) return fail(`이름은 ${NAME_MAX}자 이하로 입력해 주세요.`, values);
  const messageError = validateMessage(message);
  if (messageError) return fail(messageError, values);
  if (password.length < PASSWORD_MIN) return fail(`비밀번호는 ${PASSWORD_MIN}자 이상 입력해 주세요.`, values);
  if (password.length > PASSWORD_MAX) return fail(`비밀번호는 ${PASSWORD_MAX}자 이하로 입력해 주세요.`, values);

  try {
    await insertEntry(name, message, await hash(password, 10));
  } catch (err) {
    console.error(err);
    return fail("글을 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.", values);
  }
  return succeed();
}

export async function updateEntry(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const id = parseId(formData);
  if (!id) return fail("잘못된 요청입니다.");
  const message = text(formData, "message");
  const values = { message };
  const messageError = validateMessage(message);
  if (messageError) return fail(messageError, values);

  try {
    const passwordError = await checkPassword(id, rawText(formData, "password"));
    if (passwordError) return fail(passwordError, values);
    await updateEntryMessage(id, message);
  } catch (err) {
    console.error(err);
    return fail("글을 수정하지 못했습니다. 잠시 후 다시 시도해 주세요.", values);
  }
  return succeed();
}

export async function deleteEntry(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const id = parseId(formData);
  if (!id) return fail("잘못된 요청입니다.");

  try {
    const passwordError = await checkPassword(id, rawText(formData, "password"));
    if (passwordError) return fail(passwordError);
    await deleteEntryById(id);
  } catch (err) {
    console.error(err);
    return fail("글을 삭제하지 못했습니다. 잠시 후 다시 시도해 주세요.");
  }
  return succeed();
}
