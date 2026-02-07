/**
 * TRPC Client Setup
 * 
 * إعداد عميل tRPC
 * 
 * @module client/src/lib/trpc
 */
import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "../../../server/routers";

export const trpc = createTRPCReact<AppRouter>();
