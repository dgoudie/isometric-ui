import React, { useEffect } from 'react';

import AppBarWithTextHeaderLayout from '../../components/AppBarWithTextHeaderLayout/AppBarWithTextHeaderLayout';

const Settings: React.FC = () => {
    useEffect(() => {
        document.title = `Settings | ISOMETRIC`;
    }, []);
    return (
        <AppBarWithTextHeaderLayout text='Settings'>
            Some Settings
        </AppBarWithTextHeaderLayout>
    );
};
export default Settings;
