'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './ProductsManager.module.scss';
import { Product } from '@/models/product';
import { ObjectId } from 'mongodb';
import {
    FaChevronDown,
    FaChevronUp,
    FaList,
    FaThLarge
} from 'react-icons/fa';
import {
    EditorState,
    convertToRaw,
    convertFromRaw,
    ContentState
} from 'draft-js';
import { Editor } from 'react-draft-wysiwyg';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';

export default function ProductsManager() {
    const [products, setProducts] = useState<Product[]>([]);
    const [newProduct, setNewProduct] = useState<Partial<Product>>({});
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [categoryFilter, setCategoryFilter] = useState<string>('');
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
    const [isFormOpen, setIsFormOpen] = useState<boolean>(false); // Définition de isFormOpen
    const [editorState, setEditorState] = useState<EditorState>(EditorState.createEmpty());

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await axios.get('/api/products');
            setProducts(res.data);
        } catch (err) {
            console.error(err);
            setError('Erreur lors du chargement des produits.');
        }
    };

    const handleAddOrEditProduct = async () => {
        try {
            if (!newProduct.name || !newProduct.price || !newProduct.stock) {
                setError('Tous les champs sont requis.');
                return;
            }

            let imageUrl = '';
            if (imageFile) {
                const formData = new FormData();
                formData.append('file', imageFile);

                const uploadRes = await axios.post('/api/upload', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
                imageUrl = uploadRes.data.url;
            }

            const description = JSON.stringify(convertToRaw(editorState.getCurrentContent()));

            if (editingProduct?._id) {
                // Update product
                await axios.put(`/api/products/${editingProduct._id}`, { ...newProduct, description, imageUrl });
                setProducts(products.map(product =>
                    product._id === editingProduct._id ? { ...product, ...newProduct, description, imageUrl } : product
                ));
            } else {
                // Add new product
                const res = await axios.post('/api/products', { ...newProduct, description, imageUrl });
                setProducts([...products, res.data]);
            }

            resetForm();
        } catch (err) {
            console.error(err);
            setError('Erreur lors de l\'ajout ou de la modification du produit.');
        }
    };

    const resetForm = () => {
        setNewProduct({});
        setImageFile(null);
        setPreviewImage(null);
        setEditorState(EditorState.createEmpty());
        setEditingProduct(null);
        setIsFormOpen(false);
    };

    const handleEditProduct = (product: Product) => {
        setEditingProduct(product);
        setNewProduct(product);
        setEditorState(
            EditorState.createWithContent(
                product.description
                    ? convertFromRaw(JSON.parse(product.description))
                    : ContentState.createFromText('')
            )
        );
        setPreviewImage(product.imageUrl || null);
        setIsFormOpen(true);
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setImageFile(file);
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                setPreviewImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleEditorChange = (state: EditorState) => {
        setEditorState(state);
    };

    const handleDeleteProduct = async (id: ObjectId) => {
        try {
            await axios.delete(`/api/products/${id}`);
            setProducts(products.filter(product => product._id !== id));
        } catch (err) {
            console.error(err);
            setError('Erreur lors de la suppression du produit.');
        }
    };

    const filteredProducts = products.filter(product => {
        const matchesName = product.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = categoryFilter ? product.category === categoryFilter : true;
        return matchesName && matchesCategory;
    });

    return (
        <div className={styles.productsManager}>
            <h1>Gestion des Produits</h1>

            {error && <p className={styles.error}>{error}</p>}

            {/* Barre de recherche */}
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
                <div className={styles.viewToggle}>
                    <FaList
                        className={viewMode === 'list' ? styles.activeIcon : ''}
                        onClick={() => setViewMode('list')}
                    />
                    <FaThLarge
                        className={viewMode === 'grid' ? styles.activeIcon : ''}
                        onClick={() => setViewMode('grid')}
                    />
                </div>
            </div>

            {/* Formulaire */}
            <div
                className={`${styles.dropdownHeader} ${isFormOpen ? styles.open : ''}`}
                onClick={() => setIsFormOpen(!isFormOpen)}
            >
                <span>{editingProduct ? 'Modifier le produit' : 'Ajouter un produit'}</span>
                {isFormOpen ? <FaChevronUp /> : <FaChevronDown />}
            </div>
            <div
                className={`${styles.dropdownContent} ${isFormOpen ? styles.open : ''}`}
                aria-expanded={isFormOpen ? 'true' : 'false'}
            >
                <div className={styles.addProduct}>
                    <div className={styles.formGroup}>
                        <input
                            type="text"
                            placeholder="Nom"
                            value={newProduct.name || ''}
                            onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                        />
                        <input
                            type="number"
                            placeholder="Prix"
                            value={newProduct.price || ''}
                            onChange={(e) => setNewProduct({ ...newProduct, price: parseFloat(e.target.value) })}
                        />
                        <input
                            type="number"
                            placeholder="Stock"
                            value={newProduct.stock || ''}
                            onChange={(e) => setNewProduct({ ...newProduct, stock: parseInt(e.target.value) })}
                        />
                        <input
                            type="text"
                            placeholder="Catégorie"
                            value={newProduct.category || ''}
                            onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                        />
                        <Editor
                            editorState={editorState}
                            onEditorStateChange={handleEditorChange}
                            placeholder="Description"
                            editorClassName="editorClass"
                        />
                        <input
                            className={styles.imageProduct}
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                        />
                        {previewImage && (
                            <img
                                src={previewImage}
                                alt="Prévisualisation"
                                className={styles.previewImage}
                            />
                        )}
                    </div>
                    <button onClick={handleAddOrEditProduct}>
                        {editingProduct ? 'Modifier' : 'Ajouter'}
                    </button>
                </div>
            </div>

            {/* Liste des produits */}
            <h2 style={{ marginTop: '20px' }}>Liste des produits</h2>
            <div className={`${styles.productsList} ${styles[viewMode]}`}>
                {filteredProducts.map(product => (
                    <div key={product._id?.toString()} className={styles.product}>
                        <img
                            src={product.imageUrl || '/placeholder-image.png'}
                            alt={product.name}
                            className={styles.productImage}
                        />
                        <div className={styles.productDetails}>
                            <span className={styles.truncatedDescription}>{product.name}</span>
                            <p className={styles.truncatedDescription}>
                                {(() => {
                                    try {
                                        const parsedDescription = JSON.parse(product.description);
                                        return parsedDescription.blocks
                                            .map((block: any) => block.text)
                                            .join('\n');
                                    } catch {
                                        return product.description; // Retourne la description brute si ce n'est pas du JSON
                                    }
                                })()}
                            </p>

                            <span>{product.price} €</span>
                            <span>Stock : {product.stock}</span>
                        </div>
                        <div className={styles.actions}>
                            <button onClick={() => handleEditProduct(product)}>Modifier</button>
                            <button onClick={() => handleDeleteProduct(product._id!)}>Supprimer</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
