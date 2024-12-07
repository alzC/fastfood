import React from 'react'
import styles from './styles.module.scss'

const Navbar = () => {
    return (
        <nav className={styles.nav}>
            <h1>Market Shop</h1>
            <ul className={styles.MenuList}>
                <li>Burger</li>
                <li>Tacos</li>
                <li>Tex-mex</li>
                <li>Petite faim</li>
                <li>Epicerie</li>
                <li>Boissons</li>
            </ul>
        </nav>
    )
}

export default Navbar