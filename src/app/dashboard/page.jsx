"use client"
import dynamic from 'next/dynamic';
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

import styles from './styles.module.scss';
const ProductsManager = dynamic(() => import('../components/Dashboard/Products/ProductsManager'), {
    ssr: false, // Désactive le rendu côté serveur
});

export default function DashboardPage() {
    const { status } = useSession();
    const router = useRouter();
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [sideChoice, setSideChoice] = useState('produits');

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/auth/login");
        }
    }, [status, router]);

    if (status === "loading") {
        return <div>Chargement...</div>;
    }

    return (
        <div className={styles.dashboard}>
            <button
                className={styles.toggleButton}
                onClick={() => setSidebarOpen(!isSidebarOpen)}
            >
                {isSidebarOpen ? "x" : "Ouvrir"}
            </button>
            <nav className={`${styles.nav} ${isSidebarOpen ? styles.open : ''}`}>
                <ul>
                    <li>Commandes</li>
                    <li onClick={() => setSideChoice('produits')}>Produits</li>
                    <li>Livraisons</li>
                    <li>Statistiques</li>
                </ul>
            </nav>
            <div className={styles.content}>
                <h1>Board</h1>
                {sideChoice === 'produits' && <ProductsManager />}
            </div>
        </div>
    );
}
