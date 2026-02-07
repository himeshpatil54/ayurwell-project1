// Dosha Chart Component using Chart.js
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

function DoshaChart({ scores, size = 'medium' }) {
    if (!scores) return null;

    const data = {
        labels: ['Vata', 'Pitta', 'Kapha'],
        datasets: [
            {
                data: [scores.vata, scores.pitta, scores.kapha],
                backgroundColor: [
                    'rgba(123, 163, 201, 0.8)', // Vata - sky blue
                    'rgba(232, 168, 124, 0.8)', // Pitta - warm orange
                    'rgba(130, 181, 130, 0.8)'  // Kapha - forest green
                ],
                borderColor: [
                    '#7BA3C9',
                    '#E8A87C',
                    '#82B582'
                ],
                borderWidth: 2,
                hoverOffset: 10
            }
        ]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    padding: 20,
                    font: {
                        family: "'Inter', sans-serif",
                        size: 14
                    },
                    usePointStyle: true
                }
            },
            tooltip: {
                callbacks: {
                    label: function (context) {
                        return `${context.label}: ${context.parsed}%`;
                    }
                }
            }
        },
        cutout: '60%'
    };

    const sizeMap = {
        small: '150px',
        medium: '250px',
        large: '350px'
    };

    return (
        <div className="chart-container" style={{ maxWidth: sizeMap[size] }}>
            <Doughnut data={data} options={options} />
            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                    Vata {scores.vata}% · Pitta {scores.pitta}% · Kapha {scores.kapha}%
                </p>
            </div>
        </div>
    );
}

export default DoshaChart;
