"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import styles from './styles.module.scss';

export default function DeliveryManager() {
    const [orders, setOrders] = useState<any[]>([]);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await axios.get("/api/order");
                setOrders(res.data.filter((order: any) => order.status === 'validated'));
            } catch (error) {
                console.error("Erreur lors de la récupération des commandes :", error);
            }
        };

        fetchOrders();
    }, []);

    const handleMarkAsDelivered = async (orderId: string) => {
        try {
            await axios.post(`/api/order/${orderId}/deliver`);
            setOrders((prevOrders) =>
                prevOrders.map((order) =>
                    order._id === orderId ? { ...order, status: "delivered" } : order
                )
            );
        } catch (error) {
            console.error("Erreur lors de la mise à jour de la livraison :", error);
        }
    };

    return (
        <div className={styles.deliveryManager}>
            <h2>Gestion des livraisons</h2>
            <div>
                {orders.map((order) => (
                    <div key={order._id}>
                        <h3>Commande {order._id}</h3>
                        <p><strong>Adresse :</strong> {order.address}</p>
                        <p><strong>Téléphone :</strong> {order.phoneNumber}</p>
                        <p><strong>Contenu :</strong> {order.items.map((item: any) => item.name).join(", ")}</p>
                        <button onClick={() => handleMarkAsDelivered(order._id)}>Marquer comme livré</button>
                    </div>
                ))}
            </div>
        </div>
    );
}
