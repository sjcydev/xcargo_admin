import { prisma } from "$lib/server/prisma";
import type { Actions } from "@sveltejs/kit";
import { fail, redirect } from "@sveltejs/kit";

export const actions: Actions = {
  crearUsuario: async ({ request, fetch }) => {
    const formData = await request.formData();

    const correo = String(formData.get("correo"));
    let nombre = String(formData.get("nombre"));
    let apellido = String(formData.get("apellido"));

    nombre = nombre
      .split(" ")
      .map((nom) => {
        nom = nom.toLowerCase();
        nom = nom.charAt(0).toUpperCase() + nom.slice(1);
        return nom;
      })
      .join(" ");

    apellido = apellido
      .split(" ")
      .map((apel) => {
        apel = apel.toLowerCase();
        apel = apel.charAt(0).toUpperCase() + apel.slice(1);
        return apel;
      })
      .join(" ");

    const fecha_nacimiento = String(formData.get("nacimiento"));

    let fechas = fecha_nacimiento.split("-");
    const nacimiento = new Date(
      Number(fechas[2]),
      Number(fechas[1]),
      Number(fechas[0])
    );

    let telefono = String(formData.get("telefono"));
    let cedula = String(formData.get("cedula"));
    let sexo = String(formData.get("sexo"));
    let sucursal = String(formData.get("sucursal"));
    let enviar = formData.get("enviar");

    let record;
    try {
      record = await prisma.usuarios.create({
        data: {
          nombre,
          apellido,
          cedula,
          correo,
          sexo,
          telefono,
          sucursal,
          nacimiento,
        },
      });
      record = await prisma.usuarios.update({
        where: {
          id: record.id,
        },
        data: {
          casillero: record.id,
        },
      });
    } catch (err) {
      const data = {
        data: Object.fromEntries(formData),
        errors: {
          server: "Contacte al tecnico",
        },
      };
      return fail(500, data);
    }

    let enviarCorreo = false;
    if (enviar) enviarCorreo = true;

    if (enviarCorreo) {
      let emailData = {
        nombre,
        cedula,
        correo,
        telefono,
        apellido,
        casillero: record.casillero,
        sucursal,
      };

      fetch("/api/emails/bienvenida", {
        method: "POST",
        body: JSON.stringify(emailData),
      });
    }

    throw redirect(303, "/");
  },
};
