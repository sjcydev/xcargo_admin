import type { RequestEvent } from "./$types";
import { prisma } from "$lib/server/prisma";
import { getToday, dateToLocaleString } from "$lib/utils/datehandler";

export const POST = async ({ request }: RequestEvent) => {
  const { info, id, total } = await request.json();
  const fecha = dateToLocaleString(getToday());

  const factura = await prisma.facturas.create({
    data: {
      casillero: id,
      trackings: {
        create: info.trackings,
      },
      fecha,
      total,
    },
    include: {
      trackings: true,
    },
  });

  return new Response(
    JSON.stringify({
      message: "Factura Creada",
      status: "success",
      factura,
    }),
    {
      headers: { "Content-Type": "application/json" },
      status: 200,
    }
  );
};
