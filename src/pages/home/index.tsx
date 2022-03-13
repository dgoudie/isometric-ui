import AppBarWithAppHeaderLayout from '../../components/AppBarWithAppHeaderLayout/AppBarWithAppHeaderLayout';
import React from 'react';

type Props = {};

const Home: React.FC<Props> = () => {
    return (
        <AppBarWithAppHeaderLayout pageTitle='Home'>
            hello
        </AppBarWithAppHeaderLayout>
    );
};

export default Home;
