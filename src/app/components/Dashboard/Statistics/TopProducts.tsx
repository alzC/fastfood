"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import styles from './TopProducts.module.scss';

interface Product {
    name: string;
    quantitySold: number;
}

export default function TopProducts() {
    const [topProducts, setTopProducts] = useState<Product[]>([]);

    useEffect(() => {
        const fetchTopProducts = async () => {
            try {
                const res = await axios.get("/api/statistics/top-products");
                setTopProducts(res.data);
            } catch (error) {
                console.error("Erreur lors de la récupération des produits les plus vendus :", error);
            }
        };

        fetchTopProducts();
    }, []);

    return (
        <div className={styles.topProducts}>
            <h2>Produits les plus vendus</h2>
            <ul>
                {topProducts.map((product, index) => (
                    <li key={index}>
                        {product.name} - Quantité vendue : {product.quantitySold}
                    </li>
                ))}
            </ul>
        </div>
    );
}
