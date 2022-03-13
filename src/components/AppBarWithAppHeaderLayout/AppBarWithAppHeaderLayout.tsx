import AppBarLayout from '../AppBarLayout/AppBarLayout';
import { NavLink } from 'react-router-dom';
import styles from './AppBarWithAppHeaderLayout.module.scss';

type Props = {
    pageTitle: string;
    showLoading?: boolean;
};

export default function AppBarWithAppHeaderLayout({
    children,
    pageTitle,
    showLoading = false,
}: React.PropsWithChildren<Props>) {
    return (
        <AppBarLayout
            showLoading={showLoading}
            pageTitle={pageTitle}
            header={
                <header className={styles.topBar}>
                    <div className={styles.topBarTitle}>ISOMETRIC</div>
                    <NavLink
                        className={({ isActive }) =>
                            isActive
                                ? styles.topBarSettingsLinkActive
                                : styles.topBarSettingsLink
                        }
                        to='/settings'
                    >
                        <i className='fa-solid fa-gear'></i>
                    </NavLink>
                </header>
            }
        >
            <div className={styles.body}>{children}</div>
        </AppBarLayout>
    );
}
