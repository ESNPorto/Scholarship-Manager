import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1'];

const DashboardCharts = ({ applications }) => {
    // --- Data Processing for Charts ---
    const chartData = useMemo(() => {
        if (!applications.length) return { destinations: [], universities: [] };

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

        // 2. Applicants by University
        const uniCounts = {};
        applications.forEach(app => {
            let uni = app.university || 'Unknown';
            // Simple normalization to avoid duplicates if needed, or just take raw
            uniCounts[uni] = (uniCounts[uni] || 0) + 1;
        });

        const universities = Object.entries(uniCounts)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5); // Top 5, others could be grouped but keeping simple for now

        return { destinations, universities };
    }, [applications]);

    if (applications.length === 0) return null;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
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
                                    <Cell key={`cell-${index}`} fill="#6366f1" />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Applicants by University Chart */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Applicants by University</h3>
                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={chartData.universities}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {chartData.universities.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
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
                                formatter={(value) => (
                                    <span title={value} className="text-gray-600 font-medium">
                                        {value.length > 15 ? `${value.substring(0, 15)}...` : value}
                                    </span>
                                )}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default DashboardCharts;
