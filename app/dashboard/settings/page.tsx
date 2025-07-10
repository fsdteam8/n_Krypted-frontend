"use client";
import Layout from "@/components/dashboard/layout";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Setting</h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/dashboard" className="hover:underline">
              Dashboard
            </Link>
            <span>→</span>
            <span>Setting</span>
          </div>
        </div>

        <div className="space-y-4">
          <SettingCard
            title="Personal Information"
            href="/dashboard/settings/personal-information"
          />
          <SettingCard
            title="Change Password"
            href="/dashboard/settings/change-password"
          />
          {/* <SettingCard
            title="Terms & conditions"
            href="/dashboard/settings/terms-conditions"
          />
          <SettingCard
            title="Privacy Policy"
            href="/dashboard/settings/privacy-policy"
          /> */}
        </div>
      </div>
    </Layout>
  );
}

interface SettingCardProps {
  title: string;
  href: string;
}

function SettingCard({ title, href }: SettingCardProps) {
  return (
    <div className="bg-white space-y-2 rounded-lg">
      <Link href={href}>
        <Card className="">
          <CardContent className="flex items-center justify-between p-4  space-y-2">
            <h3 className="text-lg font-medium">{title}</h3>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </CardContent>
        </Card>
      </Link>
    </div>
  );
}
