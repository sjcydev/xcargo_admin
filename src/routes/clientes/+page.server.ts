import type { PageServerLoad } from "./$types";
import { prisma } from "$lib/server/prisma";

export const load: PageServerLoad = async () => {
  const usuarios = prisma.usuarios.findMany({
    orderBy: [
      {
        casillero: "asc",
      },
    ],
  });

  return { usuarios };
};
