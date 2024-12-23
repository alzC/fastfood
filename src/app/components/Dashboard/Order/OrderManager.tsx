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
    items: { name: string }[];
}

export default function OrderManager() {
    const [orders, setOrders] = useState<Order[]>([]);

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
                        <th>Contenu</th>
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
                            <td>{order.items.map((item) => item.name).join(", ")}</td>
                            <td>
                                {order.status !== "validated" && (
                                    <button onClick={() => handleValidateOrder(order._id)}>Valider</button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
