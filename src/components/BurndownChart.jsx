import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const BurndownChart = () => {
    const labels = ['1', '2', '3', '4', '5', '6', '7'];
    const data = {
        labels: labels,
        datasets: [
            {
                label: 'Ideal Progress',
                data: [70, 60, 50, 40, 30, 20, 10, 0],
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 2,
                fill: false,
                tension: 0.4
            },
            {
                label: 'Actual Progress',
                data: [70, 65, 55, 45, 35, 25, 15, 5],
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
                text: 'Day'
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