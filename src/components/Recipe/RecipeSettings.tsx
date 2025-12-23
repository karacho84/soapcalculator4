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
  IonRange 
} from '@ionic/react';
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

  return (
    <IonCard>
      <IonCardHeader>
        <IonCardTitle>{t('settings')}</IonCardTitle>
      </IonCardHeader>
      <IonCardContent>
        {/* Total Fat Weight */}
        <IonItem>
          <IonLabel position="stacked">{t('totalFatWeight')}</IonLabel>
          <IonInput 
            type="number" 
            value={localFatWeight} 
            onIonFocus={() => isEditingFat.current = true}
            onIonBlur={() => isEditingFat.current = false}
            onIonInput={e => handleFatInput(e.detail.value!)}
          />
        </IonItem>

        {/* Lye Type */}
        <IonItem>
          <IonLabel position="stacked">{t('lye')}</IonLabel>
          <IonSelect 
            value={recipe.lyeType} 
            onIonChange={e => onUpdate({ lyeType: e.detail.value as LyeType })}
            interface="popover"
          >
            <IonSelectOption value="NaOH">{t('solidSoap')}</IonSelectOption>
            <IonSelectOption value="KOH">{t('liquidSoap')}</IonSelectOption>
            <IonSelectOption value="Mixed">{t('mixedSoap')}</IonSelectOption>
          </IonSelect>
        </IonItem>

        {/* Ratio (Only for Mixed) */}
        {recipe.lyeType === 'Mixed' && (
           <IonItem>
            <IonLabel position="stacked">{t('ratioKoh')}</IonLabel>
            <IonRange 
              min={0} 
              max={100} 
              pin={true} 
              value={recipe.ratioKoh || 0} 
              onIonChange={e => onUpdate({ ratioKoh: e.detail.value as number })}
            >
              <IonLabel slot="start">0%</IonLabel>
              <IonLabel slot="end">100%</IonLabel>
            </IonRange>
           </IonItem>
        )}

        {/* Superfat */}
        <IonItem>
          <IonLabel position="stacked">{t('superFatLabel', { value: recipe.superFat })}</IonLabel>
          <IonRange 
            min={0} 
            max={25} 
            pin={true} 
            value={recipe.superFat} 
            onIonChange={e => onUpdate({ superFat: e.detail.value as number })}
          >
            <IonLabel slot="start">0%</IonLabel>
            <IonLabel slot="end">25%</IonLabel>
          </IonRange>
        </IonItem>

        {/* Water Ratio */}
        <IonItem>
          <IonLabel position="stacked">{t('waterRatioLabel', { value: recipe.waterRatio })}</IonLabel>
          <IonRange 
            min={20} 
            max={50} 
            pin={true} 
            value={recipe.waterRatio} 
            onIonChange={e => onUpdate({ waterRatio: e.detail.value as number })}
          >
            <IonLabel slot="start">20%</IonLabel>
            <IonLabel slot="end">50%</IonLabel>
          </IonRange>
        </IonItem>

        {/* Fragrance Settings */}
        <IonItem>
          <IonLabel position="stacked">{t('fragrance')} ({recipe.fragrance?.percentage || 0}%)</IonLabel>
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
