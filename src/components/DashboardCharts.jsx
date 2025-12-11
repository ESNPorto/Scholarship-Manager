import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';

// ESN Color Palette
const COLORS = ['#00aeef', '#ec008c', '#7ac143', '#f47b20', '#2e3192'];

import { Users, FileCheck, Hourglass } from 'lucide-react';

const DashboardCharts = ({ applications, stats }) => {
    // --- Data Processing for Charts ---
    const chartData = useMemo(() => {
        if (!applications || !applications.length) {
            return {
                destinations: [],
                overview: [
                    { name: 'Reviewed', value: 0 },
                    { name: 'Pending', value: 0 }
                ]
            };
        }

        // 1. Top Destinations
        const destinationCounts = {};
        applications.forEach(app => {
            const country = app.destinationCountry || 'Unknown';
            destinationCounts[country] = (destinationCounts[country] || 0) + 1;
        });

        const destinations = Object.entries(destinationCounts)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5); // Top 5

        // 2. Overview Data (Reviewed vs Pending)
        const overview = [
            { name: 'Reviewed', value: stats.reviewed },
            { name: 'Pending', value: stats.pending }
        ];

        return { destinations, overview };
    }, [applications, stats]);



    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Overview Chart */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Overview</h3>
                <div className="h-64 w-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={chartData.overview}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                <Cell fill="#7ac143" /> {/* Reviewed - ESN Green */}
                                <Cell fill="#2e3192" /> {/* Pending - ESN Dark Blue */}
                            </Pie>
                            <Tooltip
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                            <Legend
                                verticalAlign="bottom"
                                height={36}
                                iconType="circle"
                                iconSize={8}
                                wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                    {/* Centered Total Label */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
                        <span className="text-3xl font-bold text-gray-900">{stats.total}</span>
                        <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">Total</span>
                    </div>
                </div>
            </div>

            {/* Top Destinations Chart */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Top Destinations</h3>
                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={chartData.destinations}
                            layout="vertical"
                            margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                        >
                            <XAxis type="number" hide />
                            <YAxis
                                type="category"
                                dataKey="name"
                                tick={{ fontSize: 12, fill: '#6b7280' }}
                                width={100}
                                interval={0}
                            />
                            <Tooltip
                                cursor={{ fill: '#f3f4f6' }}
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                            <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                                {chartData.destinations.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill="#2e3192" />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default DashboardCharts;
