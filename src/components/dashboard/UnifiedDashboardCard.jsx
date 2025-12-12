import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';
import { ESN_COLORS } from '../../constants/colors';
import { Play, ArrowRight, Layers, CheckCircle2 } from 'lucide-react';

const UnifiedDashboardCard = ({
    applications,
    stats,
    userRole,
    sessionStats,
    onStartSession,
    onResumeSession,
    reviewSession
}) => {
    // --- Data Processing for Global Chart (Right Zone) ---
    const chartData = useMemo(() => {
        if (!applications || !applications.length) {
            return [];
        }

        const destinationCounts = {};
        applications.forEach(app => {
            const country = app.destinationCountry || 'Unknown';
            destinationCounts[country] = (destinationCounts[country] || 0) + 1;
        });

        // Convert to array, sort, take top 5
        let data = Object.entries(destinationCounts)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5);

        const totalApps = applications.length;

        return data.map(item => ({
            ...item,
            percentage: ((item.value / totalApps) * 100).toFixed(1)
        }));
    }, [applications]);

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-gray-900 text-white text-xs px-3 py-2 rounded-lg shadow-xl animate-fade-in">
                    <p className="font-bold mb-1">{label}</p>
                    <p>{payload[0].value} applications</p>
                    <p className="text-gray-400">{payload[0].payload.percentage}% of total</p>
                </div>
            );
        }
        return null;
    };

    // --- Role Helpers ---
    const roleLabels = {
        president: 'President',
        eo: 'External Officer',
        cf: 'Fiscal Council'
    };

    // Mode determination
    const isPersonalMode = !!userRole && !!sessionStats;

    return (
        <div className="w-full bg-white rounded-[20px] border border-gray-100 shadow-[0_2px_20px_rgba(0,0,0,0.04),0_1px_3px_rgba(0,0,0,0.02)] p-8 md:px-10 md:py-8 hover:shadow-[0_4px_30px_rgba(0,0,0,0.08)] transition-all duration-300 ease-out group relative overflow-hidden">

            <div className="flex flex-col md:flex-row h-auto md:h-64 gap-8 md:gap-0 relative z-10">

                {/* ZONE 1: Adaptive Left Zone (~30%) */}
                <div className="w-full md:w-[35%] flex flex-col justify-center pr-0 md:pr-8 transition-all duration-500">

                    {!isPersonalMode ? (
                        // MODE 1: Admin / Overview
                        <div className="animate-fade-in">
                            <div className="flex flex-col">
                                <span className="text-[56px] md:text-[60px] font-extrabold text-gray-900 leading-none tracking-tight tabular-nums relative">
                                    {stats.total}
                                </span>
                                <span className="text-[11px] font-medium text-gray-400 uppercase tracking-[0.08em] mt-2 mb-6">
                                    Total Applications
                                </span>
                            </div>

                            <div className="flex items-center gap-3">
                                {/* Pending Badge */}
                                <div className="flex items-center gap-2 bg-[#2e319208] px-3 py-1.5 rounded-lg border border-[#2e319215]">
                                    <div className="w-2 h-2 rounded-full bg-esn-dark-blue status-dot-pulse"></div>
                                    <div className="flex flex-col leading-none">
                                        <span className="text-[10px] text-esn-dark-blue font-semibold uppercase tracking-wide opacity-70 mb-0.5">Pending</span>
                                        <span className="text-sm font-bold text-esn-dark-blue tabular-nums">{stats.pending}</span>
                                    </div>
                                </div>

                                {/* Reviewed Badge */}
                                <div className="flex items-center gap-2 bg-[#7ac14308] px-3 py-1.5 rounded-lg border border-[#7ac14315]">
                                    <div className="w-2 h-2 rounded-full bg-esn-green"></div>
                                    <div className="flex flex-col leading-none">
                                        <span className="text-[10px] text-esn-green font-semibold uppercase tracking-wide opacity-70 mb-0.5">Reviewed</span>
                                        <span className="text-sm font-bold text-esn-green tabular-nums">{stats.reviewed}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        // MODE 2: Personal Reviewer
                        <div className="animate-fade-in flex flex-col justify-center h-full">
                            {/* Header */}
                            <div className="flex items-center gap-2 mb-2">
                                <h3 className="text-lg font-bold text-gray-900 tracking-tight">Your Progress</h3>
                                <span className="px-2 py-0.5 rounded-full bg-esn-dark-blue/5 text-esn-dark-blue text-[10px] font-bold uppercase tracking-wide border border-esn-dark-blue/10">
                                    {roleLabels[userRole] || userRole}
                                </span>
                            </div>

                            {/* Text */}
                            <p className="text-sm text-gray-500 font-medium mb-4">
                                You have reviewed <span className="text-gray-900 font-bold">{sessionStats.reviewedCount}</span> out of <span className="text-gray-900 font-bold">{sessionStats.total}</span> apps.
                            </p>

                            {/* Progress Bar */}
                            <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden mb-6 w-full">
                                <div
                                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-esn-green to-emerald-500 transition-all duration-1000 ease-out"
                                    style={{ width: `${sessionStats.percentage}%` }}
                                />
                            </div>

                            {/* Action Button */}
                            {sessionStats.pendingCount === 0 ? (
                                <div className="flex items-center gap-3 text-esn-green bg-esn-green/5 p-3 rounded-xl border border-esn-green/10">
                                    <CheckCircle2 className="w-5 h-5" />
                                    <span className="text-sm font-bold">All caught up!</span>
                                </div>
                            ) : (
                                <button
                                    onClick={reviewSession?.isActive ? onResumeSession : onStartSession}
                                    className={`relative w-full group/btn flex items-center justify-center gap-2 px-5 py-3 font-bold rounded-xl transition-all duration-300 shadow-lg active:scale-[0.98] ${reviewSession?.isActive
                                            ? 'bg-gray-900 text-white hover:bg-black shadow-gray-900/20'
                                            : 'bg-esn-dark-blue text-white hover:bg-blue-900 shadow-esn-dark-blue/20'
                                        }`}
                                >
                                    <Play className="w-3.5 h-3.5 fill-current" />
                                    <span className="text-sm">{reviewSession?.isActive ? 'Resume Session' : 'Start Session'}</span>
                                    <ArrowRight className="w-3.5 h-3.5 opacity-50 group-hover/btn:translate-x-1 group-hover/btn:opacity-100 transition-all" />
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* ZONE 2: Divider */}
                <div className="hidden md:block w-px bg-gradient-to-b from-gray-200 via-gray-100 to-transparent mx-4 h-full opacity-60"></div>
                {/* Mobile Divider */}
                <div className="block md:hidden h-px w-full bg-gradient-to-r from-gray-200 via-gray-100 to-transparent my-6"></div>


                {/* ZONE 3: Top Destinations Chart (Right, ~70%) */}
                <div className="w-full md:w-[65%] flex flex-col pl-0 md:pl-4">
                    <div className="flex justify-between items-center mb-4 md:mb-2">
                        <h3 className="text-base font-bold text-gray-900">Top Destinations</h3>
                    </div>

                    <div className="h-64 md:h-auto md:flex-1 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={chartData}
                                layout="vertical"
                                barSize={32}
                                margin={{ top: 0, right: 30, left: 0, bottom: 0 }}
                                barGap={8}
                            >
                                <XAxis type="number" hide />
                                <YAxis
                                    type="category"
                                    dataKey="name"
                                    width={110}
                                    tick={{
                                        fontSize: 13,
                                        fill: '#4b5563',
                                        fontWeight: 500,
                                        fontFamily: 'inherit'
                                    }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f3f4f6', radius: 8 }} />
                                <Bar
                                    dataKey="value"
                                    radius={[0, 6, 6, 0]}
                                    fill={ESN_COLORS.DARK_BLUE}
                                    animationDuration={1500}
                                    animationEasing="ease-out"
                                >
                                    <LabelList
                                        dataKey="value"
                                        position="right"
                                        fill="#111827"
                                        fontSize={13}
                                        fontWeight={700}
                                        offset={8}
                                    />
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UnifiedDashboardCard;
