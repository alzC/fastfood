"use client";
import { useRouter } from "next/navigation";
import styles from './styles.module.scss';

export default function CancelPage() {
    const router = useRouter();

    return (
        <div className={styles.cancelPage}>
            <h1>Paiement échoué</h1>
            <p>Votre paiement a échoué. Veuillez réessayer.</p>
            <button className={styles.homeButton} onClick={() => router.push('/')}>Retour à l&apos;accueil</button>
        </div>
    );
}
