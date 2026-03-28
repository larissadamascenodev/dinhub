import { Outlet } from "react-router-dom";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import MobileBottomNav from "@/components/dashboard/MobileBottomNav";
import { useProfile } from "@/hooks/useProfile";

const DashboardLayout = () => {
  const { profile } = useProfile();

  return (
    <div className="dark min-h-screen bg-background text-foreground">
      <div className="max-w-7xl mx-auto px-4 md:px-6 pt-0 pb-24 md:pb-8">
        <DashboardHeader profile={profile} />
        <Outlet context={{ profile }} />
      </div>
      <MobileBottomNav />
    </div>
  );
};

export default DashboardLayout;
