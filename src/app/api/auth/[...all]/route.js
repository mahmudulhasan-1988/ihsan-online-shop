import { auth } from "@/lib/auth"; // path to your auth file
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST, PATCH, PUT, DELETE } = toNextJsHandler(auth);