import AccountClient from "./AccountClient";

export const metadata = {
  title: "Account",
  description: "Manage your PhyCalcPro plan and optional cloud sign-in.",
  robots: { index: false, follow: true },
};

export default function AccountPage() {
  return (
    <div className="bg-slate-50 px-4 py-16 dark:bg-slate-950">
      <AccountClient />
    </div>
  );
}
