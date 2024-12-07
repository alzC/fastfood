import styles from "./page.module.css";
import Navbar from "./components/Navbar/Navbar";

export default function Home() {
  return (
    <div className={styles.page}>
      <header>
        <Navbar />
        <div className={styles.banner}>
          <p>Nos menu </p>
          <p>Au prix extra savoureux</p>
        </div>
      </header>
      <main>

      </main>
    </div>
  );
}
