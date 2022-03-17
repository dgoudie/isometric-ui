import Loader from '../Loader/Loader';
import React from 'react';
import styles from './RouteLoader.module.scss';

export default function RouteLoader() {
    return (
        <div className={styles.routeLoader}>
            <Loader />
        </div>
    );
}
