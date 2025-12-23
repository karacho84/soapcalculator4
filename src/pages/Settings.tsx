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
  useIonToast
} from '@ionic/react';
import { useTranslation } from 'react-i18next';
import { downloadOutline, folderOpenOutline, helpCircleOutline } from 'ionicons/icons';
import { StorageService } from '../services/StorageService';
import { DataService, type FullBackupExport } from '../services/DataService';

const Settings: React.FC = () => {
  const { t, i18n } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [presentAlert] = useIonAlert();
  const [presentToast] = useIonToast();

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
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
