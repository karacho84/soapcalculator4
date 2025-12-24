import React, { useRef } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonButtons,
  IonBackButton,
  IonIcon,
  useIonAlert,
  useIonToast,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonButton,
  IonSpinner
} from '@ionic/react';
import { useTranslation } from 'react-i18next';
import { downloadOutline, folderOpenOutline, helpCircleOutline, cloudUploadOutline, cloudDownloadOutline, copyOutline, checkmarkCircle } from 'ionicons/icons';
import { StorageService } from '../services/StorageService';
import { DataService, type FullBackupExport } from '../services/DataService';
import { useCloudSync } from '../hooks/useCloudSync';
import { Clipboard } from '@capacitor/clipboard';

const Settings: React.FC = () => {
  const { t, i18n } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [presentAlert] = useIonAlert();
  const [presentToast] = useIonToast();
  
  const { 
    isAuthenticated, 
    isSyncing, 
    recoveryKey, 
    enableSync, 
    disableSync, 
    recoverAccount,
    syncNow
  } = useCloudSync();

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
  };
  
  const copyToClipboard = async (text: string) => {
      try {
          // Try Capacitor Clipboard first (works on iOS/Android native & PWA/Web if supported)
          await Clipboard.write({
              string: text
          });
          presentToast({ message: t('keyCopied'), duration: 2000, color: 'success' });
      } catch (err) {
          // Fallback for older browsers or insecure contexts if needed, though Capacitor handles web too
          console.warn('Clipboard plugin failed, trying navigator fallback', err);
          try {
             await navigator.clipboard.writeText(text);
             presentToast({ message: t('keyCopied'), duration: 2000, color: 'success' });
          } catch (navErr) {
             console.error('All clipboard methods failed', navErr);
             presentToast({ message: 'Copy failed manually', duration: 2000, color: 'danger' });
          }
      }
  };

  const handleCopyKey = () => {
    if (recoveryKey) {
        copyToClipboard(recoveryKey);
    }
  };

  const handleEnableSync = async () => {
      try {
          const key = await enableSync();
          presentAlert({
              header: t('recoveryKeyTitle'),
              subHeader: t('recoveryKeyMessage'),
              message: key, // Display key boldly
              backdropDismiss: false,
              buttons: [
                  {
                      text: t('copy'),
                      handler: () => {
                          copyToClipboard(key);
                          return false; // Don't close alert yet
                      }
                  },
                  {
                      text: t('ok'),
                      role: 'confirm'
                  }
              ]
          })
      } catch (e: any) {
          presentToast({ message: e.message, duration: 3000, color: 'danger' });
      }
  };

  const handleRecoverData = () => {
      presentAlert({
          header: t('recoverData'),
          inputs: [
              {
                  name: 'key',
                  type: 'text',
                  placeholder: 'ID-PASSWORD'
              }
          ],
          buttons: [
              t('cancel'),
              {
                  text: t('recover'),
                  handler: (data) => {
                      if (data.key) {
                          recoverAccount(data.key).catch(e => {
                               presentToast({ message: e.message || t('syncError'), duration: 3000, color: 'danger' });
                          });
                      }
                  }
              }
          ]
      });
  };

  const handleDisableSync = () => {
      presentAlert({
          header: t('confirmDisableSync'),
          message: t('confirmDisableSyncMessage'),
          buttons: [
              t('cancel'),
              {
                  text: t('disableSync'),
                  role: 'destructive',
                  handler: () => {
                      disableSync();
                  }
              }
          ]
      });
  };

  const handleExportBackup = () => {
    const oils = StorageService.getOils();
    const recipes = StorageService.getRecipes();
    const backupData = { oils, recipes };
    const json = DataService.createExportData('backup', backupData);
    const filename = `seifenrechner_backup_${new Date().toISOString().split('T')[0]}.json`;
    DataService.downloadJson(filename, json);
    presentToast({
      message: t('exportSuccess'),
      duration: 2000,
      color: 'success'
    });
  };

  const handleImportBackupClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const json = await DataService.readJsonFile(file);
      
      // Basic validation
      if (json.type !== 'backup' || !Array.isArray(json.oils) || !Array.isArray(json.recipes)) {
        throw new Error('Invalid backup file format');
      }

      const backupData = json as FullBackupExport;

      presentAlert({
        header: t('confirmImport'),
        message: t('confirmImportMessage', { 
            oilsCount: backupData.oils.length, 
            recipesCount: backupData.recipes.length 
        }),
        buttons: [
          t('cancel'),
          {
            text: t('import'),
            handler: () => {
              StorageService.importBackup(backupData.oils, backupData.recipes);
              presentToast({
                message: t('importSuccess'),
                duration: 2000,
                color: 'success'
              });
              // Reload page to reflect changes might be cleaner than trying to update all hooks
              setTimeout(() => window.location.reload(), 500);
            }
          }
        ]
      });

    } catch (error) {
      console.error(error);
      presentToast({
        message: t('importError'),
        duration: 3000,
        color: 'danger'
      });
    } finally {
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/" />
          </IonButtons>
          <IonTitle>{t('settings')}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonList>
          {/* Language Selection */}
          <IonItem>
            <IonLabel>{t('language')}</IonLabel>
            <IonSelect 
              value={i18n.language} 
              onIonChange={e => handleLanguageChange(e.detail.value)}
              interface="popover"
            >
              <IonSelectOption value="de">Deutsch</IonSelectOption>
              <IonSelectOption value="en">English</IonSelectOption>
            </IonSelect>
          </IonItem>

          {/* Cloud Sync Section */}
          <IonItem lines="none">
            <IonLabel>
                <h3>{t('cloudSync')}</h3>
                <p className="ion-text-wrap" style={{ fontSize: '0.9em', color: 'var(--ion-color-medium)' }}>
                    {t('cloudSyncDesc')}
                </p>
            </IonLabel>
          </IonItem>

          {isAuthenticated ? (
             <div className="ion-padding-horizontal ion-padding-bottom">
                 <IonCard color="light">
                     <IonCardHeader>
                         <IonCardTitle style={{ fontSize: '1.1em', display: 'flex', alignItems: 'center', gap: '8px' }}>
                             <IonIcon icon={checkmarkCircle} color="success" />
                             {t('syncActive')}
                         </IonCardTitle>
                     </IonCardHeader>
                     <IonCardContent>
                         <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                             <IonItem lines="none" color="light" style={{ '--padding-start': '0' }}>
                                 <IonLabel>
                                     <h3 style={{ fontSize: '0.9em', color: 'var(--ion-color-medium)' }}>{t('recoveryKeyTitle')}</h3>
                                     <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '5px' }}>
                                         <code style={{ background: '#e0e0e0', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold' }}>
                                             {recoveryKey || '••••-••••'}
                                         </code>
                                         <IonButton fill="clear" size="small" onClick={handleCopyKey}>
                                             <IonIcon slot="icon-only" icon={copyOutline} />
                                         </IonButton>
                                     </div>
                                 </IonLabel>
                             </IonItem>

                            <div style={{ display: 'flex', gap: '10px' }}>
                                 <IonButton expand="block" fill="outline" size="small" onClick={() => syncNow()} disabled={isSyncing} style={{ flex: 1 }}>
                                     {isSyncing ? <IonSpinner name="dots" /> : t('import')} {/* Using 'import' as manual sync trigger name for now */}
                                 </IonButton>
                                 <IonButton expand="block" color="danger" fill="outline" size="small" onClick={handleDisableSync} disabled={isSyncing} style={{ flex: 1 }}>
                                     {t('disableSync')}
                                 </IonButton>
                            </div>
                         </div>
                     </IonCardContent>
                 </IonCard>
             </div>
          ) : (
              <div className="ion-padding">
                <IonButton expand="block" onClick={handleEnableSync} disabled={isSyncing}>
                    <IonIcon slot="start" icon={cloudUploadOutline} />
                    {isSyncing ? <IonSpinner name="dots" /> : t('enableCloudSync')}
                </IonButton>
                <IonButton expand="block" fill="outline" onClick={handleRecoverData} disabled={isSyncing} className="ion-margin-top">
                    <IonIcon slot="start" icon={cloudDownloadOutline} />
                    {t('recoverData')}
                </IonButton>
              </div>
          )}

          {/* Data Management Header */}
          <IonItem lines="none">
             <IonLabel>
                <h3>{t('dataManagement')}</h3>
                <p>{t('dataManagementDesc')}</p>
             </IonLabel>
          </IonItem>

          {/* Export Button */}
          <IonItem button onClick={handleExportBackup}>
            <IonIcon slot="start" icon={downloadOutline} />
            <IonLabel>{t('exportBackup')}</IonLabel>
          </IonItem>

          {/* Import Button */}
          <IonItem button onClick={handleImportBackupClick}>
            <IonIcon slot="start" icon={folderOpenOutline} />
            <IonLabel>{t('importBackup')}</IonLabel>
            <input 
                type="file" 
                ref={fileInputRef} 
                style={{ display: 'none' }} 
                accept=".json"
                onChange={handleFileChange}
            />
          </IonItem>

          {/* Help Link */}
          <IonItem button routerLink="/help" detail>
            <IonIcon slot="start" icon={helpCircleOutline} />
            <IonLabel>{t('help')}</IonLabel>
          </IonItem>

          {/* Version */}
          <IonItem lines="none">
            <IonLabel className="ion-text-center" color="medium">
              <p>{t('version')} {import.meta.env.PACKAGE_VERSION}</p>
            </IonLabel>
          </IonItem>

        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default Settings;
