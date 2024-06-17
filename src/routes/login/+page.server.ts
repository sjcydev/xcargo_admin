import type { PageServerLoad } from "./$types";
import { auth } from "$lib/server/lucia";
import { redirect, type Actions, fail } from "@sveltejs/kit";
import { zfd } from "zod-form-data";

export const load: PageServerLoad = async ({ locals }) => {
  const { session } = await locals.auth.validateUser();
  if (session) throw redirect(302, "/");
};

export const actions: Actions = {
  default: async ({ request, locals }) => {
    const formData = await request.formData();

    const loginSchema = zfd.formData({
      username: zfd.text(),
      password: zfd.text(),
    });

    const result = loginSchema.safeParse(formData);

    if (!result.success) {
      const data = {
        data: Object.fromEntries(formData),
        errors: result.error.flatten().fieldErrors,
      };

      return fail(400, data);
    }

    const username = String(formData.get("username"));
    const password = String(formData.get("password"));

    try {
      const key = await auth.useKey("username", username, password);
      const session = await auth.createSession(key.userId);
      locals.auth.setSession(session);
    } catch (err) {
      return fail(400, {
        data: Object.fromEntries(formData),
        errors: { auth_fail: true },
      });
    }

    throw redirect(303, "/");
  },
};
