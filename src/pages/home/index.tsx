import React, { useEffect } from 'react';

import AppBarWithAppHeaderLayout from '../../components/AppBarWithAppHeaderLayout/AppBarWithAppHeaderLayout';

type Props = {};

const Home: React.FC<Props> = () => {
    useEffect(() => {
        document.title = `Home | ISOMETRIC`;
    }, []);
    return <AppBarWithAppHeaderLayout>hello</AppBarWithAppHeaderLayout>;
};

export default Home;
