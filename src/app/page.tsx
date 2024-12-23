import styles from "./page.module.css";
import Link from "next/link";

export default function Home() {
  return (
    <div className={styles.page}>
      <header>
        <h1 className={styles.logo}>
          <span className={styles.neonText}>Market</span>
          <span className={styles.neonText2}>
            <span className={styles.textPart}>Sh</span>
            <div className={styles.neonCircle}>
              <img className={styles.shop} src="/assets/caddie.png" alt="o" />
            </div>
            <span className={styles.textPart}>p</span>
          </span>
        </h1>
      </header>
      <main className={styles.main}>


        <div>
          <Link className={styles.shopping} href={"/epicerie"}>
            <img src="assets/shop.png" alt="" />
            <p>Epicerie</p>
          </Link>
        </div>
      </main>
      <footer>
        <p className={styles.snap}> <img src="/assets/snap.png" alt="" /></p>
      </footer>
    </div>
  );
}
/* <div className={styles.cook}>
          <img src="assets/cook.png" alt="" />
          <p>Cuisine</p>
        </div>*/
