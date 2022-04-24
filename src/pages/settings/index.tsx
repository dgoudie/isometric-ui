import React, { useContext } from 'react';

import AppBarWithAppHeaderLayout from '../../components/AppBarWithAppHeaderLayout/AppBarWithAppHeaderLayout';
import { SettingsContext } from '../../providers/Settings/Settings';
import styles from './index.module.scss';

const Settings: React.FC = () => {
  const settingsContext = useContext(SettingsContext);
  return (
    <AppBarWithAppHeaderLayout pageTitle='Settings'>
      <div className={styles.root}></div>
    </AppBarWithAppHeaderLayout>
  );
};
export default Settings;
