import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const BurndownChart = ({totalWeeks, totalStoryPoints, idealProgressRate, actualProgress}) => {
    let labels = [];
    for (var i=1; i <= totalWeeks; i++) {
        labels.push(i.toString())
    }

    let progressRate = [];
    for (var i=totalStoryPoints; i >= 0; i-=idealProgressRate) {
        progressRate.push(i)
    }

    const actualProcessLength = actualProgress.length
    if (actualProcessLength < progressRate.length) {
        for (var i=actualProcessLength-1; i < progressRate.length; i++) {
            actualProgress.push(actualProgress[actualProcessLength-1])
        }
    }

    const data = {
        labels: labels,
        datasets: [
            {
                label: 'Ideal Progress',
                data: progressRate,
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 2,
                fill: false,
                tension: 0.4
            },
            {
                label: 'Actual Progress',
                data: actualProgress,
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 2,
                fill: false,
                tension: 0.4
            }
        ]
    };

    const options = {
        responsive: true,
        plugins: {
            title: {
                display: true,
                text: 'Burndown Chart'
            },
            legend: {
                position: 'top',
            },
            tooltip: {
                mode: 'index',
                intersect: false,
            },
        },
        scales: {
            x: {
                title: {
                display: true,
                text: 'Week'
                }
            },
            y: {
                beginAtZero: true,
                title: {
                display: true,
                text: 'Story points'
                }
            }
        }
    };

    return <Line data={data} options={options} />;
};

export default BurndownChart;