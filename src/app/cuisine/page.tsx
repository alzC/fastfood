"use client";
import { useState, useEffect } from "react";
import { FaShoppingCart, FaPlus, FaMinus, FaTrash } from "react-icons/fa";
import axios from "axios";
import styles from "./styles.module.scss";
import { Product } from "@/models/product";

interface DraftBlock {
    text: string;
    type: string;
    depth: number;
}

const sauces = ["andalouse", "americaine", "mayonnaise", "ketchup", "samourai", "algerienne", "cocktail", "hannibal"];

export default function Cuisine() {
    const [products, setProducts] = useState<Product[]>([]);
    const [cart, setCart] = useState<Record<string, { product: Product; quantity: number; ingredients?: string[]; supplements?: { name: string; price: number }[]; sauce?: string; price: number }>>({});
    const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
    const [formValid, setFormValid] = useState(false);
    const [userDetails, setUserDetails] = useState({ name: "", email: "", address: "", phoneNumber: "" });
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
    const [selectedSupplements, setSelectedSupplements] = useState<{ name: string; price: number }[]>([]);
    const [selectedSauce, setSelectedSauce] = useState<string>("");

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await axios.get("/api/products");
                setProducts(res.data.filter((product: Product) => product.category === "Cuisine"));
            } catch (err) {
                console.error("Erreur lors du chargement des produits:", err);
            }
        };

        fetchProducts();
    }, []);

    useEffect(() => {
        const { name, email, address, phoneNumber } = userDetails;
        setFormValid(name.trim() !== "" && email.trim() !== "" && address.trim() !== "" && phoneNumber.trim() !== "");
    }, [userDetails]);

    const handleAddToCart = (product: Product) => {
        if (product.ingredients?.length || product.supplements?.length) {
            setSelectedProduct(product);
            setSelectedIngredients([]);
            setSelectedSupplements([]);
            setSelectedSauce("");
        } else {
            const productId = product._id ? product._id.toString() : "";
            const cartKey = `${productId}`;

            setCart((prevCart) => {
                const existingCartItem = prevCart[cartKey];
                return {
                    ...prevCart,
                    [cartKey]: {
                        product,
                        quantity: existingCartItem ? existingCartItem.quantity + 1 : 1,
                        price: product.price,
                    },
                };
            });
        }
    };

    const handleConfirmAddToCart = () => {
        if (!selectedProduct) return;
        const productId = selectedProduct._id ? selectedProduct._id.toString() : "";
        const cartKey = `${productId}-${selectedIngredients.join(",")}-${selectedSupplements.map(s => s.name).join(",")}-${selectedSauce}`;

        setCart((prevCart) => {
            const existingCartItem = prevCart[cartKey];
            const newSupplementsPrice = selectedSupplements.reduce((total, supplement) => total + supplement.price, 0);
            const totalPrice = selectedProduct.price + newSupplementsPrice;
            return {
                ...prevCart,
                [cartKey]: {
                    product: selectedProduct,
                    quantity: existingCartItem ? existingCartItem.quantity + 1 : 1,
                    ingredients: selectedIngredients,
                    supplements: selectedSupplements,
                    sauce: selectedSauce,
                    price: totalPrice,
                },
            };
        });

        setSelectedProduct(null);
    };

    const handleChangeQuantity = (cartKey: string, change: number) => {
        setCart((prevCart) => {
            const existingCartItem = prevCart[cartKey];
            if (!existingCartItem) return prevCart; // Si l'article n'existe pas, ne rien faire

            const newQuantity = existingCartItem.quantity + change;

            if (newQuantity <= 0) {
                // Si la quantité tombe à 0 ou moins, supprimer l'article du panier
                const { ...rest } = prevCart;
                delete rest[cartKey];
                return rest;
            }

            return {
                ...prevCart,
                [cartKey]: {
                    ...existingCartItem,
                    quantity: newQuantity,
                },
            };
        });
    };

    const handlePayment = async () => {
        try {
            const response = await axios.post("/api/checkout", {
                cart: Object.values(cart).map((cartItem) => ({
                    name: cartItem.product.name,
                    price: cartItem.price,
                    quantity: cartItem.quantity,
                    ingredients: cartItem.ingredients,
                    supplements: cartItem.supplements,
                    sauce: cartItem.sauce,
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
        (total, cartItem) => total + cartItem.price * cartItem.quantity,
        0
    );

    const subCategories = Array.from(new Set(products.map((product) => product.subCategory)));

    return (
        <div className={styles.cuisine}>
            <h1>Cuisine</h1>
            <div className={styles.cartIcon} onClick={toggleCart}>
                <FaShoppingCart />
                {Object.values(cart).length > 0 && (
                    <div className={styles.cartCount}>
                        {Object.values(cart).reduce((total, item) => total + item.quantity, 0)}
                    </div>
                )}
                {totalPrice > 0 && <span className={styles.cartTotal}>{totalPrice.toFixed(2)}€</span>}
            </div>

            {isCartOpen && (
                <div className={styles.cartFullScreen}>
                    <button className={styles.closeCart} onClick={closeCart}>
                        X
                    </button>
                    <h2>Panier</h2>
                    <ul>
                        {Object.entries(cart).map(([cartKey, cartItem]) => (
                            <li key={cartKey} className={styles.cartItem}>
                                <div className={styles.cartItemDetails}>
                                    <span>{cartItem.product.name}</span>
                                    {cartItem.supplements && cartItem.supplements.length > 0 && (
                                        <ul className={styles.supplementsList}>
                                            {cartItem.supplements.map((supplement) => (
                                                <li key={supplement.name}>{supplement.name} (+{supplement.price}€)</li>
                                            ))}
                                        </ul>
                                    )}
                                    {cartItem.sauce && (
                                        <p>Sauce: {cartItem.sauce}</p>
                                    )}
                                </div>
                                <div className={styles.cartItemControls}>
                                    <button
                                        onClick={() => handleChangeQuantity(cartKey, -1)}
                                        title="Réduire la quantité"
                                    >
                                        <FaMinus />
                                    </button>
                                    <span style={{ color: "black" }}>{cartItem.quantity}</span>
                                    <button
                                        onClick={() => handleChangeQuantity(cartKey, 1)}
                                        title="Augmenter la quantité"
                                    >
                                        <FaPlus />
                                    </button>
                                    <button
                                        onClick={() => handleChangeQuantity(cartKey, -cartItem.quantity)}
                                        title="Supprimer du panier"
                                    >
                                        <FaTrash />
                                    </button>
                                </div>
                                <span style={{ color: "black" }}>
                                    {(cartItem.price * cartItem.quantity).toFixed(2)} €
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
                            onChange={handleInputChange}
                        />
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
                        className={`${styles.checkoutButton} ${formValid ? "" : styles.disabled}`}
                        onClick={handlePayment}
                        disabled={!formValid}
                    >
                        Commander
                    </button>
                </div>
            )}

            {subCategories.map((subCategory) => (
                <div key={subCategory} className={styles.subCategory}>
                    <h2>{subCategory}</h2>
                    <div className={styles.productSlider}>
                        {products
                            .filter((product) => product.subCategory === subCategory)
                            .map((product, index) => (
                                <div key={index} className={styles.product}>
                                    <img
                                        src={product.imageUrl || "/uploads/default-image.jpg"}
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
                                                        .join(" ");
                                                } catch {
                                                    return product.description;
                                                }
                                            })()}
                                        </p>
                                        {product.ingredients?.length === 0 && (
                                            <p>Assortiment de sauce comprise</p>
                                        )}
                                        <button onClick={() => handleAddToCart(product)}>Ajouter au panier</button>
                                    </div>
                                </div>
                            ))}
                    </div>
                </div>
            ))}

            {selectedProduct && (
                <div className={styles.popup}>
                    <div className={styles.popupContent}>
                        <h2>Choisissez vos ingrédients et suppléments</h2>
                        {selectedProduct.ingredients && (
                            <div>
                                <h3>Ingrédients</h3>
                                {selectedProduct.ingredients.map((ingredient) => (
                                    <label key={ingredient}>
                                        <input
                                            type="checkbox"
                                            value={ingredient}
                                            checked={selectedIngredients.includes(ingredient)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setSelectedIngredients([...selectedIngredients, ingredient]);
                                                } else {
                                                    setSelectedIngredients(selectedIngredients.filter((i) => i !== ingredient));
                                                }
                                            }}
                                        />
                                        {ingredient}
                                    </label>
                                ))}
                            </div>
                        )}
                        {selectedProduct.supplements && (
                            <div>
                                <h3>Suppléments</h3>
                                {selectedProduct.supplements.map((supplement) => (
                                    <label key={supplement.name}>
                                        <input
                                            type="checkbox"
                                            value={supplement.name}
                                            checked={selectedSupplements.some((s) => s.name === supplement.name)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setSelectedSupplements([...selectedSupplements, supplement]);
                                                } else {
                                                    setSelectedSupplements(selectedSupplements.filter((s) => s.name !== supplement.name));
                                                }
                                            }}
                                        />
                                        {supplement.name} (+{supplement.price}€)
                                    </label>
                                ))}
                            </div>
                        )}
                        <div>
                            <h3>Sauces</h3>
                            {sauces.map((sauce) => (
                                <label key={sauce}>
                                    <input
                                        type="radio"
                                        name="sauce"
                                        value={sauce}
                                        checked={selectedSauce === sauce}
                                        onChange={(e) => setSelectedSauce(e.target.value)}
                                    />
                                    {sauce}
                                </label>
                            ))}
                        </div>
                        <button onClick={handleConfirmAddToCart}>Ajouter au panier</button>
                        <button onClick={() => setSelectedProduct(null)}>Annuler</button>
                    </div>
                </div>
            )}
        </div>
    );
}
