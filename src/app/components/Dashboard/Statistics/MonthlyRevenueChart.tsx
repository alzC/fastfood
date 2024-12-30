"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";
import styles from './MonthlyRevenueChart.module.scss';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

interface RevenueData {
    month: string;
    revenue: number;
}

export default function MonthlyRevenueChart() {
    const [revenueData, setRevenueData] = useState<RevenueData[]>([]);

    useEffect(() => {
        const fetchRevenueData = async () => {
            try {
                const res = await axios.get("/api/statistics/monthly-revenue");
                setRevenueData(res.data);
            } catch (error) {
                console.error("Erreur lors de la récupération des données de revenu mensuel :", error);
            }
        };

        fetchRevenueData();
    }, []);

    const data = {
        labels: revenueData.map((data) => data.month),
        datasets: [
            {
                label: "Revenu mensuel (€)",
                data: revenueData.map((data) => data.revenue),
                backgroundColor: "rgba(75, 192, 192, 0.2)",
                borderColor: "rgba(75, 192, 192, 1)",
                borderWidth: 1,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: "top" as const,
            },
            title: {
                display: true,
                text: "Revenu mensuel",
            },
        },
    };

    return (
        <div className={styles.monthlyRevenueChart}>
            <h2>Revenu mensuel</h2>
            <Bar data={data} options={options} />
        </div>
    );
}
