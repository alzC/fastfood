"use client";
import { useEffect, useState } from "react";
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
    ingredients?: string[];
    supplements?: { name: string; price: number }[];
    sauce?: string;
}

export default function OrderManager() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await axios.get("/api/order");
                setOrders(res.data.filter((order: Order) => order.status === 'paid'));
            } catch (error) {
                console.error("Erreur lors de la récupération des commandes :", error);
            }
        };

        fetchOrders();
    }, []);

    const handlePrepareOrder = async (orderId: string) => {
        try {
            await axios.post(`/api/order/${orderId}/prepare`);
            setOrders((prevOrders) =>
                prevOrders.filter((order) => order._id !== orderId)
            );
            setSelectedOrderId(null);
        } catch (error) {
            console.error("Erreur lors de la préparation de la commande :", error);
        }
    };

    const toggleOrderDetails = (orderId: string) => {
        setSelectedOrderId(selectedOrderId === orderId ? null : orderId);
    };

    const paidOrdersCount = orders.length;

    return (
        <div className={styles.orderManager}>
            <h2>Gestion des commandes</h2>
            <div className={styles.orderCount}>
                <span>{paidOrdersCount}</span>
            </div>
            <table className={styles.orderTable}>
                <thead>
                    <tr>
                        <th>ID Commande</th>
                        <th>Statut</th>
                        <th>Adresse de Livraison</th>
                        <th>Téléphone</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {orders.map((order) => (
                        <tr key={order._id}>
                            <td>{order._id}</td>
                            <td>{order.status}</td>
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
                                {item.ingredients && item.ingredients.length > 0 && (
                                    <ul>
                                        <li>Ingrédients: {item.ingredients.join(", ")}</li>
                                    </ul>
                                )}
                                {item.supplements && item.supplements.length > 0 && (
                                    <ul>
                                        <li>Suppléments: {item.supplements.map(supplement => `${supplement.name} (+${supplement.price}€)`).join(", ")}</li>
                                    </ul>
                                )}
                                {item.sauce && (
                                    <p>Sauce: {item.sauce}</p>
                                )}
                            </li>
                        ))}
                    </ul>
                    <button className={styles.prepareButton} onClick={() => handlePrepareOrder(selectedOrderId)}>Marquer comme préparée</button>
                </div>
            )}
        </div>
    );
}
