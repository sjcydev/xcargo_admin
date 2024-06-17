import type { RequestEvent } from "./$types";
import { prisma } from "$lib/server/prisma";
import { auth } from "$lib/server/lucia";

export const POST = async ({ request, params }: RequestEvent) => {
  const { password, user } = await request.json();

  const key = await auth.useKey("username", user.username, password);
  const authUser = await auth.getUser(key.userId);

  if (!authUser) {
    return new Response(
      JSON.stringify({
        message: "Contraseña equivocada",
        status: "warning",
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 400,
      }
    );
  }

  try {
    await prisma.trackings.deleteMany({
      where: {
        factura_id: {
          equals: parseInt(params.factura_id),
        },
      },
    });

    await prisma.facturas.delete({
      where: {
        factura_id: parseInt(params.factura_id),
      },
    });
  } catch (err) {
    console.error(err);
    return new Response(
      JSON.stringify({
        message: "Hubo un error, contacte al tecnico",
        status: "warning",
      }),
      {
        headers: {
          "Content-Type": "application/json",
        },
        status: 500,
      }
    );
  }

  return new Response(
    JSON.stringify({
      message: "Factura Cancelada",
      status: "success",
    }),
    {
      headers: { "Content-Type": "application/json" },
      status: 200,
    }
  );
};
