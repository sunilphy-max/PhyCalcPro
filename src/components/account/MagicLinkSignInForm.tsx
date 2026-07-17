"use client";

import AuthForm from "@/components/account/AuthForm";

type MagicLinkSignInFormProps = {
  compact?: boolean;
  onSuccess?: () => void;
  className?: string;
};

/** @deprecated Prefer AuthForm — kept for existing imports. */
export default function MagicLinkSignInForm(props: MagicLinkSignInFormProps) {
  return <AuthForm {...props} defaultMode="magic" />;
}
