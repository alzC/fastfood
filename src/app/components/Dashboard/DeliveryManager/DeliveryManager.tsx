"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import styles from './styles.module.scss';

interface Order {
    _id: string;
    address: string;
    phoneNumber: string;
    items: string; // Les items sont stockés sous forme de chaîne JSON
    status: string;
}

interface Item {
    name: string;
    quantity: number;
}

export default function DeliveryManager() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await axios.get("/api/order");
                setOrders(res.data.filter((order: Order) => order.status === 'prepared'));
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
                prevOrders.filter((order) => order._id !== orderId)
            );
            setSelectedOrderId(null);
        } catch (error) {
            console.error("Erreur lors de la mise à jour de la livraison :", error);
        }
    };

    const toggleOrderDetails = (orderId: string) => {
        setSelectedOrderId(selectedOrderId === orderId ? null : orderId);
    };

    const deliveryOrdersCount = orders.length;

    return (
        <div className={styles.deliveryManager}>
            <h2>Gestion des livraisons</h2>
            <div className={styles.orderCount}>
                <span>{deliveryOrdersCount}</span>
            </div>
            <table className={styles.orderTable}>
                <thead>
                    <tr>
                        <th>ID Commande</th>
                        <th>Adresse de Livraison</th>
                        <th>Téléphone</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {orders.map((order) => (
                        <tr key={order._id}>
                            <td>{order._id}</td>
                            <td>{order.address}</td>
                            <td>{order.phoneNumber}</td>
                            <td>
                                <button className={styles.detailsButton} onClick={() => toggleOrderDetails(order._id)}>
                                    {selectedOrderId === order._id ? "Masquer" : "Afficher"} les détails
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {selectedOrderId && (
                <div className={styles.orderDetails}>
                    <h3>Détails de la commande</h3>
                    <ul>
                        {JSON.parse(orders.find((order) => order._id === selectedOrderId)?.items || '[]').map((item: Item) => (
                            <li key={item.name}>
                                {item.name} - Quantité: {item.quantity}
                            </li>
                        ))}
                    </ul>
                    <button className={styles.deliverButton} onClick={() => handleMarkAsDelivered(selectedOrderId)}>Marquer comme livré</button>
                </div>
            )}
        </div>
    );
}
