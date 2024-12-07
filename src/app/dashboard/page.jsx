'use client';
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import ProductsManager from '../components/Dashboard/Products/ProductsManager'
import styles from './styles.module.scss';

export default function DashboardPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [sideChoice, setSideChoice] = useState('produits')
    // Si l'utilisateur n'est pas connecté, on redirige vers la page de connexion
    if (status === "loading") {
        return <div>Chargement...</div>;
    }

    if (status === "unauthenticated") {
        router.push("/auth/login");
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
                {sideChoice == 'produits' ? <ProductsManager /> : ""}
            </div>
        </div>
    );
}
