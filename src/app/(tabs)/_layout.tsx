import AppTabs from '@/components/app-tabs';
import { MainFlowLoading } from '@/components/main-flow-loading';
import { useSession } from '@/context/session';
import { useMainFlowBootstrap } from '@/hooks/use-main-flow-bootstrap';

export default function TabLayout() {
  const { session, signOut } = useSession();
  const { state, retry } = useMainFlowBootstrap(session);

  // The tabs only mount once ready, so they always start on the first tab.
  if (state.status === 'loading') {
    return <MainFlowLoading status="loading" />;
  }
  if (state.status === 'error') {
    return (
      <MainFlowLoading
        status="error"
        message={state.message}
        onRetry={retry}
        onSignOut={signOut}
      />
    );
  }
  return <AppTabs />;
}
