import type React from "react"
import { ArrowUpIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface StatCardProps {
    title: string
    value: string
    percentageChange: number
    trend: "up" | "down"
    description: string
    icon: React.ReactNode
    iconColor: string
}

export function StatCard({ title, value, percentageChange,  description, icon, iconColor }: StatCardProps) {
    return (
        <Card>
            <CardContent className="p-6 bg-[#FFFFFF] shadow-lg rounded-[8px]">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <div className={`rounded-full p-2 ${iconColor}`}>{icon}</div>
                        <span className="text-[18px] text-[#595959] font-medium">{title}</span>
                    </div>
                </div>
                <div className="mt-3">
                    <div className="text-[32px] text-[#212121] font-semibold">{value}</div>
                    <div className="mt-1 flex items-center text-sm">
                        <span className="flex items-center text-green-500">
                            {percentageChange}%
                            <ArrowUpIcon className="ml-1 h-3 w-3" />
                        </span>
                        <span className="ml-2 text-muted-foreground">• {description}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
