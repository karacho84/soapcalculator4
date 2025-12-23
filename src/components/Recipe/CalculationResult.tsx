import React from 'react';
import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonGrid,
  IonRow,
  IonCol,
  IonText,
  IonBadge
} from '@ionic/react';
import type { CalculationResult } from '../../services/SoapMath';
import { useTranslation } from 'react-i18next';

interface CalculationResultProps {
  result: CalculationResult | null;
}

const CalculationResultCard: React.FC<CalculationResultProps> = ({ result }) => {
  const { t } = useTranslation();

  if (!result) return null;

  return (
    <IonCard>
      <IonCardHeader>
        <IonCardTitle>{t('result')}</IonCardTitle>
      </IonCardHeader>
      <IonCardContent>
        {result.warnings.length > 0 && (
          <div className="ion-margin-bottom">
             {result.warnings.map((w, idx) => (
               <IonText color="danger" key={idx}><p>⚠️ {w}</p></IonText>
             ))}
          </div>
        )}

        <IonGrid>
          {/* Required Lye */}
          <IonRow className="ion-align-items-center ion-margin-bottom" style={{ borderBottom: '1px solid var(--ion-border-color)', paddingBottom: '10px' }}>
            <IonCol size="12" sizeSm="6">
              <IonText>
                <h2 style={{ margin: '0 0 4px 0', fontSize: '1.1em' }}>{t('requiredLye')}</h2>
                <p style={{ margin: 0, color: 'var(--ion-color-medium)', fontSize: '0.9em' }}>{t('amountNaohKoh')}</p>
              </IonText>
            </IonCol>
            <IonCol size="12" sizeSm="6" className="ion-text-end">
               <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                 {result.lyeAmount.naoh > 0 && (
                     <IonBadge color="primary" style={{ fontSize: '1em', padding: '8px 12px' }}>
                         {result.lyeAmount.naoh} g NaOH
                     </IonBadge>
                 )}
                 {result.lyeAmount.koh > 0 && (
                     <IonBadge color="tertiary" style={{ fontSize: '1em', padding: '8px 12px' }}>
                         {result.lyeAmount.koh} g KOH
                     </IonBadge>
                 )}
               </div>
            </IonCol>
          </IonRow>

          {/* Liquid */}
          <IonRow className="ion-align-items-center ion-margin-bottom" style={{ borderBottom: '1px solid var(--ion-border-color)', paddingBottom: '10px' }}>
            <IonCol size="8">
              <IonText>
                <h2 style={{ margin: '0 0 4px 0', fontSize: '1.1em' }}>{t('waterLiquid')}</h2>
                <p style={{ margin: 0, color: 'var(--ion-color-medium)', fontSize: '0.9em' }}>{t('forLye')}</p>
              </IonText>
            </IonCol>
            <IonCol size="4" className="ion-text-end">
               <IonBadge color="secondary" style={{ fontSize: '1em', padding: '8px 12px' }}>
                   {result.waterAmount} g
               </IonBadge>
            </IonCol>
          </IonRow>

          {/* Fragrance (if present) */}
          {result.fragranceAmount > 0 && (
            <IonRow className="ion-align-items-center ion-margin-bottom" style={{ borderBottom: '1px solid var(--ion-border-color)', paddingBottom: '10px' }}>
              <IonCol size="8">
                <IonText>
                  <h2 style={{ margin: '0 0 4px 0', fontSize: '1.1em' }}>{t('fragrance')}</h2>
                  <p style={{ margin: 0, color: 'var(--ion-color-medium)', fontSize: '0.9em' }}>{t('fragranceAmount')}</p>
                </IonText>
              </IonCol>
              <IonCol size="4" className="ion-text-end">
                 <IonBadge color="success" style={{ fontSize: '1em', padding: '8px 12px' }}>
                     {result.fragranceAmount} g
                 </IonBadge>
              </IonCol>
            </IonRow>
          )}

          {/* Total Weight */}
          <IonRow className="ion-align-items-center ion-margin-bottom" style={{ borderBottom: '1px solid var(--ion-border-color)', paddingBottom: '10px' }}>
            <IonCol size="6">
              <IonText>
                <h2 style={{ margin: '0 0 4px 0', fontSize: '1.1em', fontWeight: 'bold' }}>{t('totalSoapWeight')}</h2>
                <p style={{ margin: 0, color: 'var(--ion-color-medium)', fontSize: '0.9em' }}>{t('soapBatter')}</p>
              </IonText>
            </IonCol>
            <IonCol size="6" className="ion-text-end">
               <IonText style={{ fontSize: '1.6em', fontWeight: 'bold' }}>
                   {result.totalWeight} g
               </IonText>
            </IonCol>
          </IonRow>

          {/* Properties (Iodine & INS) */}
          <IonRow>
             <IonCol size="12">
               <IonText>
                   <h2 style={{ margin: '0 0 8px 0', fontSize: '1.1em', fontWeight: 'bold' }}>{t('properties')}</h2>
               </IonText>
             </IonCol>
          </IonRow>
          
          <IonRow className="ion-align-items-center ion-margin-bottom">
              <IonCol size="6">
                  <IonText>
                      <h3 style={{ margin: 0, fontSize: '1em' }}>{t('iodine')}</h3>
                      <p style={{ margin: 0, fontSize: '0.8em', color: 'var(--ion-color-medium)' }}>{t('iodineHelper')}</p>
                  </IonText>
              </IonCol>
              <IonCol size="6" className="ion-text-end">
                  <IonBadge color="medium" style={{ fontSize: '1em', padding: '6px 10px' }}>
                      {result.iodine}
                  </IonBadge>
              </IonCol>
          </IonRow>

          <IonRow className="ion-align-items-center">
              <IonCol size="6">
                  <IonText>
                      <h3 style={{ margin: 0, fontSize: '1em' }}>{t('ins')}</h3>
                      <p style={{ margin: 0, fontSize: '0.8em', color: 'var(--ion-color-medium)' }}>{t('insHelper')}</p>
                  </IonText>
              </IonCol>
              <IonCol size="6" className="ion-text-end">
                  <IonBadge 
                    color={result.ins >= 136 && result.ins <= 165 ? 'success' : 'warning'} 
                    style={{ fontSize: '1em', padding: '6px 10px' }}
                  >
                      {result.ins}
                  </IonBadge>
              </IonCol>
          </IonRow>

        </IonGrid>
      </IonCardContent>
    </IonCard>
  );
};

export default CalculationResultCard;
