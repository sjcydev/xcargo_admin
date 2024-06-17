import type { LayoutServerLoad } from "./$types";
import { Settings } from "luxon";

Settings.defaultZone = "America/Panama";

export const load: LayoutServerLoad = async ({ locals }) => {
  const { user } = await locals.auth.validateUser();

  return { user };
};
