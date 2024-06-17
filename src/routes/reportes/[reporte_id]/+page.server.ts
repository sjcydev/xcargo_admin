import type { PageServerLoad } from "./$types";
import { prisma } from "$lib/server/prisma";
import { redirect, error, fail, type Actions } from "@sveltejs/kit";
import type { Facturas, MetodoPago, Trackings } from "@prisma/client";

export const load: PageServerLoad = async ({ locals, params }) => {
  const { user } = await locals.auth.validateUser();

  if (!user) {
    throw redirect(302, "/login");
  }

  let reporte;
  let facturas;
  let porMetodo;

  const reporte_id = parseInt(params.reporte_id);
  if (reporte_id) {
    reporte = await prisma.reportes.findUnique({
      where: {
        reporte_id,
      },
    });

    facturas = await prisma.facturas.findMany({
      where: {
        pagadoAt: {
          lte: reporte?.fechaFinal,
          gte: reporte?.fechaInicial,
        },
      },
    });

    porMetodo = reporte?.metodo_de_pago;
  }

  if (!reporte) throw error(404, "Reporte no encontrado");
  return { reporte, facturas, porMetodo };
};

// export const actions: Actions = {
//   metodo_de_pago: async ({ request }) => {
//     const formData = await request.formData();

//     const metodoPago = formData.get("metodopago") as MetodoPago;
//     const factura_id = Number(formData.get("factura_id"));

//     await prisma.facturas.update({
//       where: {
//         factura_id,
//       },
//       data: {
//         metodo_de_pago: metodoPago,
//       },
//     });

//     return { success: true };
//   },
//   marcarPago: async ({ request }) => {
//     const formData = await request.formData();

//     let factura_id = Number(formData.get("factura_id"));
//     const pagado = formData.get("estadopago");

//     let pago = true;
//     if (pagado === "false") pago = false;

//     const fechaPagado = pago ? new Date() : null;

//     await prisma.facturas.update({
//       where: {
//         factura_id,
//       },
//       data: {
//         pagado: pago,
//         pagadoAt: fechaPagado,
//       },
//     });

//     return { success: true };
//   },
//   marcarRetirados: async ({ request }) => {
//     const formData = await request.formData();

//     let factura = JSON.parse(String(formData.get("factura"))) as Facturas & {
//       trackings: Trackings[];
//     };

//     for (let i = 0; i < factura.trackings.length; i++) {
//       let tracking = factura.trackings[i];

//       await prisma.trackings.update({
//         where: {
//           tracking_id: tracking.tracking_id,
//         },
//         data: {
//           retirado: tracking.retirado,
//         },
//       });
//     }

//     return { success: true };
//   },
// };
