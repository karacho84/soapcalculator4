import React, { useState, useRef } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
  IonFab,
  IonFabButton,
  IonIcon,
  IonNote,
  IonButtons,
  IonBackButton,
  IonButton,
  useIonToast,
  useIonAlert
} from '@ionic/react';
import { add, trash, create, warningOutline, shareOutline, downloadOutline } from 'ionicons/icons';
import { useOils } from '../hooks/useOils';
import { OilModal } from '../components/Oil/OilModal';
import type { Oil } from '../models/Oil';
import { useTranslation } from 'react-i18next';
import { DataService } from '../services/DataService';

const OilManager: React.FC = () => {
  const { oils, addOil, updateOil, deleteOil } = useOils();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOil, setEditingOil] = useState<Oil | null>(null);
  const { t } = useTranslation();
  const [presentToast] = useIonToast();
  const [presentAlert] = useIonAlert();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddClick = () => {
    setEditingOil(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (oil: Oil) => {
    setEditingOil(oil);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (oilId: string) => {
    deleteOil(oilId);
  };

  const handleSave = (oil: Oil) => {
    if (editingOil) {
      updateOil(oil);
    } else {
      addOil(oil);
    }
  };

  const handleExportOil = (e: React.MouseEvent, oil: Oil) => {
    e.stopPropagation();
    // Close sliding item
    const slidingItem = (e.target as HTMLElement).closest('ion-item-sliding');
    if (slidingItem) slidingItem.close();

    const json = DataService.createExportData('oil', oil);
    const filename = `oil_${oil.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`;
    DataService.downloadJson(filename, json);
    presentToast({
        message: t('exportSuccess'),
        duration: 2000,
        color: 'success'
    });
  };

  const handleImportOilClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
        const json = await DataService.readJsonFile(file);
        if (json.type !== 'oil' || !json.data) {
            throw new Error('Invalid oil file');
        }
        
        const importedOil = json.data as Oil;
        
        // Similar check as Recipe
        const existing = oils.find(o => o.id === importedOil.id);
        if (existing) {
             presentAlert({
                  header: t('oilExists'),
                  message: t('oilExistsMessage'),
                  buttons: [
                      {
                          text: t('cancel'),
                          role: 'cancel'
                      },
                      {
                          text: t('overwrite'),
                          handler: () => {
                              updateOil(importedOil); // Use hook update or service save? Hook updates state, Service persists. 
                              // Hook might rely on re-fetch or internal state update. 
                              // Let's use hook if possible but here we might just use storage directly and reload page or use hook's update method if available exposed? 
                              // useOils exposes updateOil which calls StorageService.saveOils(updatedOils)
                              // So updateOil is fine.
                              presentToast({ message: t('importSuccess'), duration: 2000, color: 'success' });
                          }
                      },
                      {
                          text: t('saveAsCopy'),
                          handler: () => {
                              const newOil = { ...importedOil, id: crypto.randomUUID(), name: `${importedOil.name} (Copy)` };
                              addOil(newOil);
                              presentToast({ message: t('importSuccess'), duration: 2000, color: 'success' });
                          }
                      }
                  ]
              });
        } else {
            addOil(importedOil);
            presentToast({ message: t('importSuccess'), duration: 2000, color: 'success' });
        }

    } catch (error) {
        console.error(error);
        presentToast({ message: t('importError'), duration: 3000, color: 'danger' });
    } finally {
        if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/" />
          </IonButtons>
          <IonTitle>{t('oilManager')}</IonTitle>
          <IonButtons slot="end">
             <IonButton onClick={handleImportOilClick}>
                 <IonIcon slot="icon-only" icon={downloadOutline} />
             </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <input 
            type="file" 
            ref={fileInputRef} 
            style={{ display: 'none' }} 
            accept=".json"
            onChange={handleFileChange}
        />
        <IonList>
          {oils.map((oil) => {
             const isIncomplete = oil.sapNaoh === undefined || oil.sapKoh === undefined;
             return (
            <IonItemSliding key={oil.id}>
              <IonItem button onClick={() => handleEditClick(oil)}>
                <IonLabel>
                  <h2>
                      {oil.name}
                      {isIncomplete && (
                          <IonIcon 
                              icon={warningOutline} 
                              color="warning" 
                              style={{ marginLeft: '8px', verticalAlign: 'middle' }} 
                          />
                      )}
                  </h2>
                  <p>{oil.notes}</p>
                </IonLabel>
                <IonNote slot="end">
                  NaOH: {oil.sapNaoh !== undefined ? oil.sapNaoh : '-'}
                </IonNote>
              </IonItem>
              <IonItemOptions side="end">
                <IonItemOption
                   color="secondary"
                   onClick={(e) => handleExportOil(e, oil)}
                >
                    <IonIcon slot="icon-only" icon={shareOutline} />
                </IonItemOption>
                <IonItemOption
                  color="primary"
                  onClick={() => handleEditClick(oil)}
                >
                  <IonIcon slot="icon-only" icon={create} />
                </IonItemOption>
                <IonItemOption
                  color="danger"
                  onClick={() => handleDeleteClick(oil.id)}
                >
                  <IonIcon slot="icon-only" icon={trash} />
                </IonItemOption>
              </IonItemOptions>
            </IonItemSliding>
          )})}
        </IonList>

        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton onClick={handleAddClick}>
            <IonIcon icon={add} />
          </IonFabButton>
        </IonFab>

        <OilModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
          initialOil={editingOil}
        />
      </IonContent>
    </IonPage>
  );
};

export default OilManager;
