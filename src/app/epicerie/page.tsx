'use client';

import { useState, useEffect } from 'react';
import { FaShoppingCart, FaPlus, FaMinus, FaTrash } from 'react-icons/fa';
import axios from 'axios';
import styles from './styles.module.scss';
import { Product } from '@/models/product';

interface DraftBlock {
    text: string;
    type: string;
    depth: number;
}

export default function Epicerie() {
    const [products, setProducts] = useState<Product[]>([]);
    const [cart, setCart] = useState<Record<string, { product: Product; quantity: number }>>({});
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [categoryFilter, setCategoryFilter] = useState<string>('');
    const [subCategoryFilter, setSubCategoryFilter] = useState<string>('');
    const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
    const [formValid, setFormValid] = useState(false);
    const [userDetails, setUserDetails] = useState({ name: '', email: '', address: '', phoneNumber: '' });

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await axios.get('/api/products');
                setProducts(res.data.filter((product: Product) => product.category !== "Cuisine"));
            } catch (err) {
                console.error('Erreur lors du chargement des produits:', err);
            }
        };

        fetchProducts();
    }, []);

    useEffect(() => {
        const { name, email, address, phoneNumber } = userDetails;
        setFormValid(name.trim() !== '' && email.trim() !== '' && address.trim() !== '' && phoneNumber.trim() !== '');
    }, [userDetails]);

    const handleAddToCart = (product: Product) => {
        if (!product._id) return;
        const productId = product._id.toString();

        setCart((prevCart) => {
            const existingCartItem = prevCart[productId];
            return {
                ...prevCart,
                [productId]: {
                    product,
                    quantity: existingCartItem ? existingCartItem.quantity + 1 : 1,
                },
            };
        });
    };

    const handleChangeQuantity = (productId: string, change: number) => {
        setCart((prevCart) => {
            const existingCartItem = prevCart[productId];
            if (!existingCartItem) return prevCart; // Si l'article n'existe pas, ne rien faire

            const newQuantity = existingCartItem.quantity + change;

            if (newQuantity <= 0) {
                // Si la quantité tombe à 0 ou moins, supprimer l'article du panier
                const { ...rest } = prevCart;
                delete rest[productId];
                return rest;
            }

            return {
                ...prevCart,
                [productId]: {
                    ...existingCartItem,
                    quantity: newQuantity,
                },
            };
        });
    };

    const handlePayment = async () => {
        try {
            const response = await axios.post("/api/checkout", {
                cart: Object.values(cart).map(cartItem => ({
                    name: cartItem.product.name,
                    price: cartItem.product.price,
                    quantity: cartItem.quantity,
                })),
                address: userDetails.address,
                phoneNumber: userDetails.phoneNumber,
                customerEmail: "client@example.com", // Remplacer par l'email réel du client
            });

            // Récupère l'URL de la session de paiement Stripe
            const { url } = response.data;

            // Redirige l'utilisateur vers l'URL de la session Stripe
            if (url) {
                window.location.href = url;
            } else {
                console.error("URL de redirection non disponible.");
            }
        } catch (error) {
            console.error("Erreur lors de la création de la session de paiement:", error);
        }
    };

    const toggleCart = () => {
        setIsCartOpen(!isCartOpen);
    };

    const closeCart = () => {
        setIsCartOpen(false);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setUserDetails((prevDetails) => ({ ...prevDetails, [name]: value }));
    };

    const totalPrice = Object.values(cart).reduce(
        (total, cartItem) => total + cartItem.product.price * cartItem.quantity,
        0
    );

    const filteredProducts = products.filter((product) => {
        const matchesName = product.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = categoryFilter ? product.category === categoryFilter : true;
        const matchesSubCategory = subCategoryFilter ? product.subCategory === subCategoryFilter : true;
        return matchesName && matchesCategory && matchesSubCategory;
    });

    return (
        <div className={styles.epicerie}>
            <h1>Epicerie</h1>
            <div className={styles.filters}>
                <input
                    type="text"
                    placeholder="Rechercher par nom"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                >
                    <option value="">Toutes les catégories</option>
                    {Array.from(new Set(products.map((p) => p.category))).map((category) => (
                        <option key={category} value={category}>
                            {category}
                        </option>
                    ))}
                </select>
                <select
                    value={subCategoryFilter}
                    onChange={(e) => setSubCategoryFilter(e.target.value)}
                >
                    <option value="">Toutes les sous-catégories</option>
                    {Array.from(new Set(products.map((p) => p.subCategory))).map((subCategory) => (
                        <option key={subCategory} value={subCategory}>
                            {subCategory}
                        </option>
                    ))}
                </select>
                <div className={styles.cartIcon} onClick={toggleCart}>
                    <FaShoppingCart />
                    {Object.values(cart).length > 0 && (
                        <div className={styles.cartCount}>
                            {Object.values(cart).reduce((total, item) => total + item.quantity, 0)}
                        </div>
                    )}
                    {totalPrice > 0 && <span className={styles.cartTotal}>{totalPrice.toFixed(2)}€</span>}
                </div>
            </div>

            {isCartOpen && (
                <div className={styles.cartFullScreen}>
                    <button className={styles.closeCart} onClick={closeCart}>
                        X
                    </button>
                    <h2>Panier</h2>
                    <ul>
                        {Object.entries(cart).map(([productId, cartItem]) => (
                            <li key={productId} className={styles.cartItem}>
                                <span>{cartItem.product.name}</span>
                                <div className={styles.cartItemControls}>
                                    <button
                                        onClick={() => handleChangeQuantity(productId, -1)}
                                        title="Réduire la quantité"
                                    >
                                        <FaMinus />
                                    </button>
                                    <span>{cartItem.quantity}</span>
                                    <button
                                        onClick={() => handleChangeQuantity(productId, 1)}
                                        title="Augmenter la quantité"
                                    >
                                        <FaPlus />
                                    </button>
                                    <button
                                        onClick={() => handleChangeQuantity(productId, -cartItem.quantity)}
                                        title="Supprimer du panier"
                                    >
                                        <FaTrash />
                                    </button>
                                </div>
                                <span>
                                    {(cartItem.product.price * cartItem.quantity).toFixed(2)} €
                                </span>
                            </li>
                        ))}
                    </ul>
                    <p>Total : {totalPrice.toFixed(2)}€</p>
                    <div className={styles.userDetailsForm}>
                        <input
                            type="text"
                            name="name"
                            placeholder="Nom"
                            value={userDetails.name}
                            onChange={handleInputChange}
                        />
                        <input
                            type="number"
                            name="phoneNumber"
                            placeholder="Téléphone"
                            value={userDetails.phoneNumber}
                            onChange={handleInputChange} />
                        <input
                            type="email"
                            name="email"
                            placeholder="Email"
                            value={userDetails.email}
                            onChange={handleInputChange}
                        />
                        <input
                            type="text"
                            name="address"
                            placeholder="Adresse"
                            value={userDetails.address}
                            onChange={handleInputChange}
                        />
                    </div>
                    <button
                        className={`${styles.checkoutButton} ${formValid ? '' : styles.disabled}`}
                        onClick={handlePayment}
                        disabled={!formValid}
                    >
                        Commander
                    </button>
                </div>
            )}

            <div className={styles.productsList}>
                {filteredProducts.map((product, index) => (
                    <div key={index} className={styles.product}>
                        <img
                            src={product.imageUrl || '/uploads/default-image.jpg'}
                            alt={product.name}
                            className={styles.productImage}
                        />
                        <div className={styles.productContent}>
                            <h3>{product.name}</h3>
                            <p>{product.price}€</p>
                            <p className={styles.truncatedDescription}>
                                {(() => {
                                    try {
                                        const parsedDescription = JSON.parse(product.description);
                                        return parsedDescription.blocks
                                            .map((block: DraftBlock) => block.text)
                                            .join(' ');
                                    } catch {
                                        return product.description;
                                    }
                                })()}
                            </p>
                            <button onClick={() => handleAddToCart(product)}>Ajouter au panier</button> {/* Toujours visible */}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
