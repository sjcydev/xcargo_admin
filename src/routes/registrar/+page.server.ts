import { auth } from "$lib/server/lucia";
import { redirect, type Actions, fail } from "@sveltejs/kit";
import { zfd } from "zod-form-data";
import { prisma } from "$lib/server/prisma";
import { generate } from "generate-password";
import { SECRET_SIB_API_KEY, CODIGO_SECRETO } from "$env/static/private";
import * as SIB from "@sendinblue/client";
import { render } from "svelte-email";
import NuevoUsuario from "$lib/components/emails/NuevoUsuario.svelte";
import type { Roles } from "@prisma/client";
import type { PageServerLoad } from "../$types";

export const load: PageServerLoad = async ({ locals }) => {
  const { user } = await locals.auth.validateUser();

  return { user };
};

export const actions: Actions = {
  default: async ({ request, locals }) => {
    const formData = await request.formData();

    const loginSchema = zfd.formData({
      nombre: zfd.text(),
      apellido: zfd.text(),
      correo: zfd.text(),
      username: zfd.text(),
      codigo: zfd.text(),
    });

    const result = loginSchema.safeParse(formData);

    if (!result.success) {
      const data = {
        data: Object.fromEntries(formData),
        errors: result.error.flatten().fieldErrors,
      };

      return fail(400, data);
    }
    const nombre = String(formData.get("nombre"));
    const apellido = String(formData.get("apellido"));
    const correo = String(formData.get("correo"));
    const username = String(formData.get("username"));
    const rolSelect = String(formData.get("rol")) as Roles;
    const codigo = String(formData.get("codigo"));
    const admin = String(formData.get("admin_control"));

    const usedEmail = await prisma.authUser.findUnique({ where: { correo } });

    let data = {
      data: Object.fromEntries(formData),
      errors: {},
    };
    if (usedEmail) {
      data.errors = {
        correo_registrado: true,
      };
      return fail(400, data);
    }

    let rol: Roles = "EMPLEADO";

    if ((rolSelect as String) !== "null") {
      rol = rolSelect;
    }

    if (codigo !== CODIGO_SECRETO && !admin) {
      if (codigo === CODIGO_SECRETO + "_ADMIN") {
        rol = "ADMIN";
      } else {
        data.errors = {
          codigo_invalido: true,
        };

        return fail(400, data);
      }
    }

    let password = generate({ length: 12, numbers: true });

    try {
      await auth.createUser({
        primaryKey: {
          providerId: "username",
          providerUserId: username,
          password,
        },
        attributes: {
          username,
          nombre,
          correo,
          apellido,
          rol,
          password_updated: false,
        },
      });
    } catch (err) {
      return fail(400, {
        data: Object.fromEntries(formData),
        errors: { register_fail: true },
      });
    }

    try {
      const html = render({
        template: NuevoUsuario,
        props: {
          nombre,
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
            email: "info@xcargoservices.com",
            name: "XCargoServices",
          },
          to: [
            {
              email: correo,
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
