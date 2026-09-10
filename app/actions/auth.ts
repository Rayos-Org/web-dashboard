"use server";

import { createSession, destroySession } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function loginAction(walletAddress: string, credentialId: string) {
  await createSession(walletAddress, credentialId);
  redirect("/wallet");
}

export async function logoutAction() {
  await destroySession();
  redirect("/");
}
