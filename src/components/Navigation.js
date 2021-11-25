import { Link } from 'react-router-dom';
import styles from "./Navigation.module.css"

function Navigation() {
  return (
    <div className={styles.navContainer}>
      <div className={styles.logo}>Adatbázisok etr</div>
      <nav>
        <Link className={styles.navLink} to="/felhasznalok">Felhasználók</Link>
        <Link className={styles.navLink} to="/kurzusok">Kurzusok</Link>
      </nav>
    </div>
  )
}

export default Navigation