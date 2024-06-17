import type { PageServerLoad } from "./$types";
import { prisma } from "$lib/server/prisma";
import type { Actions } from "@sveltejs/kit";
import { fail } from "@sveltejs/kit";
import { getDateFromISO } from "$lib/utils/datehandler";

export const load: PageServerLoad = async () => {
  const reportes = prisma.reportes.findMany({
    orderBy: [{ reporte_id: "desc" }],
  });

  return { reportes };
};

export const actions: Actions = {
  generarReporte: async ({ request }) => {
    const formData = await request.formData();

    const fechaInicial_temp = String(formData.get("fechaInicio")).split("-");
    const fechaFinal_temp = String(formData.get("fechaFinal")).split("-");

    if (
      (Number(fechaInicial_temp[0]) > Number(fechaFinal_temp[0]) &&
        Number(fechaInicial_temp[1]) === Number(fechaFinal_temp[1])) ||
      Number(fechaInicial_temp[1]) > Number(fechaFinal_temp[1])
    ) {
      const data = {
        data: Object.fromEntries(formData),
        error: {
          message: "Rango de fechas es invalida",
        },
      };
      return fail(400, data);
    }

    let fechaInicial = getDateFromISO(
      `${fechaInicial_temp[2]}-${fechaInicial_temp[1]}-${fechaInicial_temp[0]}T00:00:00`
    ).toJSDate();

    let fechaFinal = getDateFromISO(
      `${fechaFinal_temp[2]}-${fechaFinal_temp[1]}-${fechaFinal_temp[0]}T23:59:59`
    ).toJSDate();

    const facturas = await prisma.facturas.aggregate({
      where: {
        pagadoAt: {
          lte: fechaFinal,
          gte: fechaInicial,
        },
      },
      _count: true,
      _sum: {
        total: true,
      },
    });

    if (!facturas._sum.total) {
      const data = {
        data: Object.fromEntries(formData),
        error: {
          message: "No hay facturas pagadas en estas fechas",
        },
        close: true,
      };

      return fail(400, data);
    }

    let porMetodo = await prisma.facturas.groupBy({
      by: ["metodo_de_pago"],
      where: {
        pagadoAt: {
          lte: fechaFinal,
          gte: fechaInicial,
        },
      },
      _count: true,
      _sum: {
        total: true,
      },
    });

    await prisma.reportes.create({
      data: {
        fechaInicial,
        fechaFinal,
        facturas: facturas._count,
        total: facturas._sum.total || 0,
        metodo_de_pago: porMetodo,
      },
    });

    return {};
  },
};
