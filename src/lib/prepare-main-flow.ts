/**
 * Work that must finish before the main tabs are shown after a login, such as
 * fetching the user's profile or initial data for the home tab. It runs once
 * per sign-in, while the loading screen is visible; a thrown error shows the
 * retry screen.
 *
 * The home tab does not depend on any remote data yet, so there is nothing to
 * wait for and this resolves right away. Add real requests here — never an
 * artificial delay.
 */
export async function prepareMainFlow(_session: string): Promise<void> {}
