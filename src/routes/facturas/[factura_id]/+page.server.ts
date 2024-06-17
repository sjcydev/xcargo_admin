import type { PageServerLoad } from "./$types";
import { prisma } from "$lib/server/prisma";
import { redirect, error, fail, type Actions } from "@sveltejs/kit";
import type { Facturas, MetodoPago, Trackings } from "@prisma/client";
import { getToday } from "$lib/utils/datehandler";

export const load: PageServerLoad = async ({ locals, params }) => {
  const { user } = await locals.auth.validateUser();

  if (!user) {
    throw redirect(302, "/login");
  }

  let factura;
  let cliente;

  const factura_id = parseInt(params.factura_id);
  if (factura_id) {
    factura = await prisma.facturas.findUnique({
      where: {
        factura_id,
      },
      include: {
        trackings: true,
      },
    });

    cliente = await prisma.usuarios.findFirst({
      where: {
        id: {
          equals: factura?.casillero,
        },
      },
    });
  }

  if (!factura) throw error(404, "Factura No Encontrada");
  return { factura, cliente, user };
};

export const actions: Actions = {
  metodo_de_pago: async ({ request }) => {
    const formData = await request.formData();

    const metodoPago = formData.get("metodopago") as MetodoPago;
    const factura_id = Number(formData.get("factura_id"));

    if (metodoPago !== null) {
      const fechaPagado = getToday().toJSDate();

      await prisma.facturas.update({
        where: {
          factura_id,
        },
        data: {
          metodo_de_pago: metodoPago,
          pagado: true,
          pagadoAt: fechaPagado,
        },
      });
    } else {
      await prisma.facturas.update({
        where: {
          factura_id,
        },
        data: {
          metodo_de_pago: metodoPago,
          pagado: false,
        },
      });
    }

    return { success: true };
  },
  marcarPago: async ({ request }) => {
    const formData = await request.formData();

    let factura_id = Number(formData.get("factura_id"));
    const pagado = formData.get("estadopago");

    let pago = true;
    if (pagado === "false") pago = false;

    const fechaPagado = pago ? getToday().toJSDate() : null;

    await prisma.facturas.update({
      where: {
        factura_id,
      },
      data: {
        pagado: pago,
        pagadoAt: fechaPagado,
      },
    });

    return { success: true };
  },
  marcarRetirados: async ({ request }) => {
    const formData = await request.formData();

    let factura = JSON.parse(String(formData.get("factura"))) as Facturas & {
      trackings: Trackings[];
    };

    let retirados = true;

    for (let i = 0; i < factura.trackings.length; i++) {
      let tracking = factura.trackings[i];

      await prisma.trackings.update({
        where: {
          tracking_id: tracking.tracking_id,
        },
        data: {
          retirado: tracking.retirado,
        },
      });
      if (!tracking.retirado) {
        retirados = false;
      }
    }

    await prisma.facturas.update({
      where: {
        factura_id: factura.factura_id,
      },
      data: {
        retirados,
      },
    });

    return { success: true };
  },
};
