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
  IonInput,
  IonText,
  useIonAlert
} from '@ionic/react';
import { trashOutline, addOutline, informationCircleOutline } from 'ionicons/icons';
import type { RecipeItem } from '../../models/Recipe';
import type { Oil } from '../../models/Oil';
import { useTranslation } from 'react-i18next';

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
  const [presentAlert] = useIonAlert();

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

          {items.map(item => {
            const oil = oils.find(o => o.id === item.oilId);
            return (
              <IonRow key={item.id} className="ion-align-items-center" style={{ borderBottom: '1px solid var(--ion-border-color)' }}>
                <IonCol size="12" sizeSm="4" className="ion-align-items-center" style={{ display: 'flex', gap: '8px' }}>
                    <strong>{oil?.name || t('unknownOil')}</strong>
                    {oil?.notes && (
                      <IonIcon 
                        icon={informationCircleOutline} 
                        color="primary"
                        style={{ cursor: 'pointer' }}
                        onClick={() => presentAlert({
                          header: oil.name,
                          message: oil.notes,
                          buttons: ['OK']
                        })}
                      />
                    )}
                </IonCol>
                <IonCol size="6" sizeSm="3">
                  <IonInput
                    type="number"
                    value={item.percentage === 0 ? '' : item.percentage}
                    placeholder="%"
                    onIonChange={e => onUpdateItem(item.id, { percentage: parseFloat(e.detail.value!) || 0 })}
                  />
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
          })}

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
                  <IonText color={!isPercentageValid ? 'danger' : 'success'}>
                      <strong>{totalPercentage.toFixed(1)} %</strong>
                  </IonText>
              </IonCol>
              <IonCol size="6" sizeSm="5">
                  <strong>{totalWeight.toFixed(1)} g</strong>
              </IonCol>
          </IonRow>

        </IonGrid>
      </IonCardContent>
    </IonCard>
  );
};

export default OilTable;
