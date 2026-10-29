import { createContext, use, useState, type PropsWithChildren } from 'react';

/** Account step of the sign-up, kept while the user fills in the next one. */
export type SignupAccount = {
  name: string;
  email: string;
  password: string;
};

type SignupContextValue = {
  account: SignupAccount | null;
  setAccount: (account: SignupAccount) => void;
};

const SignupContext = createContext<SignupContextValue | null>(null);

export function useSignup() {
  const value = use(SignupContext);
  if (!value) {
    throw new Error('useSignup must be wrapped in a <SignupProvider />');
  }
  return value;
}

/** Wraps the sign-up screens so their data survives moving between steps. */
export function SignupProvider({ children }: PropsWithChildren) {
  const [account, setAccount] = useState<SignupAccount | null>(null);
  return <SignupContext value={{ account, setAccount }}>{children}</SignupContext>;
}
