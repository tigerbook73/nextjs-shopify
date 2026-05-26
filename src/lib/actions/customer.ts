"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createCustomer, createCustomerAccessToken, deleteCustomerAccessToken } from "@/lib/shopify/client";

const TOKEN_COOKIE = "customerAccessToken";
const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 30,
};

export type AuthFormState = { error: string } | null;

export async function login(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  let token: Awaited<ReturnType<typeof createCustomerAccessToken>>;
  try {
    token = await createCustomerAccessToken(email, password);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "登录失败，请重试" };
  }

  const cookieStore = await cookies();
  cookieStore.set(TOKEN_COOKIE, token.accessToken, COOKIE_OPTIONS);
  redirect("/account");
}

export async function register(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const firstName = (formData.get("firstName") as string) || undefined;
  const lastName = (formData.get("lastName") as string) || undefined;

  try {
    await createCustomer(email, password, firstName, lastName);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "注册失败，请重试" };
  }

  let token: Awaited<ReturnType<typeof createCustomerAccessToken>>;
  try {
    token = await createCustomerAccessToken(email, password);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "注册成功但登录失败，请手动登录" };
  }

  const cookieStore = await cookies();
  cookieStore.set(TOKEN_COOKIE, token.accessToken, COOKIE_OPTIONS);
  redirect("/account");
}

export async function logout(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(TOKEN_COOKIE)?.value;

  if (token) {
    await deleteCustomerAccessToken(token).catch(() => {});
  }

  cookieStore.delete(TOKEN_COOKIE);
  redirect("/account/login");
}
