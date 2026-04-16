import React from "react";

import {
    ResponsiveContainer,
    BarChart,
    Bar,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    RadarChart,
    Radar,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis
} from 'recharts';

const CHART_COLORS = [
    // 🔹 Anchors (locked)
    '#00b5a4', // teal
    '#ff7300', // orange

    // 🔵 Blues (clearly separated)
    '#1f77b4', // steel blue
    '#e9d8a6', // pale sand
    '#d62728', // red
    '#2ca02c', // green

    // 🟣 Purples (jump away from blue)
    '#7a5195', // muted purple
    '#bc5090', // magenta

    // 🔴 Reds (only one, orange-safe)


    // 🟡 Yellows (bright but readable)
    '#f2c14e', // warm yellow


    // 🟢 Greens (non-teal)

    '#006400', // dark green

    // 🟤 Browns (underrated but great separators)
    '#8c564b', // brown
    '#c49c94', // tan

    // ⚪ Neutrals
    '#7f7f7f', // mid gray
    '#c7c7c7'  // light gray
];

const ChartDisplay = React.memo(function ChartDisplay({ chartConfig }) {
    // Handle error state
    if (chartConfig?.error) {
        return (
            <div className="chart-error">
                <p>Unable to generate chart: {chartConfig.error}</p>
            </div>
        );
    }

    // Validate chart config
    if (!chartConfig || !chartConfig.data || !Array.isArray(chartConfig.data) || chartConfig.data.length === 0) {
        return null;
    }

    const { type, title, xKey, yKeys, yLabels, data } = chartConfig;

    // Default to yKeys if yLabels not provided
    const labels = yLabels || yKeys;

    return (
        <div className="chart-container">
            {title && <h3 className="chart-title">{title}</h3>}
            <ResponsiveContainer width="100%" height={300}>
                {type === 'bar' ? (
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                        <XAxis
                            dataKey={xKey}
                            stroke="#9ca3af"
                            style={{ fontSize: '12px' }}
                        />
                        <YAxis
                            stroke="#9ca3af"
                            style={{ fontSize: '12px' }}
                        />
                        <Tooltip
                            wrapperStyle={{
                                zIndex: 1000,
                                pointerEvents: 'none'
                            }}
                            contentStyle={{
                                backgroundColor: '#020e1c', // NO rgba
                                border: '1px solid rgba(255,255,255,0.2)',
                                borderRadius: '8px',
                                color: '#f3f4f6'
                            }}
                        />
                        <Legend
                            wrapperStyle={{ color: '#f3f4f6', fontSize: '10px', marginTop: '5px' }}
                        />
                        {yKeys.map((key, index) => (
                            <Bar
                                key={key}
                                dataKey={key}
                                name={labels[index] || key}
                                fill={CHART_COLORS[index % CHART_COLORS.length]}
                            />
                        ))}
                    </BarChart>
                ) : type === 'stackedBar' ? (
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis dataKey={xKey} stroke="#9ca3af" />
                        <YAxis stroke="#9ca3af" />
                        <Tooltip
                            wrapperStyle={{
                                zIndex: 1000,
                                pointerEvents: 'none'
                            }}
                            contentStyle={{
                                backgroundColor: '#020e1c', // NO rgba
                                border: '1px solid rgba(255,255,255,0.2)',
                                borderRadius: '8px',
                                color: '#f3f4f6'
                            }}
                        />
                        <Legend
                            wrapperStyle={{ color: '#f3f4f6', fontSize: '10px', marginTop: '5px' }}
                        />

                        {yKeys.map((key, index) => (
                            <Bar
                                key={key}
                                dataKey={key}
                                name={labels[index] || key}
                                stackId="total"
                                fill={CHART_COLORS[index % CHART_COLORS.length]}
                            />
                        ))}
                    </BarChart>
                ) : type === 'radar' ? (
                    <RadarChart data={data}>
                        <PolarGrid stroke="rgba(255,255,255,0.2)" />
                        <PolarAngleAxis dataKey={xKey} stroke="#9ca3af" />
                        <PolarRadiusAxis stroke="#9ca3af" />
                        <Tooltip
                            allowEscapeViewBox={{ x: true, y: true }}
                            wrapperStyle={{
                                zIndex: 1000,
                                pointerEvents: 'none'
                            }}
                            contentStyle={{
                                backgroundColor: '#020e1c',
                                border: '1px solid rgba(255,255,255,0.2)',
                                borderRadius: '8px',
                                color: '#f3f4f6'
                            }}
                        />
                        <Legend
                            wrapperStyle={{ color: '#f3f4f6', fontSize: '10px', marginTop: '5px' }}
                        />
                        {yKeys.map((key, index) => (
                            <Radar
                                key={key}
                                name={labels[index] || key}
                                dataKey={key}
                                stroke={CHART_COLORS[index % CHART_COLORS.length]}
                                fill={CHART_COLORS[index % CHART_COLORS.length]}
                                fillOpacity={0.4}
                            />
                        ))}
                    </RadarChart>
                    ) : (
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                        <XAxis
                            dataKey={xKey}
                            stroke="#9ca3af"
                            style={{ fontSize: '12px' }}
                        />
                        <YAxis
                            stroke="#9ca3af"
                            style={{ fontSize: '12px' }}
                        />
                        <Tooltip
                            wrapperStyle={{
                                zIndex: 1000,
                                pointerEvents: 'none'
                            }}
                            contentStyle={{
                                backgroundColor: '#020e1c', // NO rgba
                                border: '1px solid rgba(255,255,255,0.2)',
                                borderRadius: '8px',
                                color: '#f3f4f6'
                            }}
                        />
                        <Legend
                            wrapperStyle={{ color: '#f3f4f6', fontSize: '12px' }}
                        />
                        {yKeys.map((key, index) => (
                            <Line
                                key={key}
                                type="monotone"
                                dataKey={key}
                                name={labels[index] || key}
                                stroke={CHART_COLORS[index % CHART_COLORS.length]}
                                strokeWidth={2}
                                dot={{ fill: CHART_COLORS[index % CHART_COLORS.length], r: 4 }}
                                activeDot={{ r: 6 }}
                            />
                        ))}
                    </LineChart>
                )}
            </ResponsiveContainer>
        </div>
    );
});

export default ChartDisplay;


