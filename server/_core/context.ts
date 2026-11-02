import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { createRemoteJWKSet, jwtVerify } from "jose";
import * as db from "../db";
import { sdk } from "./sdk";

const firebaseProjectId = () => process.env.FIREBASE_PROJECT_ID ?? "";
const firebaseJwks = createRemoteJWKSet(
  new URL("https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com")
);

async function authenticateFirebaseToken(token: string): Promise<User | null> {
  const projectId = firebaseProjectId();
  if (!projectId) return null;
  try {
    const { payload } = await jwtVerify(token, firebaseJwks, {
      issuer: `https://securetoken.google.com/${projectId}`,
      audience: projectId,
      algorithms: ["RS256"],
    });
    if (typeof payload.sub !== "string" || !payload.sub || payload.email_verified !== true) return null;
    const email = typeof payload.email === "string" ? payload.email : null;
    const name = typeof payload.name === "string" ? payload.name : email?.split("@")[0] ?? "Customer";
    await db.upsertUser({
      openId: payload.sub,
      name,
      email,
      loginMethod: "firebase_email_password",
      lastSignedIn: new Date(),
    });
    return (await db.getUserByOpenId(payload.sub)) ?? null;
  } catch (error) {
    console.warn("[Auth] Firebase token rejected:", error instanceof Error ? error.message : "invalid token");
    return null;
  }
}

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

export async function createContext(opts: CreateExpressContextOptions): Promise<TrpcContext> {
  let user: User | null = null;
  const authorization = opts.req.headers.authorization;
  const bearer = authorization?.startsWith("Bearer ") ? authorization.slice(7).trim() : "";
  if (bearer && firebaseProjectId()) {
    user = await authenticateFirebaseToken(bearer);
  }
  if (!user) {
    try {
      user = await sdk.authenticateRequest(opts.req);
    } catch {
      user = null;
    }
  }
  return { req: opts.req, res: opts.res, user };
}
