'use client';

import { useAppDispatch } from '../../../redux/hook';
import { addToCart } from '../../../redux/cartSlice';

type ProductProps = {
    id: string;
    name: string;
    price: number;
};

export default function Product({ id, name, price }: ProductProps) {
    const dispatch = useAppDispatch();

    const handleAddToCart = () => {
        dispatch(addToCart({ id, name, price, quantity: 1 }));
    };

    return (
        <div>
            <h2>{name}</h2>
            <p>{price}€</p>
            <button onClick={handleAddToCart}>Ajouter au panier</button>
        </div>
    );
}
