import React, { useState, useEffect } from 'react';
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonContent,
  IonItem,
  IonLabel,
  IonInput,
  IonTextarea,
  IonNote,
} from '@ionic/react';
import { v4 as uuidv4 } from 'uuid';
import type { Oil } from '../../models/Oil';
import { useTranslation } from 'react-i18next';

interface OilModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (oil: Oil) => void;
  initialOil?: Oil | null;
}

export const OilModal: React.FC<OilModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialOil,
}) => {
  const [name, setName] = useState('');
  const [sapNaoh, setSapNaoh] = useState<string>('');
  const [sapKoh, setSapKoh] = useState<string>('');
  const [iodine, setIodine] = useState<string>('');
  const [notes, setNotes] = useState('');
  const { t } = useTranslation();

  // Sync state with initialOil only when modal opens or initialOil changes
  useEffect(() => {
    if (isOpen) {
        const oil = initialOil || { name: '', sapNaoh: '', sapKoh: '', iodine: '', notes: '' };
        
        // This effect initializes the form state when the modal opens or the oil to edit changes.
        // It's a valid use case for setting state in an effect.
        
        setName(oil.name || '');
        setSapNaoh(oil.sapNaoh !== undefined && oil.sapNaoh !== '' ? oil.sapNaoh.toString() : '');
        setSapKoh(oil.sapKoh !== undefined && oil.sapKoh !== '' ? oil.sapKoh.toString() : '');
        setIodine(oil.iodine !== undefined ? oil.iodine.toString() : '');
        setNotes(oil.notes || '');
    }
    // We intentionally depend on isOpen and initialOil
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, initialOil]);

  const handleSave = () => {
    const naoh = parseFloat(sapNaoh);
    const koh = parseFloat(sapKoh);
    const iod = iodine ? parseFloat(iodine) : undefined;

    // Check minimum requirement: Name must be present.
    // SAP values can be NaN/missing now, but if they are provided as text, they must be valid numbers.
    if (!name) {
      return;
    }
    
    // Optional: You might want to validate that if sapNaoh is provided (not empty string), it is a valid number.
    // But parseFloat("") is NaN. We need to handle empty strings as undefined/null in the object
    // or allow 0. Ideally, we just check if the user *tried* to enter something invalid?
    // For now, we trust basic input types or let them save "incomplete" oils.

    const oil: Oil = {
      id: initialOil ? initialOil.id : uuidv4(),
      name,
      sapNaoh: isNaN(naoh) ? undefined : naoh,
      sapKoh: isNaN(koh) ? undefined : koh,
      iodine: iod,
      notes,
    };

    onSave(oil);
    onClose();
  };

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onClose}>
      <IonHeader>
        <IonToolbar>
          <IonTitle>{initialOil ? t('editOil') : t('newOil')}</IonTitle>
          <IonButtons slot="start">
            <IonButton onClick={onClose}>{t('cancel')}</IonButton>
          </IonButtons>
          <IonButtons slot="end">
            <IonButton strong={true} onClick={handleSave}>
              {t('save')}
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonItem>
          <IonLabel position="stacked">{t('name')}</IonLabel>
          <IonInput
            value={name}
            placeholder={t('placeholderName')}
            onIonInput={(e) => setName(e.detail.value!)}
          />
        </IonItem>

        <IonItem>
          <IonLabel position="stacked">{t('sapNaoh')}</IonLabel>
          <IonInput
            type="number"
            value={sapNaoh}
            placeholder="0.134"
            step="0.001"
            onIonInput={(e) => setSapNaoh(e.detail.value!)}
          />
          <IonNote slot="helper">{t('sapNaohHelper')}</IonNote>
        </IonItem>

        <IonItem>
          <IonLabel position="stacked">{t('sapKoh')}</IonLabel>
          <IonInput
            type="number"
            value={sapKoh}
            placeholder="0.188"
            step="0.001"
            onIonInput={(e) => setSapKoh(e.detail.value!)}
          />
          <IonNote slot="helper">{t('sapKohHelper')}</IonNote>
        </IonItem>

        <IonItem>
          <IonLabel position="stacked">{t('iodine')}</IonLabel>
          <IonInput
            type="number"
            value={iodine}
            placeholder="55"
            step="1"
            onIonInput={(e) => setIodine(e.detail.value!)}
          />
          <IonNote slot="helper">{t('iodineHelper')}</IonNote>
        </IonItem>

        <IonItem>
          <IonLabel position="stacked">{t('notes')}</IonLabel>
          <IonTextarea
            value={notes}
            placeholder={t('notesPlaceholder')}
            onIonInput={(e) => setNotes(e.detail.value!)}
            rows={3}
          />
        </IonItem>
      </IonContent>
    </IonModal>
  );
};
