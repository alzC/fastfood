'use client';

import { useState, useEffect, useRef } from 'react';
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

interface DraftBlock {
    text: string;
    type: string;
    depth: number;
}
const categoryColors = {
    Sandwich: 'rgb(255 152 0)',    // Exemple de couleur pour Sandwich
    Snacks: '#007bff',             // Exemple pour Snacks
    Boissons: '#28a745',           // Exemple pour Boissons
    Alcool: '#6f42c1',             // Exemple pour Alcool
    Epicerie: '#dc3545',           // Exemple pour Epicerie
};

export default function ProductsManager() {
    const [newIngredient, setNewIngredient] = useState<string>('');
    const [newSupplement, setNewSupplement] = useState<{ name: string; price: number }>({ name: '', price: 0 });
    const [products, setProducts] = useState<Product[]>([]);
    const [newProduct, setNewProduct] = useState<Partial<Product>>({});
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [categoryFilter, setCategoryFilter] = useState<string>('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [subCategoryFilter, setSubCategoryFilter] = useState("")
    const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
    const [editorState, setEditorState] = useState<EditorState>(EditorState.createEmpty());

    const isMounted = useRef(false);

    useEffect(() => {
        isMounted.current = true;
        fetchProducts();

        return () => {
            isMounted.current = false;
        };
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await axios.get('/api/products');
            if (isMounted.current) {
                setProducts(res.data);
            }
        } catch (err) {
            console.error('Erreur lors du chargement des produits:', err);
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
                if (uploadRes.data?.url) {
                    imageUrl = uploadRes.data.url;
                } else {
                    setError('Erreur lors de l\'upload de l\'image.');
                    return;
                }
            }

            const description = JSON.stringify(convertToRaw(editorState.getCurrentContent()));

            if (editingProduct?._id) {
                // Mise à jour du produit
                await axios.put(`/api/products/${editingProduct._id}`, { ...newProduct, description, imageUrl });
                setProducts(products.map(product =>
                    product._id === editingProduct._id ? { ...product, ...newProduct, description, imageUrl } : product
                ));
            } else {
                // Ajout d'un nouveau produit
                const res = await axios.post('/api/products', { ...newProduct, description, imageUrl });
                setProducts([...products, res.data]);
            }

            resetForm();
        } catch (err) {
            console.error('Erreur lors de l\'ajout ou de la modification du produit:', err);
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
            console.error('Erreur lors de la suppression du produit:', err);
            setError('Erreur lors de la suppression du produit.');
        }
    };

    const handleCancelEdit = () => {
        resetForm();
    };

    const filteredProducts = products.filter(product => {
        const matchesName = product.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = categoryFilter ? product.category === categoryFilter : true;
        const matchesSubCategory = subCategoryFilter ? product.subCategory === subCategoryFilter : true;
        return matchesName && matchesCategory && matchesSubCategory;
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
                        <div className={styles.inlineInputFirst}>
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
                        </div>
                        <div className={styles.inlineInput}>


                            <input
                                type="text"
                                placeholder="Catégorie"
                                value={newProduct.category || ''}
                                onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                            />

                            <input
                                type="text"
                                placeholder="Sous-catégorie"
                                value={newProduct.subCategory || ''}  // Utilisation de subCategory
                                onChange={(e) => setNewProduct({ ...newProduct, subCategory: e.target.value })}
                            />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center' }}>

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
                    </div>
                    <div style={{ display: 'flex', justifyContent: "space-between" }}>


                        <div>


                            <label>Ingrédients</label>
                            <div>
                                <input
                                    type="text"
                                    placeholder="Ajouter un ingrédient"
                                    value={newIngredient}
                                    onChange={(e) => setNewIngredient(e.target.value)}
                                />
                                <button
                                    onClick={() => {
                                        if (newIngredient) {
                                            setNewProduct({
                                                ...newProduct,
                                                ingredients: [...(newProduct.ingredients || []), newIngredient],
                                            });
                                            setNewIngredient('');
                                        }
                                    }}
                                >
                                    Ajouter
                                </button>
                            </div>
                            <ul>
                                {newProduct.ingredients?.map((ingredient, index) => (
                                    <li key={index}>
                                        {ingredient}
                                        <button
                                            onClick={() => setNewProduct({
                                                ...newProduct,
                                                ingredients: newProduct.ingredients?.filter((_, i) => i !== index),
                                            })}
                                        >
                                            Supprimer
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            {/* Suppléments */}
                            <label>Suppléments</label>
                            <div>
                                <input
                                    type="text"
                                    placeholder="Nom du supplément"
                                    value={newSupplement.name}
                                    onChange={(e) => setNewSupplement({ ...newSupplement, name: e.target.value })}
                                />
                                <input
                                    type="number"
                                    placeholder="Prix"
                                    value={newSupplement.price || ''}
                                    onChange={(e) => setNewSupplement({ ...newSupplement, price: parseFloat(e.target.value) })}
                                />
                                <button
                                    onClick={() => {
                                        if (newSupplement.name && newSupplement.price !== undefined) {
                                            setNewProduct({
                                                ...newProduct,
                                                supplements: [...(newProduct.supplements || []), newSupplement],
                                            });
                                            setNewSupplement({ name: '', price: 0 });
                                        }
                                    }}
                                >
                                    Ajouter
                                </button>

                            </div>
                            <ul>
                                {newProduct.supplements?.map((supplement, index) => (
                                    <li key={index}>
                                        {supplement.name} ({supplement.price} €)
                                        <button
                                            onClick={() => setNewProduct({
                                                ...newProduct,
                                                supplements: newProduct.supplements?.filter((_, i) => i !== index),
                                            })}
                                        >
                                            Supprimer
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                    <Editor
                        editorState={editorState}
                        onEditorStateChange={handleEditorChange}
                        placeholder="Description"
                        editorClassName="editorClass"
                    />
                    <button onClick={handleAddOrEditProduct}>
                        {editingProduct ? 'Modifier' : 'Ajouter'}
                    </button>
                    {editingProduct && (
                        <button onClick={handleCancelEdit} className={styles.cancelButton}>
                            Annuler
                        </button>
                    )}
                </div>
            </div>

            {/* Liste des produits */}
            <h2 style={{ marginTop: '20px' }}>Liste des produits</h2>
            <div className={`${styles.productsList} ${styles[viewMode]}`}>
                {filteredProducts.map(product => (
                    <div key={product._id?.toString()} className={styles.product}>
                        <img
                            src={product.imageUrl || '/uploads/image-1733574311999.jpg'}
                            alt={product.name}
                            className={styles.productImage}
                        />
                        <div className={styles.productDetails}>
                            <span className={styles.truncatedDescription}>{product.name}</span>

                            {/* Appliquer la couleur de la catégorie */}
                            <p
                                style={{
                                    padding: "5px",
                                    backgroundColor: categoryColors[product.category as keyof typeof categoryColors] || '#ccc', // Assurez-vous que la catégorie est bien une clé valide
                                    color: 'white',
                                    margin: "1px 0",
                                    borderRadius: "5px",
                                }}
                            >
                                {product.category}
                            </p>

                            <p style={{
                                padding: "5px",
                                background: "#007bff",
                                color: 'white',
                                borderRadius: "5px"
                            }}>
                                {product.subCategory}
                            </p>

                            <p className={styles.truncatedDescription}>
                                {(() => {
                                    try {
                                        const parsedDescription = JSON.parse(product.description);
                                        return parsedDescription.blocks
                                            .map((block: DraftBlock) => block.text)
                                            .join('\n');
                                    } catch {
                                        return product.description; // Retourne la description brute si ce n'est pas du JSON
                                    }
                                })()}
                            </p>

                            <p>{product.price} €</p>
                            <p>Stock : {product.stock}</p>
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
