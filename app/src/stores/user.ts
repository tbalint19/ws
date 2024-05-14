import { writable, derived } from "svelte/store";
import { jwt } from "$lib/util/jwt";
import { z } from "zod";

const UserSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  email: z.string().optional(),
  exp: z.number().optional(),
})
export type User = z.infer<typeof UserSchema> | null

const { decode } = jwt(UserSchema)

export const user = (token?: string) => {
  
  const _user = writable<User>(token ? decode(token) : null)

  return derived(_user, v => v)
}