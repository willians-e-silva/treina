import { useEffect, useState } from 'react';

import { useSession } from '@/context/session';
import { prepareMainFlow } from '@/lib/prepare-main-flow';

export type BootstrapState =
  { status: 'loading' } | { status: 'ready' } | { status: 'error'; message: string };

/**
 * Runs `prepareMainFlow` for the signed-in user, hands the profile to the
 * session and tracks its progress. The hook lives in the tabs layout, which
 * unmounts on sign-out, so every new sign-in starts from a fresh `loading` state.
 */
export function useMainFlowBootstrap() {
  const { user, setProfile } = useSession();
  const [state, setState] = useState<BootstrapState>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    // The root layout's guard only mounts the tabs with a session; this covers
    // the frame where sign-out clears it before the tabs unmount.
    if (!user) return;
    let cancelled = false;

    prepareMainFlow(user).then(
      (profile) => {
        if (cancelled) return;
        setProfile(profile);
        setState({ status: 'ready' });
      },
      (error: unknown) => {
        if (cancelled) return;
        console.warn('Failed to prepare the main flow', error);
        setState({
          status: 'error',
          message:
            'Não foi possível carregar o aplicativo. Verifique sua conexão e tente novamente.',
        });
      },
    );

    return () => {
      cancelled = true;
    };
  }, [user, setProfile, attempt]);

  function retry() {
    setState({ status: 'loading' });
    setAttempt((value) => value + 1);
  }

  return { state, retry };
}
