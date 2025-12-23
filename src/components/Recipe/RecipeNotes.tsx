import React from 'react';
import { 
  IonCard, 
  IonCardHeader, 
  IonCardTitle, 
  IonCardContent, 
  IonItem, 
  IonLabel, 
  IonTextarea 
} from '@ionic/react';
import { useTranslation } from 'react-i18next';

interface RecipeNotesProps {
  notes?: string;
  onUpdate: (notes: string) => void;
}

const RecipeNotes: React.FC<RecipeNotesProps> = ({ notes, onUpdate }) => {
  const { t } = useTranslation();

  return (
    <IonCard>
      <IonCardHeader>
        <IonCardTitle>{t('notes')}</IonCardTitle>
      </IonCardHeader>
      <IonCardContent>
        <IonItem lines="none">
          <IonLabel position="stacked" className="ion-hide">{t('notes')}</IonLabel>
          <IonTextarea 
            value={notes} 
            onIonChange={e => onUpdate(e.detail.value!)}
            rows={5}
            placeholder={t('enterNotesHere')}
            autoGrow={true}
          />
        </IonItem>
      </IonCardContent>
    </IonCard>
  );
};

export default RecipeNotes;
