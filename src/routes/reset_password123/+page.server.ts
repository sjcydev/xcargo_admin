import { redirect, fail } from "@sveltejs/kit";
import type { PageServerLoad, Actions } from "../$types";
import { zfd } from "zod-form-data";
import { auth } from "$lib/server/lucia";
import { generate } from "generate-password";
import { SECRET_SIB_API_KEY, CODIGO_SECRETO } from "$env/static/private";
import * as SIB from "@sendinblue/client";
import { render } from "svelte-email";
import NuevoUsuario from "$lib/components/emails/NuevoUsuario.svelte";

export const actions: Actions = {
  default: async ({ request, locals }) => {
    const formData = await request.formData();

    const userSchema = zfd.formData({
      username: zfd.text(),
    });

    const result = userSchema.safeParse(formData);

    if (!result.success) {
      const data = {
        data: Object.fromEntries(formData),
        errors: result.error.flatten().fieldErrors,
      };

      return fail(400, data);
    }

    const username = String(formData.get("username"));

    let password = generate({ length: 12, numbers: true });

    await auth.updateKeyPassword("username", username, password);
    const key = await auth.useKey("username", username, password);

    const user = await auth.updateUserAttributes(key.userId, {
      password_updated: false,
    });
    await auth.invalidateAllUserSessions(user.userID);

    try {
      const html = render({
        template: NuevoUsuario,
        props: {
          nombre: user.name,
          username,
          password,
        },
      });

      const sibAPI = new SIB.TransactionalEmailsApi();

      sibAPI.setApiKey(
        SIB.TransactionalEmailsApiApiKeys.apiKey,
        SECRET_SIB_API_KEY
      );

      await sibAPI
        .sendTransacEmail({
          sender: {
            email: "info@qualitycargoservices.com",
            name: "QualityCargoServices",
          },
          to: [
            {
              email: user.correo,
            },
          ],
          subject: "Detalles e Instrucciones - Sistema de Facturación",
          htmlContent: html,
        })
        .then((err) => {
          return new Response(
            JSON.stringify({ message: err, status: "warning" }),
            {
              headers: { "Content-Type": "application/json" },
              status: 500,
            }
          );
        });
    } catch (err) {
      return new Response(JSON.stringify({ message: err, status: "warning" }), {
        headers: { "Content-Type": "application/json" },
        status: 500,
      });
    }

    throw redirect(303, "/");
  },
};
