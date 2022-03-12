import { NavLink } from 'react-router-dom';
import React from 'react';
import classNames from 'classnames';
import styles from './AppBarLayout.module.scss';

type Props = {
    header?: React.ReactNode;
};

export default function AppBarLayout({
    children,
    header,
}: React.PropsWithChildren<Props>) {
    return (
        <div className={styles.root}>
            {header}
            <div className={styles.body}>{children}</div>
            <div className={styles.bottomBar}>
                <div className={styles.bottomBarInner}>
                    <AppBarButton
                        href='/home'
                        text='Home'
                        iconClass='fa-house'
                    />
                    <AppBarButton
                        href='/exercises'
                        text='Exercises'
                        iconClass='fa-dumbbell'
                    />
                    <AppBarButton
                        href='/workouts'
                        text='Workouts'
                        iconClass='fa-list-check'
                    />
                </div>
            </div>
        </div>
    );
}

type AppBarButtonProps = {
    href: string;
    text: string;
    iconClass: string;
};

function AppBarButton({ href, text, iconClass }: AppBarButtonProps) {
    return (
        <NavLink
            to={href}
            className={({ isActive }) => (isActive ? styles.active : undefined)}
        >
            <i className={classNames('fa-solid', iconClass)}></i>
            {text}
        </NavLink>
    );
}
