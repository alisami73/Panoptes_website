'use client'

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js'
import { Line } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend)

interface TimeSeriesChartProps {
  weeks: string[]
  proxy: number[]
  confirmed: (number | null)[]
}

export default function TimeSeriesChart({ weeks, proxy, confirmed }: TimeSeriesChartProps) {
  const data = {
    labels: weeks,
    datasets: [
      {
        label: 'Drug Proxy Signal',
        data: proxy,
        borderColor: '#00C2CB',
        backgroundColor: 'rgba(0,194,203,0.15)',
        borderWidth: 2,
        pointRadius: 3,
        pointBackgroundColor: '#00C2CB',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Confirmed Cases',
        data: confirmed,
        borderColor: '#ff9456',
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderDash: [5, 4],
        pointRadius: 3,
        pointBackgroundColor: '#ff9456',
        fill: false,
        tension: 0.4,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(13,27,42,0.95)',
        borderColor: 'rgba(0,194,203,0.3)',
        borderWidth: 1,
        titleColor: 'rgba(232,237,242,0.5)',
        bodyColor: '#E8EDF2',
        titleFont: { family: 'JetBrains Mono', size: 10 },
        bodyFont: { family: 'JetBrains Mono', size: 11 },
        padding: 10,
      },
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(0,194,203,0.06)',
        },
        ticks: {
          color: 'rgba(232,237,242,0.4)',
          font: { family: 'JetBrains Mono', size: 10 },
        },
        border: {
          color: 'rgba(0,194,203,0.15)',
        },
      },
      y: {
        grid: {
          color: 'rgba(0,194,203,0.06)',
        },
        ticks: {
          color: 'rgba(232,237,242,0.4)',
          font: { family: 'JetBrains Mono', size: 10 },
        },
        border: {
          color: 'rgba(0,194,203,0.15)',
        },
      },
    },
  }

  return (
    <div style={{ height: '240px', position: 'relative' }}>
      <Line data={data} options={options} />
    </div>
  )
}
