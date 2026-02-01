import { env } from "@linkaboard/env/server";
import type { ExtractTablesWithRelations } from "drizzle-orm";
import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import type { PgQueryResultHKT, PgTransaction } from "drizzle-orm/pg-core";
import * as schema from "./schema";

export const db = drizzle(env.DATABASE_URL, { schema });

export type DB =
	| NodePgDatabase<typeof schema>
	| PgTransaction<
			PgQueryResultHKT,
			typeof schema,
			ExtractTablesWithRelations<typeof schema>
	  >;
