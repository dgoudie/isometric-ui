import { Link, NavLink } from 'react-router-dom';

import AppBarLayout from '../AppBarLayout/AppBarLayout';
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
                    <Link to={'/home'} className={styles.topBarTitle}>
                        ISOMETRIC
                    </Link>
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
