import type { RequestEvent } from "./$types";

export const POST = async ({ request, params }: RequestEvent) => {
  const { usuario } = await request.json();
  let { nombre, apellido, casillero, correo, telefono } = usuario;

  casillero = parseInt(casillero);

  try {
    const updatedCliente = await prisma.usuarios.update({
      where: {
        id: parseInt(params.id),
      },
      data: {
        nombre,
        casillero,
        apellido,
        correo,
        telefono,
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
      message: "Casillero Actualizado",
      status: "success",
    }),
    {
      headers: { "Content-Type": "application/json" },
      status: 200,
    }
  );
};
