import React from 'react';
import { Radar } from 'react-chartjs-2';
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend} from 'chart.js';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const SkillGapChart = ({ userScores, idealScores, labels }) => {
  const data = {
    labels,
    datasets: [
      {
        label: 'Your Current Skills',
        data: userScores,
        backgroundColor: 'rgba(124,107,255,0.18)',
        borderColor: '#7c6bff',
        pointBackgroundColor: '#7c6bff',
        pointBorderColor: '#050816',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#7c6bff',
        borderWidth: 2,
      },
      {
        label: 'Ideal Role Profile',
        data: idealScores,
        backgroundColor: 'rgba(0,229,200,0.12)',
        borderColor: '#00e5c8',
        pointBackgroundColor: '#00e5c8',
        pointBorderColor: '#050816',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#00e5c8',
        borderDash: [5, 5],
        borderWidth: 2,
      },
    ],
  };

  const options = {
    scales: {
      r: {
        angleLines: { display: true, color: 'rgba(255,255,255,.08)' },
        grid: { color: 'rgba(255,255,255,.08)' },
        pointLabels: { color: 'rgba(232,232,240,.65)', font: { size: 10, family: "'DM Sans'" } },
        ticks: { color: 'rgba(232,232,240,.4)', backdropColor: 'transparent', stepSize: 1 },
        suggestedMin: 0,
        suggestedMax: 6,
      },
    },
    plugins: {
      legend: {
        position: 'top',
        labels: { color: 'rgba(232,232,240,.7)', font: { family: "'DM Sans'" }, boxWidth: 14, padding: 16 },
      },
    },
    maintainAspectRatio: false,
  };

  return (
    <div style={{ height: '400px', width: '100%' }}>
      <Radar data={data} options={options} />
    </div>
  );
};

export default SkillGapChart;