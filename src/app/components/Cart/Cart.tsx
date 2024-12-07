'use client';

import { useAppSelector, useAppDispatch } from '../../../redux/hook';
import { removeFromCart, clearCart } from '../../../redux/cartSlice';

export default function Cart() {
    const cart = useAppSelector(state => state.cart);
    const dispatch = useAppDispatch();

    return (
        <div>
            <h2>Panier</h2>
            <ul>
                {cart.items.map(item => (
                    <li key={item.id}>
                        {item.name} - {item.quantity} x {item.price}€
                        <button onClick={() => dispatch(removeFromCart({ id: item.id }))}>
                            Supprimer
                        </button>
                    </li>
                ))}
            </ul>
            <p>Total : {cart.totalPrice}€</p>
            <button onClick={() => dispatch(clearCart())}>Vider le panier</button>
        </div>
    );
}
