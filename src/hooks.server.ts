import { auth } from "$lib/server/lucia";
import { redirect, type Handle } from "@sveltejs/kit";
import { sequence } from "@sveltejs/kit/hooks";

const auth_handle: Handle = async ({ event, resolve }) => {
  const protected_urls =
    event.url.pathname.startsWith("/facturar") ||
    event.url.pathname.startsWith("/facturas") ||
    event.url.pathname.startsWith("/tracking") ||
    event.url.pathname.startsWith("/password_update") ||
    event.url.pathname.startsWith("/clientes");

  const { user } = await event.locals.auth.validateUser();
  if (protected_urls) {
    if (!user) {
      throw redirect(303, "/login");
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
