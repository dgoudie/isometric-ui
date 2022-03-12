import AppBarLayout from '../AppBarLayout/AppBarLayout';
import styles from './AppBarWithAppHeaderLayout.module.scss';

type Props = {};

export default function AppBarWithAppHeaderLayout({
    children,
}: React.PropsWithChildren<Props>) {
    return (
        <AppBarLayout
            header={
                <header className={styles.topBar}>
                    <div className={styles.topBarTitle}>ISOMETRIC</div>
                    <a className={styles.topBarSettingsLink} href='/settings'>
                        <i className='fa-solid fa-gear'></i>
                    </a>
                </header>
            }
        >
            <div className={styles.body}>{children}</div>
        </AppBarLayout>
    );
}
