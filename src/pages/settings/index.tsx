import React, { useContext, useEffect } from 'react';

import { AfterExerciseTimerContext } from '../../providers/AfterExerciseTimer/AfterExerciseTimer';
import AppBarWithAppHeaderLayout from '../../components/AppBarWithAppHeaderLayout/AppBarWithAppHeaderLayout';

const Settings: React.FC = () => {
  return (
    <AppBarWithAppHeaderLayout pageTitle='Settings'>
      Some Settings
    </AppBarWithAppHeaderLayout>
  );
};
export default Settings;
