import React, { useState, useEffect, useRef } from 'react';
import { IonRow, IonCol, IonInput, IonIcon, IonButton, useIonAlert } from '@ionic/react';
import { trashOutline, informationCircleOutline } from 'ionicons/icons';
import type { RecipeItem } from '../../models/Recipe';
import type { Oil } from '../../models/Oil';
import { useTranslation } from 'react-i18next';

interface OilTableRowProps {
  item: RecipeItem;
  oil?: Oil;
  onUpdateItem: (itemId: string, updates: Partial<RecipeItem>) => void;
  onRemoveOil: (itemId: string) => void;
}

export const OilTableRow: React.FC<OilTableRowProps> = ({
  item,
  oil,
  onUpdateItem,
  onRemoveOil
}) => {
  const { t } = useTranslation();
  const [presentAlert] = useIonAlert();
  
  // Local state for the input string to allow typing decimals like "1." without immediate parse resetting it
  const [localPercentage, setLocalPercentage] = useState<string>(item.percentage.toString());
  
  // Sync local state with prop when prop changes (e.g. initial load or calculation update not from typing)
  // However, we must be careful not to overwrite while user is typing if the update came from here.
  // A common pattern is to sync only when the value is significantly different, or track focus.
  // For simplicity here: we trust the local state while typing, but if we navigate away and back, we need the prop.
  // Let's use a ref to track if we are currently editing.
  const isEditing = useRef(false);

  useEffect(() => {
    if (!isEditing.current) {
       setLocalPercentage(item.percentage === 0 ? '' : item.percentage.toString());
    }
  }, [item.percentage]);

  const handleInput = (val: string) => {
     setLocalPercentage(val);
     const num = parseFloat(val);
     if (!isNaN(num)) {
         onUpdateItem(item.id, { percentage: num });
     } else if (val === '') {
         onUpdateItem(item.id, { percentage: 0 });
     }
  };

  const hasInfo = oil?.notes || (oil?.iodine !== undefined && oil?.iodine !== null);

  const showInfo = () => {
    if (!oil) return;
    
    let message = '';
    if (oil.iodine !== undefined && oil.iodine !== null) {
      message += `${t('iodine')}: ${oil.iodine}`;
    }
    if (oil.notes) {
      if (message) message += '\n\n'; // Abstand wenn beides da ist
      message += `${t('notes')}: ${oil.notes}`;
    }

    presentAlert({
      header: oil.name,
      message: message,
      buttons: ['OK']
    });
  };

  return (
      <IonRow className="ion-align-items-center" style={{ borderBottom: '1px solid var(--ion-border-color)' }}>
        <IonCol size="12" sizeSm="4" className="ion-align-items-center" style={{ display: 'flex', gap: '8px' }}>
            <strong>{oil?.name || t('unknownOil')}</strong>
            {hasInfo && (
              <IonIcon 
                icon={informationCircleOutline} 
                color="primary"
                style={{ cursor: 'pointer' }}
                onClick={showInfo}
              />
            )}
        </IonCol>
        <IonCol size="6" sizeSm="3">
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            border: '1px solid var(--ion-color-medium-tint)', 
            borderRadius: '4px',
            padding: '0 8px',
            backgroundColor: 'var(--ion-color-light)'
          }}>
            <IonInput
              type="number"
              value={localPercentage}
              placeholder="0"
              style={{ '--padding-start': '0' }}
              onIonFocus={() => isEditing.current = true}
              onIonBlur={() => isEditing.current = false}
              onIonInput={e => handleInput(e.detail.value!)}
            />
            <span style={{ color: 'var(--ion-color-medium)', marginLeft: '4px' }}>%</span>
          </div>
        </IonCol>
        <IonCol size="4" sizeSm="3">
          {item.weight.toFixed(1)} g
        </IonCol>
        <IonCol size="2" sizeSm="2">
          <IonButton 
            fill="clear" 
            color="danger" 
            onClick={() => onRemoveOil(item.id)}
          >
            <IonIcon icon={trashOutline} />
          </IonButton>
        </IonCol>
      </IonRow>
  );
};
