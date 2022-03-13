import React, { useEffect } from 'react';

import AppBarWithAppHeaderLayout from '../../components/AppBarWithAppHeaderLayout/AppBarWithAppHeaderLayout';

const Settings: React.FC = () => {
    useEffect(() => {
        document.title = `Settings | ISOMETRIC`;
    }, []);
    return <AppBarWithAppHeaderLayout>Some Settings</AppBarWithAppHeaderLayout>;
};
export default Settings;
