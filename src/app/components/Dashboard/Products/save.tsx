'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './ProductsManager.module.scss';
import { FaThLarge, FaList } from 'react-icons/fa';
import { EditorState, convertToRaw } from 'draft-js';
import { Editor } from 'react-draft-wysiwyg';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';

export interface Product {
    _id: string;
    name: string;
    price: number;
    stock: number;
    description: string;
    imageUrl?: string;
    category?: string;
}

export default function ProductsManager() {
    const [products, setProducts] = useState<Product[]>([]);
    const [newProduct, setNewProduct] = useState<Partial<Product>>({});
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [editorState, setEditorState] = useState(EditorState.createEmpty());
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    const [categories, setCategories] = useState<string[]>([]);

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await axios.get<Product[]>('/api/products');
            setProducts(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchCategories = async () => {
        try {
            const res = await axios.get<string[]>('/api/categories');
            setCategories(['All', ...res.data]);
        } catch (err) {
            console.error(err);
        }
    };

    const handleAddProduct = async () => {
        try {
            if (!newProduct.name || !newProduct.price) {
                console.error('Tous les champs sont requis.');
                return;
            }

            const rawContent = JSON.stringify(
                convertToRaw(editorState.getCurrentContent())
            );

            const res = await axios.post<Product>('/api/products', {
                ...newProduct,
                description: rawContent,
            });

            setProducts((prevProducts) => [...prevProducts, res.data]);
            setNewProduct({});
            setEditorState(EditorState.createEmpty());
        } catch (err) {
            console.error('Erreur lors de l\'ajout du produit :', err);
        }
    };

    const filteredProducts = products.filter((product) => {
        const matchesCategory =
            selectedCategory === 'All' || product.category === selectedCategory;
        const matchesSearch =
            product.name.toLowerCase().includes(search.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <div className={styles.productsManager}>
            <h1>Gestion des Produits</h1>

            {/* Formulaire d'ajout de produit */}
            <div className={styles.addProduct}>
                <h2>Ajouter un produit</h2>
                <div className={styles.formGroup}>
                    <input
                        type="text"
                        placeholder="Nom"
                        value={newProduct.name || ''}
                        onChange={(e) =>
                            setNewProduct({ ...newProduct, name: e.target.value })
                        }
                    />
                    <input
                        type="number"
                        placeholder="Prix"
                        value={newProduct.price || ''}
                        onChange={(e) =>
                            setNewProduct({ ...newProduct, price: parseFloat(e.target.value) })
                        }
                    />
                    <input
                        type="number"
                        placeholder="Stock"
                        value={newProduct.stock || ''}
                        onChange={(e) =>
                            setNewProduct({ ...newProduct, stock: parseInt(e.target.value) })
                        }
                    />
                    <div className={styles.editor}>
                        <Editor
                            editorState={editorState}
                            onEditorStateChange={setEditorState}
                            wrapperClassName="wrapper-class"
                            editorClassName="editor-class"
                            toolbarClassName="toolbar-class"
                        />
                    </div>
                </div>
                <button onClick={handleAddProduct}>Ajouter</button>
            </div>

            {/* Recherche par nom et filtre par catégorie */}
            <div className={styles.filters}>
                <input
                    type="text"
                    placeholder="Rechercher par nom"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                >
                    {categories.map((category) => (
                        <option key={category} value={category}>
                            {category}
                        </option>
                    ))}
                </select>
            </div>

            {/* Icônes pour changer l'affichage */}
            <div className={styles.viewToggle}>
                <FaThLarge
                    className={viewMode === 'grid' ? styles.activeIcon : ''}
                    onClick={() => setViewMode('grid')}
                />
                <FaList
                    className={viewMode === 'list' ? styles.activeIcon : ''}
                    onClick={() => setViewMode('list')}
                />
            </div>

            {/* Liste des produits filtrée */}
            <div className={`${styles.productsList} ${styles[viewMode]}`}>
                {filteredProducts.map((product) => (
                    <div key={product._id} className={styles.product}>
                        <img
                            src={product.imageUrl || '/placeholder.png'}
                            alt={product.name}
                            className={styles.productImage}
                        />
                        <div className={styles.productDetails}>
                            <h3>{product.name}</h3>
                            <p>{product.description}</p>
                            <span>{product.price} €</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
