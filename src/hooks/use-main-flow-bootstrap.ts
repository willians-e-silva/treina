import { useEffect, useState } from 'react';

import { prepareMainFlow } from '@/lib/prepare-main-flow';

export type BootstrapState =
  | { status: 'loading' }
  | { status: 'ready' }
  | { status: 'error'; message: string };

/**
 * Runs `prepareMainFlow` for the given session and tracks its progress.
 * The hook lives in the tabs layout, which unmounts on sign-out, so every new
 * sign-in starts from a fresh `loading` state.
 */
export function useMainFlowBootstrap(session: string | null) {
  const [state, setState] = useState<BootstrapState>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    // The root layout's guard only mounts the tabs with a session; this covers
    // the frame where sign-out clears it before the tabs unmount.
    if (!session) return;
    let cancelled = false;

    prepareMainFlow(session).then(
      () => {
        if (!cancelled) setState({ status: 'ready' });
      },
      (error: unknown) => {
        if (cancelled) return;
        console.warn('Failed to prepare the main flow', error);
        setState({
          status: 'error',
          message: 'Não foi possível carregar o aplicativo. Verifique sua conexão e tente novamente.',
        });
      },
    );

    return () => {
      cancelled = true;
    };
  }, [session, attempt]);

  function retry() {
    setState({ status: 'loading' });
    setAttempt((value) => value + 1);
  }

  return { state, retry };
}
