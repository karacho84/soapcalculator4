import React, { useState } from 'react';
import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonGrid,
  IonRow,
  IonCol,
  IonButton,
  IonIcon,
  IonSelect,
  IonSelectOption,
  IonText
} from '@ionic/react';
import { addOutline } from 'ionicons/icons';
import type { RecipeItem } from '../../models/Recipe';
import type { Oil } from '../../models/Oil';
import { useTranslation } from 'react-i18next';
import { OilTableRow } from './OilTableRow';

interface OilTableProps {
  items: RecipeItem[];
  oils: Oil[];
  onAddOil: (oilId: string) => void;
  onRemoveOil: (itemId: string) => void;
  onUpdateItem: (itemId: string, updates: Partial<RecipeItem>) => void;
}

const OilTable: React.FC<OilTableProps> = ({ 
  items, 
  oils, 
  onAddOil, 
  onRemoveOil, 
  onUpdateItem 
}) => {
  const [selectedOilId, setSelectedOilId] = useState<string>('');
  const { t } = useTranslation();

  const handleAddClick = () => {
    if (selectedOilId) {
      onAddOil(selectedOilId);
      setSelectedOilId('');
    }
  };

  const totalPercentage = items.reduce((sum, item) => sum + item.percentage, 0);
  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
  const isPercentageValid = Math.abs(totalPercentage - 100) <= 0.1;

  return (
    <IonCard>
      <IonCardHeader>
        <IonCardTitle>{t('oilsAndFats')}</IonCardTitle>
      </IonCardHeader>
      <IonCardContent>
        <IonGrid>
          <IonRow className="ion-hide-sm-down" style={{ borderBottom: '1px solid var(--ion-border-color)', fontWeight: 'bold' }}>
            <IonCol size="4">{t('oil')}</IonCol>
            <IonCol size="3">{t('percentage')}</IonCol>
            <IonCol size="3">{t('weight')}</IonCol>
            <IonCol size="2"></IonCol>
          </IonRow>

          {items.length === 0 ? (
            <div className="ion-padding ion-text-center" style={{ opacity: 0.6, padding: '40px 0' }}>
              <IonIcon icon={addOutline} style={{ fontSize: '48px' }} />
              <p>{t('selectOilToAdd') || 'Wähle ein Öl aus, um es hinzuzufügen'}</p>
            </div>
          ) : (
            items.map(item => {
              const oil = oils.find(o => o.id === item.oilId);
              return (
                <OilTableRow 
                  key={item.id}
                  item={item}
                  oil={oil}
                  onUpdateItem={onUpdateItem}
                  onRemoveOil={onRemoveOil}
                />
              );
            })
          )}

          {/* Footer / Add Row */}
          <IonRow className="ion-margin-top ion-align-items-center">
             <IonCol size="12" sizeSm="8">
                <IonSelect 
                    value={selectedOilId} 
                    placeholder={t('selectOil')}
                    onIonChange={e => setSelectedOilId(e.detail.value)}
                    interface="popover"
                >
                    {oils.map(oil => {
                        const isIncomplete = oil.sapNaoh === undefined || oil.sapKoh === undefined;
                        return (
                        <IonSelectOption 
                          key={oil.id} 
                          value={oil.id}
                          disabled={isIncomplete}
                        >
                            {isIncomplete ? `⚠️ ${oil.name}` : oil.name}
                        </IonSelectOption>
                    )})}
                </IonSelect>
             </IonCol>
             <IonCol size="12" sizeSm="4">
                <IonButton expand="block" disabled={!selectedOilId} onClick={handleAddClick}>
                    <IonIcon slot="start" icon={addOutline} />
                    {t('add')}
                </IonButton>
             </IonCol>
          </IonRow>

          {/* Summary Row */}
          <IonRow className="ion-margin-top" style={{ borderTop: '2px solid var(--ion-border-color)', paddingTop: '10px' }}>
              <IonCol size="12" sizeSm="4">
                  <strong>{t('sum')}:</strong>
              </IonCol>
              <IonCol size="6" sizeSm="3">
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <IonText color={!isPercentageValid ? 'danger' : 'success'}>
                        <strong style={{ fontSize: '1.2em' }}>{totalPercentage.toFixed(1)} %</strong>
                    </IonText>
                    {!isPercentageValid && (
                        <small style={{ color: 'var(--ion-color-danger)' }}>
                            {t('sumOfOilsWarning', { value: totalPercentage.toFixed(1) })}
                        </small>
                    )}
                  </div>
              </IonCol>
              <IonCol size="6" sizeSm="5" className="ion-text-end ion-text-sm-start">
                  <strong style={{ fontSize: '1.2em' }}>{totalWeight.toFixed(1)} g</strong>
              </IonCol>
          </IonRow>

        </IonGrid>
      </IonCardContent>
    </IonCard>
  );
};

export default OilTable;
