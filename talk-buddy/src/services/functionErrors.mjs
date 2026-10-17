export async function functionErrorMessage(name, error, origin) {
  const unavailable = `AI practice is unavailable. The ${name} server function needs to be deployed, or its connection settings need attention.`;
  const status = error.context?.status;
  if (status === 404) return unavailable;
  if (status === 401)
    return "Your sign-in has expired. Refresh this page to reconnect.";
  try {
    const body = await error.context.json();
    if (typeof body.error === "string" && body.error.trim()) return body.error;
    if (typeof body.message === "string" && body.message.trim())
      return body.message;
  } catch {
    /* Fetch failures and CORS failures do not expose a JSON response. */
  }
  if (
    error.name === "FunctionsFetchError" ||
    error.name === "FunctionsRelayError"
  ) {
    return `${unavailable} Check that Supabase allows requests from ${origin}.`;
  }
  return error.message || unavailable;
}
