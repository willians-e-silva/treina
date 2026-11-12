import { Redirect, router } from 'expo-router';

import { BodyDataStep, type BodyDataValues } from '@/components/signup/body-data-step';
import { useSession } from '@/context/session';
import { useSignup } from '@/context/signup';
import { AuthError } from '@/lib/auth';

/** Step 2: birth date, sex, height and current weight. */
export default function SignupDetailsScreen() {
  const { signUp } = useSession();
  const { account } = useSignup();

  // Reached without the first step, e.g. a reload on web.
  if (!account) return <Redirect href="/signup" />;

  async function submit(body: BodyDataValues) {
    if (!account) return;
    const { needsConfirmation } = await signUp({ ...account, ...body });
    if (needsConfirmation) {
      router.push({ pathname: '/signup/confirm', params: { email: account.email } });
    }
    // Otherwise the user is signed in, and the root layout's guard swaps the
    // sign-up for the tabs.
  }

  return (
    <BodyDataStep
      step={2}
      steps={3}
      title="Sobre você"
      description="Usamos esses dados para estimar suas calorias e acompanhar seu progresso."
      submitLabel="Criar conta"
      onSubmit={submit}
      toMessage={(e) =>
        e instanceof AuthError ? e.message : 'Não foi possível criar a conta. Tente novamente.'
      }
    />
  );
}
