"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import axios from "axios";
import styles from './styles.module.scss';

interface Order {
    _id: string;
    customerEmail: string;
    status: string;
    address: string;
    phoneNumber: string;
    items: string; // Les items sont stockés sous forme de chaîne JSON
}

interface Item {
    name: string;
    quantity: number;
    price: number;
}

function SuccessPageContent() {
    const searchParams = useSearchParams();
    const sessionId = searchParams.get("session_id");
    const [order, setOrder] = useState<Order | null>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const res = await axios.get(`/api/order/${sessionId}`);
                setOrder(res.data);
            } catch (error) {
                console.error("Erreur lors de la récupération de la commande :", error);
            }
        };

        if (sessionId) {
            fetchOrder();
        }
    }, [sessionId]);

    if (!order) {
        return <div>Chargement...</div>;
    }

    const items: Item[] = JSON.parse(order.items);

    return (
        <div className={styles.successPage}>
            <h1>Merci pour votre commande !</h1>
            <p>Votre commande est en cours de préparation.</p>
            <h2>Résumé de la commande</h2>
            <div className={styles.orderSummary}>
                <p><strong>ID Commande :</strong> {order._id}</p>
                <p><strong>Email :</strong> {order.customerEmail}</p>
                <p><strong>Adresse :</strong> {order.address}</p>
                <p><strong>Téléphone :</strong> {order.phoneNumber}</p>
                <ul>
                    {items.map((item) => (
                        <li key={item.name}>
                            {item.name} - Quantité: {item.quantity} - Prix: {item.price}€
                        </li>
                    ))}
                </ul>
                <p><strong>Total :</strong> {items.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2)}€</p>
            </div>
            <button className={styles.homeButton} onClick={() => router.push('/')}>Retour à l&apos;accueil</button>
        </div>
    );
}

export default function SuccessPage() {
    return (
        <Suspense fallback={<div>Chargement...</div>}>
            <SuccessPageContent />
        </Suspense>
    );
}
