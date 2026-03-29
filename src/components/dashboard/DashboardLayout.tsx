import { Outlet } from "react-router-dom";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import MobileBottomNav from "@/components/dashboard/MobileBottomNav";
import { useProfile } from "@/hooks/useProfile";
import { MonthProvider } from "@/contexts/MonthContext";

const DashboardLayout = () => {
  const { profile } = useProfile();

  return (
    <MonthProvider>
      <div className="dark min-h-screen bg-background text-foreground">
        <div className="w-full mx-auto px-4 md:px-6 lg:px-8 xl:px-12 pt-0 pb-24 md:pb-8">
          <DashboardHeader profile={profile} />
          <Outlet context={{ profile }} />
        </div>
        <MobileBottomNav />
      </div>
    </MonthProvider>
  );
};

export default DashboardLayout;
