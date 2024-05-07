import { Static, t } from "elysia"
import { IdTokenPayload, auth } from "../lib/authPlugin"
import { database } from "../database/setup"
import { admin } from "../database/schema"
import { eq } from "drizzle-orm"

const SessionSchema = t.Object({
  id: t.String(),
  name: t.Optional(t.String()),
  email: t.Optional(t.String()),
})

type Session = Static<typeof SessionSchema>

const login = async (payload: IdTokenPayload): Promise<Session | null> => {
  
  
  console.log(payload);
  

  const result = await database.select().from(admin).where(eq(admin.googleId, payload.sub))

  console.log(result);
  
  if (!result.length) {
    await database
      .insert(admin)
      .values({ googleId: payload.sub, username: payload.name || "" })
      .returning()
  }

  return {
    id: payload.sub,
    name: payload.name,
    email: payload.email
  }
}

export const authPlugin = auth(SessionSchema, login)
