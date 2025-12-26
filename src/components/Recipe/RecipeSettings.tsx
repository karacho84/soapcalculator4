import React, { useState, useEffect, useRef } from 'react';
import { 
  IonCard, 
  IonCardHeader, 
  IonCardTitle, 
  IonCardContent, 
  IonItem, 
  IonLabel, 
  IonInput, 
  IonSelect, 
  IonSelectOption, 
  IonRange,
  IonButton,
  IonIcon
} from '@ionic/react';
import { removeOutline, addOutline } from 'ionicons/icons';
import type { Recipe, LyeType } from '../../models/Recipe';
import { useTranslation } from 'react-i18next';

interface RecipeSettingsProps {
  recipe: Recipe;
  onUpdate: (settings: Partial<Recipe>) => void;
}

const RecipeSettings: React.FC<RecipeSettingsProps> = ({ recipe, onUpdate }) => {
  const { t } = useTranslation();
  
  // Local state for totalFatWeight to handle "1." input cases etc.
  const [localFatWeight, setLocalFatWeight] = useState<string>(recipe.totalFatWeight.toString());
  const isEditingFat = useRef(false);

  // Sync local state when prop changes externally (not while editing)
  useEffect(() => {
    if (!isEditingFat.current) {
        setLocalFatWeight(recipe.totalFatWeight.toString());
    }
  }, [recipe.totalFatWeight]);

  const handleFatInput = (val: string) => {
      setLocalFatWeight(val);
      const num = parseFloat(val);
      if (!isNaN(num)) {
          onUpdate({ totalFatWeight: num });
      } else if (val === '') {
          onUpdate({ totalFatWeight: 0 });
      }
  };

  const adjustFatWeight = (amount: number) => {
      const current = parseFloat(localFatWeight) || 0;
      const newValue = Math.max(0, current + amount);
      handleFatInput(newValue.toString());
  };

  return (
    <IonCard>
      <IonCardHeader>
        <IonCardTitle>{t('settings')}</IonCardTitle>
      </IonCardHeader>
      <IonCardContent>
        {/* Total Fat Weight */}
        <IonItem lines="none">
          <IonLabel position="stacked" style={{ fontSize: '1.1em', fontWeight: '500' }}>{t('totalFatWeight')}</IonLabel>
          <div style={{ display: 'flex', alignItems: 'center', width: '100%', marginTop: '8px', gap: '8px' }}>
            <IonButton 
              fill="clear" 
              color="medium" 
              onClick={() => adjustFatWeight(-10)}
              style={{ margin: 0 }}
            >
              <IonIcon slot="icon-only" icon={removeOutline} />
            </IonButton>
            
            <IonInput 
              type="number" 
              value={localFatWeight} 
              onIonFocus={() => isEditingFat.current = true}
              onIonBlur={() => isEditingFat.current = false}
              onIonInput={e => handleFatInput(e.detail.value!)}
              style={{ 
                fontSize: '1.4em', 
                fontWeight: 'bold', 
                textAlign: 'center',
                border: '1px solid var(--ion-border-color)',
                borderRadius: '8px',
                margin: '0 4px'
              }}
            />

            <IonButton 
              fill="clear" 
              color="medium" 
              onClick={() => adjustFatWeight(10)}
              style={{ margin: 0 }}
            >
              <IonIcon slot="icon-only" icon={addOutline} />
            </IonButton>
          </div>
        </IonItem>

        {/* Lye Type */}
        <IonItem>
          <IonLabel position="stacked" style={{ fontSize: '1.1em', fontWeight: '500' }}>{t('lye')}</IonLabel>
          <IonSelect 
            value={recipe.lyeType} 
            onIonChange={e => onUpdate({ lyeType: e.detail.value as LyeType })}
            interface="popover"
            style={{ fontSize: '1.1em' }}
          >
            <IonSelectOption value="NaOH">{t('solidSoap')}</IonSelectOption>
            <IonSelectOption value="KOH">{t('liquidSoap')}</IonSelectOption>
            <IonSelectOption value="Mixed">{t('mixedSoap')}</IonSelectOption>
          </IonSelect>
        </IonItem>

        {/* Ratio (Only for Mixed) */}
        {recipe.lyeType === 'Mixed' && (
           <IonItem>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: '4px' }}>
              <IonLabel position="stacked" style={{ fontSize: '1.1em', fontWeight: '500' }}>{t('ratioKoh')}</IonLabel>
              <span style={{ fontSize: '1.2em', fontWeight: 'bold', color: 'var(--ion-color-primary)' }}>{recipe.ratioKoh}% KOH</span>
            </div>
            <IonRange 
              min={0} 
              max={100} 
              pin={true} 
              value={recipe.ratioKoh || 0} 
              onIonChange={e => onUpdate({ ratioKoh: e.detail.value as number })}
              className="ion-no-padding"
            >
              <IonLabel slot="start">0%</IonLabel>
              <IonLabel slot="end">100%</IonLabel>
            </IonRange>
           </IonItem>
        )}

        {/* Superfat */}
        <IonItem>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: '4px' }}>
            <IonLabel position="stacked" style={{ fontSize: '1.1em', fontWeight: '500' }}>{t('superFatLabel', { value: '' }).replace(':', '').trim()}</IonLabel>
            <span style={{ fontSize: '1.2em', fontWeight: 'bold', color: 'var(--ion-color-primary)' }}>{recipe.superFat}%</span>
          </div>
          <IonRange 
            min={0} 
            max={25} 
            pin={true} 
            value={recipe.superFat} 
            onIonChange={e => onUpdate({ superFat: e.detail.value as number })}
            className="ion-no-padding"
          >
            <IonLabel slot="start">0%</IonLabel>
            <IonLabel slot="end">25%</IonLabel>
          </IonRange>
        </IonItem>

        {/* Water Ratio */}
        <IonItem>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: '4px' }}>
            <IonLabel position="stacked" style={{ fontSize: '1.1em', fontWeight: '500' }}>{t('waterRatioLabel', { value: '' }).replace(':', '').trim()}</IonLabel>
            <span style={{ fontSize: '1.2em', fontWeight: 'bold', color: 'var(--ion-color-primary)' }}>{recipe.waterRatio}%</span>
          </div>
          <IonRange 
            min={20} 
            max={50} 
            pin={true} 
            value={recipe.waterRatio} 
            onIonChange={e => onUpdate({ waterRatio: e.detail.value as number })}
            className="ion-no-padding"
          >
            <IonLabel slot="start">20%</IonLabel>
            <IonLabel slot="end">50%</IonLabel>
          </IonRange>
        </IonItem>

        {/* Fragrance Settings */}
        <IonItem>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: '4px' }}>
            <IonLabel position="stacked" style={{ fontSize: '1.1em', fontWeight: '500' }}>{t('fragrance')}</IonLabel>
            <span style={{ fontSize: '1.2em', fontWeight: 'bold', color: 'var(--ion-color-primary)' }}>{recipe.fragrance?.percentage || 0}%</span>
          </div>
          <IonRange
            min={0}
            max={10}
            pin={true}
            step={0.5}
            value={recipe.fragrance?.percentage || 0}
            onIonChange={e => onUpdate({ 
              fragrance: { 
                ...recipe.fragrance,
                percentage: e.detail.value as number,
                type: recipe.fragrance?.type || 'none'
              } 
            })}
            className="ion-no-padding"
          >
            <IonLabel slot="start">0%</IonLabel>
            <IonLabel slot="end">10%</IonLabel>
          </IonRange>
        </IonItem>
      </IonCardContent>
    </IonCard>
  );
};

export default RecipeSettings;
