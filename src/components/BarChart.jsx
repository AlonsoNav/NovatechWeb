import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const BarChart = ({pendingTasks, progressTasks, finishedTasks}) => {
    const labels = ['Pending', 'In progress', 'Finished'];
    const data = {
        labels: labels,
        datasets: [
            {
                label: 'Tasks',
                data: [pendingTasks, progressTasks, finishedTasks],
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1
            }
        ]
    };

    const options = {
        responsive: true,
        plugins: {
            title: {
                display: true,
                text: 'Bar Chart'
            },
            legend: {
                position: 'top'
            },
            tooltip: {
                mode: 'index',
                intersect: false
            }
            },
            scales: {
            x: {
                beginAtZero: true,
                title: {
                display: true,
                text: 'State'
                }
            },
            y: {
                beginAtZero: true,
                title: {
                display: true,
                text: 'Amount'
                }
            }
        },
        barThickness: 50,
    };

    return <Bar data={data} options={options} />;
};

export default BarChart;