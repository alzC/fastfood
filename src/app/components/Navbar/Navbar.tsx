import React from 'react'
import styles from './styles.module.scss'

const Navbar = () => {
    return (
        <nav className={styles.nav}>
            <h1 className={styles.neonText}><span>Market</span><span className={styles.neonText2}>Shop</span></h1>
            <ul className={styles.MenuList}>
                <li className={styles.neonText}>Sandwich</li>
                <li className={styles.neonText}>Tacos</li>
                <li className={styles.neonText}>Tex-mex</li>
                <li className={styles.neonText}>Petite faim</li>
                <li className={styles.neonText}>Epicerie</li>
                <li className={styles.neonText}>Boissons</li>
            </ul>
        </nav>
    )
}

export default Navbar