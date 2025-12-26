import React, { useState } from 'react';
import { 
  IonContent, 
  IonHeader, 
  IonPage, 
  IonTitle, 
  IonToolbar, 
  IonButtons,
  IonGrid,
  IonRow,
  IonCol,
  IonButton,
  IonIcon,
  IonInput,
  useIonToast,
  IonAlert
} from '@ionic/react';
import { saveOutline, arrowBackOutline } from 'ionicons/icons';
import { useParams, useHistory } from 'react-router-dom';
import { useCalculator } from '../hooks/useCalculator';
import RecipeSettings from '../components/Recipe/RecipeSettings';
import OilTable from '../components/Recipe/OilTable';
import CalculationResultCard from '../components/Recipe/CalculationResult';
import RecipeNotes from '../components/Recipe/RecipeNotes';
import { useTranslation } from 'react-i18next';

const Calculator: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const [presentToast] = useIonToast();
  const { t } = useTranslation();
  const [showUnsavedAlert, setShowUnsavedAlert] = useState(false);
  
  const { 
    recipe, 
    calculationResult, 
    updateSettings, 
    addOilItem, 
    removeOilItem, 
    updateOilItem,
    saveCurrentRecipe,
    availableOils,
    isDirty
  } = useCalculator(id);

  const [isTitleEditing, setIsTitleEditing] = useState(false);

  const handleSave = () => {
    saveCurrentRecipe();
    presentToast({
      message: t('saved'),
      duration: 2000,
      color: 'success'
    });
  };

  const handleBack = () => {
    if (isDirty) {
      setShowUnsavedAlert(true);
    } else {
      history.goBack();
    }
  };

  return (
    <IonPage>
      <IonAlert
        isOpen={showUnsavedAlert}
        onDidDismiss={() => setShowUnsavedAlert(false)}
        header={t('unsavedChangesTitle')}
        message={t('unsavedChangesMessage')}
        buttons={[
          {
            text: t('discard'),
            role: 'cancel',
            handler: () => {
              history.goBack();
            }
          },
          {
            text: t('save'),
            handler: () => {
              handleSave();
              history.goBack();
            }
          }
        ]}
      />
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton onClick={handleBack}>
              <IonIcon slot="icon-only" icon={arrowBackOutline} />
            </IonButton>
          </IonButtons>
          <IonTitle>
              {isTitleEditing ? (
                  <IonInput 
                    value={recipe.name} 
                    onIonBlur={() => setIsTitleEditing(false)}
                    onIonInput={e => updateSettings({ name: e.detail.value! })}
                    autofocus
                  />
              ) : (
                  <span onClick={() => setIsTitleEditing(true)}>{recipe.name} ✎</span>
              )}
          </IonTitle>
          <IonButtons slot="end">
              <IonButton onClick={handleSave}>
                  <IonIcon slot="icon-only" icon={saveOutline} />
              </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">{recipe.name}</IonTitle>
          </IonToolbar>
        </IonHeader>

        <IonGrid fixed>
          <IonRow>
            {/* Left Column: Oil Table */}
            <IonCol size="12" sizeLg="4">
               <OilTable 
                 items={recipe.items} 
                 oils={availableOils} 
                 onAddOil={addOilItem} 
                 onRemoveOil={removeOilItem} 
                 onUpdateItem={updateOilItem}
               />
            </IonCol>

            {/* Middle Column: Settings */}
            <IonCol size="12" sizeLg="4">
               <RecipeSettings 
                 recipe={recipe} 
                 onUpdate={updateSettings} 
               />
               
               <div className="ion-margin-top">
                 <RecipeNotes 
                   notes={recipe.notes} 
                   onUpdate={notes => updateSettings({ notes })} 
                 />
               </div>
            </IonCol>

            {/* Right Column: Result */}
            <IonCol size="12" sizeLg="4">
               <CalculationResultCard result={calculationResult} />
            </IonCol>
          </IonRow>
        </IonGrid>

      </IonContent>
    </IonPage>
  );
};

export default Calculator;
