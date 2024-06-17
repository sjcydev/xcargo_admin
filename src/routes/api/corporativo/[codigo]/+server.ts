import type { RequestEvent } from "./$types";
import { prisma } from "$lib/server/prisma";

export const GET = async ({ params }: RequestEvent) => {
  const codigo = params.codigo;

  let cliente;
  if (codigo.length > 0) {
    cliente = await prisma.usuarios.findFirst({
      where: {
        codigo: {
          equals: codigo,
        },
      },
    });
  }

  return new Response(
    JSON.stringify({
      cliente,
    }),
    {
      headers: { "Content-Type": "application/json" },
      status: 200,
    }
  );
};
