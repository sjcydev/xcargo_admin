import type { RequestEvent } from "./$types";
import * as SIB from "@sendinblue/client";
import { SECRET_SIB_API_KEY } from "$env/static/private";
import BienvenidoEmail from "$lib/components/emails/BienvenidoEmail.svelte";
import CasilleroEmailAdmin from "$lib/components/emails/CasilleroEmailAdmin.svelte";
import { render } from "svelte-email";

export const POST = async ({ request }: RequestEvent) => {
  let { nombre, cedula, correo, telefono, apellido, casillero, sucursal } =
    await request.json();

  try {
    const html = render({
      template: BienvenidoEmail,
      props: {
        nombre,
        apellido,
        casillero,
        sucursal,
      },
    });
    const text = render({
      template: BienvenidoEmail,
      props: {
        nombre,
        apellido,
        casillero,
        sucursal,
      },
      options: {
        plainText: true,
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
          name: "Quality Cargo Services",
        },
        to: [
          {
            email: correo,
          },
        ],
        subject: "Bienvenido a Quality Cargo Services",
        htmlContent: html,
        textContent: text,
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

    const admin = render({
      template: CasilleroEmailAdmin,
      props: {
        nombre,
        apellido,
        casillero,
        cedula,
        correo,
        telefono,
        sucursal,
      },
    });

    const textAdmin = render({
      template: CasilleroEmailAdmin,
      props: {
        nombre,
        apellido,
        casillero,
        cedula,
        correo,
        telefono,
        sucursal,
      },
      options: {
        plainText: true,
      },
    });

    await sibAPI.sendTransacEmail({
      sender: {
        email: "info@qualitycargoservices.com",
        name: "Quality Cargo Services",
      },
      to: [{ email: "info@qualitycargoservices.com" }],
      subject: "Nuevo Casillero Registrado",
      htmlContent: admin,
      textContent: textAdmin,
    });
  } catch (err) {
    return new Response(JSON.stringify({ message: err, status: "warning" }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }

  return new Response(
    JSON.stringify({
      message:
        "Casillero Registrado Exitosamente! Pronto recibiras un correo con mas detalles. Recuerda revisar el folder de Spam.",
      status: "success",
    }),
    {
      headers: { "Content-Type": "application/json" },
      status: 201,
    }
  );
};
