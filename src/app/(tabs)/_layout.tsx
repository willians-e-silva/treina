import AppTabs from '@/components/app-tabs';
import { CompleteProfile } from '@/components/complete-profile';
import { MainFlowLoading } from '@/components/main-flow-loading';
import { useSession } from '@/context/session';
import { useMainFlowBootstrap } from '@/hooks/use-main-flow-bootstrap';
import { useUserDataStatus } from '@/hooks/use-user-data-status';
import { isProfileIncomplete } from '@/lib/profile';

const DATA_ERROR = 'Não foi possível carregar seus dados. Verifique sua conexão e tente novamente.';

export default function TabLayout() {
  const { signOut, profile } = useSession();
  const { state, retry } = useMainFlowBootstrap();
  const data = useUserDataStatus();

  // The tabs only mount once ready, so they always start on the first tab.
  if (state.status === 'error' || data.status === 'error') {
    return (
      <MainFlowLoading
        status="error"
        message={state.status === 'error' ? state.message : DATA_ERROR}
        onRetry={() => {
          if (state.status === 'error') retry();
          data.retry();
        }}
        onSignOut={signOut}
      />
    );
  }
  if (state.status === 'loading' || data.status === 'loading') {
    return <MainFlowLoading status="loading" />;
  }
  // E.g. a first sign-in with Google: asks for the body data before the tabs.
  if (profile && isProfileIncomplete(profile)) {
    return <CompleteProfile profile={profile} />;
  }
  return <AppTabs />;
}
