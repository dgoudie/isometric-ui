import React, { useMemo } from 'react';

import AppBarWithAppHeaderLayout from '../../components/AppBarWithAppHeaderLayout/AppBarWithAppHeaderLayout';
import { Link } from 'react-router-dom';
import { getGreeting } from '../../utils/get-greeting';
import styles from './index.module.scss';

type Props = {};

const Home: React.FC<Props> = () => {
    const greeting = useMemo(() => getGreeting(), []);
    return (
        <AppBarWithAppHeaderLayout pageTitle='Home'>
            <div className={styles.wrapper}>
                <h1>{greeting}</h1>
                <div className={styles.root}>
                    <Link to={'/workout-plan'} className={'standard-button'}>
                        <i className='fa-solid fa-calendar-week'></i>
                        Edit Workout Plan
                    </Link>
                </div>
            </div>
        </AppBarWithAppHeaderLayout>
    );
};

export default Home;
