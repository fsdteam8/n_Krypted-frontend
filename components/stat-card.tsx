import type React from "react";
import { Card, CardContent } from "@/components/ui/card";

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  iconColor: string;
}

export function StatCard({ title, value, icon, iconColor }: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-6 bg-[#FFFFFF] shadow-lg rounded-[8px]">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className={`rounded-full p-2 ${iconColor}`}>{icon}</div>
            <span className="text-[18px] text-[#595959] font-medium">
              {title}
            </span>
          </div>
        </div>
        <div className="mt-3">
          <div className="text-[32px] text-[#212121] font-semibold">
            {value}
          </div>
          <div className="mt-1 flex items-center text-sm"></div>
        </div>
      </CardContent>
    </Card>
  );
}
