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
    items: { name: string; quantity: number }[];
}

export default function OrderManager() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await axios.get("/api/order");
                setOrders(res.data);
            } catch (error) {
                console.error("Erreur lors de la récupération des commandes :", error);
            }
        };

        fetchOrders();
        console.log(orders);

    }, []);

    const handleValidateOrder = async (orderId: string) => {
        try {
            await axios.post(`/api/order/${orderId}/validate`);
            setOrders((prevOrders) =>
                prevOrders.map((order) =>
                    order._id === orderId ? { ...order, status: "validated" } : order
                )
            );
        } catch (error) {
            console.error("Erreur lors de la validation de la commande :", error);
        }
    };

    const handlePrepareOrder = async (orderId: string) => {
        try {
            await axios.post(`/api/order/${orderId}/prepare`);
            setOrders((prevOrders) =>
                prevOrders.map((order) =>
                    order._id === orderId ? { ...order, status: "prepared" } : order
                )
            );
        } catch (error) {
            console.error("Erreur lors de la préparation de la commande :", error);
        }
    };

    const toggleOrderDetails = (orderId: string) => {
        setSelectedOrderId(selectedOrderId === orderId ? null : orderId);
    };

    return (
        <div className={styles.orderManager}>
            <h2>Gestion des commandes</h2>
            <table>
                <thead>
                    <tr>
                        <th>ID Commande</th>
                        <th>Email Client</th>
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
                            <td>{order.customerEmail}</td>
                            <td>{order.status}</td>
                            <td>{order.address}</td>
                            <td>{order.phoneNumber}</td>
                            <td>
                                {order.status === "paid" && (
                                    <button onClick={() => toggleOrderDetails(order._id)}>
                                        {selectedOrderId === order._id ? "Masquer" : "Afficher"} les détails
                                    </button>
                                )}
                                {order.status === "prepared" && (
                                    <button onClick={() => handleValidateOrder(order._id)}>Valider</button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {selectedOrderId && (

                <div className={styles.orderDetails}>
                    <h3>Détails de la commande</h3>
                    <ul>
                        {orders
                            .find((order) => order._id === selectedOrderId)
                            ?.items.map((item) => (
                                <li key={item.name}>
                                    {item.name} - Quantité: {item.quantity}
                                </li>
                            ))}
                    </ul>
                    <button onClick={() => handlePrepareOrder(selectedOrderId)}>Marquer comme préparée</button>
                </div>

            )
            }
        </div >
    );
}
