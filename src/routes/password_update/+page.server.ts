import { redirect, fail } from "@sveltejs/kit";
import type { PageServerLoad, Actions } from "../$types";
import { zfd } from "zod-form-data";
import { auth } from "$lib/server/lucia";

export const load: PageServerLoad = async ({ locals }) => {
  const { user } = await locals.auth.validateUser();

  if (user && user.password_updated) {
    throw redirect(303, "/");
  } else {
    return {
      userID: user.userID,
      username: user.username,
    };
  }
};

export const actions: Actions = {
  default: async ({ request, locals }) => {
    const formData = await request.formData();

    const passwordSchema = zfd.formData({
      password: zfd.text(),
      confirmed: zfd.text(),
    });

    const result = passwordSchema.safeParse(formData);

    if (!result.success) {
      const data = {
        data: Object.fromEntries(formData),
        errors: result.error.flatten().fieldErrors,
      };

      return fail(400, data);
    }

    const password = String(formData.get("password"));
    const username = String(formData.get("username"));
    const userID = String(formData.get("userID"));

    await auth.updateKeyPassword("username", username, password);
    const user = await auth.updateUserAttributes(userID, {
      password_updated: true,
    });
    await auth.invalidateAllUserSessions(user.userID);
    const session = await auth.createSession(user.userID);
    locals.auth.setSession(session);

    throw redirect(303, "/");
  },
};
