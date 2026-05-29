import AccountClient from "./AccountClient";

export const metadata = {
  title: "Account — PhyCalcPro",
  description: "Manage your PhyCalcPro plan and optional cloud sign-in.",
};

export default function AccountPage() {
  return (
    <div className="bg-slate-50 px-4 py-16 dark:bg-slate-950">
      <AccountClient />
    </div>
  );
}
