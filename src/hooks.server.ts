import { auth } from "$lib/server/lucia";
import { redirect, type Handle } from "@sveltejs/kit";
import { sequence } from "@sveltejs/kit/hooks";

const auth_handle: Handle = async ({ event, resolve }) => {
  const protected_urls =
    event.url.pathname.startsWith("/facturar") ||
    event.url.pathname.startsWith("/facturas") ||
    event.url.pathname.startsWith("/tracking") ||
    event.url.pathname.startsWith("/registrar_cliente") ||
    event.url.pathname.startsWith("/clientes");

  const { user } = await event.locals.auth.validateUser();

  if (event.url.pathname === "/registrar" && user) {
    if (user?.rol !== "ADMIN") {
      throw redirect(303, "/");
    }
  }

  if (event.url.pathname.startsWith("/reportes") && user) {
    if (user?.rol === "EMPLEADO") {
      throw redirect(303, "/");
    }
  }

  if (
    event.url.pathname === "/password_updated" &&
    user &&
    user.password_updated
  ) {
    throw redirect(303, "/");
  }

  if (protected_urls) {
    if (!user) {
      throw redirect(303, "/login");
    }

    if (!user.password_updated) {
      throw redirect(303, "/password_update");
    }
  }

  return await resolve(event);
};

const lucia_handle: Handle = async ({ event, resolve }) => {
  let authRequest = auth.handleRequest(event);
  event.locals.auth = authRequest;

  return await resolve(event);
};

export const handle: Handle = sequence(lucia_handle, auth_handle);
