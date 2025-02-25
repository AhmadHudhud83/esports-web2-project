import styles from './Header.module.css';
import LogoutButton from '../../../Logout/logout';

const Header = () => {
  return (
    <div id={styles.container}>
      <nav>
        <a href='http://localhost:3000/'>
          <img src="/images/logo.png" alt="Logo" />
          <h1>WARZONE ELITE</h1>
        </a>
        <div id={styles.logoutbtn}>
          <LogoutButton pageName="supervisor" />
        </div>

      </nav>
    </div>
  );
};

export default Header;