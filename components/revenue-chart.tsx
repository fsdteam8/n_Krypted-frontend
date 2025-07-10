"use client"

import { useState } from "react"
import { Area, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { useRevenueData } from "./user_revenue_data"


export function RevenueChart() {
    const { data, isLoading, error, refetch } = useRevenueData()
    const [hoveredData, setHoveredData] = useState<{ revenue: number; booking: number } | null>(null)

    const formatYAxis = (value: number) => {
        if (value === 0) return "0"
        if (value < 1000) return `$${value}`
        if (value < 1000000) return `$${(value / 1000).toFixed(1)}k`
        return `$${(value / 1000000).toFixed(1)}M`
    }

    const getMaxValue = () => {
        if (!data) return 1200
        const maxRevenue = Math.max(...data.map((d) => d.revenue))
        const maxBooking = Math.max(...data.map((d) => d.booking))
        const max = Math.max(maxRevenue, maxBooking)
        // Round up to nearest 200
        return Math.ceil(max / 200) * 200 || 1200
    }

    /* eslint-disable @typescript-eslint/no-explicit-any */
    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="rounded-lg border bg-[#BABABA] p-2 shadow-sm">
                    <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center">
                            <div className="mr-2 h-2 w-2 rounded-full bg-[#10B981]"></div>
                            <span className="text-xs">Revenue:</span>
                            <span className="ml-1 font-bold text-xs">${payload[0].value}</span>
                        </div>
                        <div className="flex items-center">
                            <div className="mr-2 h-2 w-2 rounded-full bg-[#3B82F6]"></div>
                            <span className="text-xs">Booking:</span>
                            <span className="ml-1 font-bold text-xs">{payload[1].value}</span>
                        </div>
                    </div>
                </div>
            )
        }
        return null
    }

    if (isLoading) {
        return (
            <div className="h-[400px] w-full flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#10B981] mx-auto mb-2"></div>
                    <p className="text-sm text-gray-600">Loading chart data...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="h-[400px] w-full flex items-center justify-center">
                <div className="text-center">
                    <p className="text-sm text-red-600 mb-2">Failed to load chart data</p>
                    <button
                        onClick={() => refetch()}
                        className="px-4 py-2 bg-[#10B981] text-white rounded-md text-sm hover:bg-[#059669] transition-colors"
                    >
                        Retry
                    </button>
                </div>
            </div>
        )
    }

    if (!data || data.length === 0) {
        return (
            <div className="h-[400px] w-full flex items-center justify-center">
                <p className="text-sm text-gray-600">No data available</p>
            </div>
        )
    }

    const maxValue = getMaxValue()

    return (
        <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                    data={data}
                    margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
                    onMouseMove={(chartData) => {
                        if (chartData.activePayload) {
                            setHoveredData({
                                revenue: chartData.activePayload[0].value,
                                booking: chartData.activePayload[1].value,
                            })
                        }
                    }}
                    onMouseLeave={() => setHoveredData(null)}
                >
                    <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10B981" stopOpacity={0.1} />
                            <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorBooking" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.1} />
                            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#6B7280" }} />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: "#6B7280" }}
                        tickFormatter={formatYAxis}
                        domain={[0, maxValue]}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="#10B981"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorRevenue)"
                        dot={{ r: 0 }}
                        activeDot={{ r: 4, fill: "#10B981", stroke: "white", strokeWidth: 2 }}
                    />
                    <Line
                        type="monotone"
                        dataKey="booking"
                        stroke="#3B82F6"
                        strokeWidth={2}
                        dot={{ r: 0 }}
                        activeDot={{ r: 4, fill: "#3B82F6", stroke: "white", strokeWidth: 2 }}
                    />
                </ComposedChart>
            </ResponsiveContainer>
            {hoveredData && (
                <div className="mt-2 flex items-center justify-center space-x-4">
                    <div className="flex items-center">
                        <div className="mr-2 h-3 w-3 rounded-full bg-[#10B981]"></div>
                        <span className="text-sm">Revenue: ${hoveredData.revenue}</span>
                    </div>
                    <div className="flex items-center">
                        <div className="mr-2 h-3 w-3 rounded-full bg-[#3B82F6]"></div>
                        <span className="text-sm">Booking: {hoveredData.booking}</span>
                    </div>
                </div>
            )}
        </div>
    )
}
