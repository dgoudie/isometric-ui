import React, {
  Suspense,
  createContext,
  useCallback,
  useEffect,
  useState,
} from 'react';
import {
  ReadableResource,
  emptyReadableResource,
  fetchFromApiAsReadableResource,
} from '../../utils/fetch-from-api';

import { ISettings } from '@dgoudie/isometric-types';
import RouteLoader from '../../components/RouteLoader/RouteLoader';

type SettingsContextTypeUpdaters = {};

type SettingsContextType = Omit<ISettings, 'userId'> &
  SettingsContextTypeUpdaters;

export const SettingsContext = createContext<SettingsContextType>({});

let initialSettingsResource = emptyReadableResource();

export default function SettingsProvider({
  children,
}: React.PropsWithChildren<{}>) {
  const [settings, setSettings] = useState<ReadableResource<ISettings>>(
    initialSettingsResource
  );

  useEffect(() => {
    setSettings(fetchFromApiAsReadableResource(`/api/settings`));
  }, []);

  return (
    <Suspense fallback={<RouteLoader />}>
      <SettingsProviderContent settingsResource={settings}>
        {children}
      </SettingsProviderContent>
    </Suspense>
  );
}

function SettingsProviderContent({
  children,
  settingsResource,
}: React.PropsWithChildren<{
  settingsResource: ReadableResource<ISettings>;
}>) {
  const [settings, setSettings] = useState(settingsResource.read());

  return (
    <Suspense fallback={<RouteLoader />}>
      <SettingsContext.Provider value={{ ...settings }}>
        {children}
      </SettingsContext.Provider>
    </Suspense>
  );
}
