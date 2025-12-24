import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Route } from 'react-router-dom';
import OilManager from './pages/OilManager';
import Calculator from './pages/Calculator';
import Settings from './pages/Settings';
import Help from './pages/Help';
import Home from './pages/Home';
import React, { useEffect } from 'react';
import { useCloudSync } from './hooks/useCloudSync';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables */
import './theme/variables.css';

setupIonicReact();

const App: React.FC = () => {
  const { isAuthenticated, syncNow } = useCloudSync();

  useEffect(() => {
    // Auto-sync on app start if authenticated
    if (isAuthenticated) {
        // Pull latest data (or decide strategy: push local first? Merge?)
        // Currently syncNow triggers push. 
        // For app start, we probably want to PULL to get updates from other devices.
        // BUT: if we pull, we might overwrite local unsaved changes.
        // Safer strategy for MVP: 
        // 1. Manual sync in settings is primary way.
        // 2. Or, create a separate "initialize" function in hook that pulls once.
        // For now, let's stick to manual sync to avoid data loss until conflict resolution is robust.
        // Or better: Push on start to ensure latest local is saved?
        
        // Let's implement auto-push on start to ensure backup.
        syncNow();
    }
  }, [isAuthenticated]);

  return (
  <IonApp>
    <IonReactRouter>
      <IonRouterOutlet>
        <Route exact path="/" component={Home} />
        <Route exact path="/oils" component={OilManager} />
        <Route exact path="/settings" component={Settings} />
        <Route exact path="/help" component={Help} />
        <Route exact path="/calculator/:id" component={Calculator} />
      </IonRouterOutlet>
    </IonReactRouter>
  </IonApp>
  );
};

export default App;
