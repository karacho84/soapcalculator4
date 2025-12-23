import React, { useRef } from 'react';
import { 
  IonContent, 
  IonHeader, 
  IonPage, 
  IonTitle, 
  IonToolbar,
  IonList,
  IonItem,
  IonLabel,
  IonFab,
  IonFabButton,
  IonIcon,
  IonButtons,
  IonButton,
  IonNote,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
  useIonAlert,
  useIonViewWillEnter,
  useIonToast
} from '@ionic/react';
import { add, trash, calculatorOutline, flaskOutline, settingsOutline, shareOutline, downloadOutline } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { useRecipes } from '../hooks/useRecipes';
import { useTranslation } from 'react-i18next';
import { DataService } from '../services/DataService';
import { StorageService } from '../services/StorageService';
import type { Recipe } from '../models/Recipe';

const Home: React.FC = () => {
  const history = useHistory();
  const { recipes, deleteRecipe, refreshRecipes } = useRecipes();
  const [presentAlert] = useIonAlert();
  const [presentToast] = useIonToast();
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useIonViewWillEnter(() => {
    refreshRecipes();
  });

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    // Close the sliding item
    const slidingItem = (e.target as HTMLElement).closest('ion-item-sliding');
    if (slidingItem) {
        slidingItem.close();
    }
    
    presentAlert({
      header: t('deleteRecipe'),
      message: t('deleteRecipeMessage'),
      buttons: [
        t('cancel'),
        {
          text: t('delete'),
          role: 'destructive',
          handler: () => {
            deleteRecipe(id);
          }
        }
      ]
    });
  };

  const handleExportRecipe = (e: React.MouseEvent, recipe: Recipe) => {
    e.stopPropagation();
    // Close sliding item
    const slidingItem = (e.target as HTMLElement).closest('ion-item-sliding');
    if (slidingItem) slidingItem.close();

    const json = DataService.createExportData('recipe', recipe);
    const filename = `recipe_${recipe.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`;
    DataService.downloadJson(filename, json);
    presentToast({
        message: t('exportSuccess'),
        duration: 2000,
        color: 'success'
    });
  };

  const handleImportRecipeClick = () => {
      fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      try {
          const json = await DataService.readJsonFile(file);
          if (json.type !== 'recipe' || !json.data) {
              throw new Error('Invalid recipe file');
          }
          
          const importedRecipe = json.data as Recipe;
          // Ensure new ID to avoid conflict or overwrite? 
          // Strategy: Always create new with imported data but new ID if duplicate?
          // For now let's just save it. StorageService.saveRecipe handles update if ID exists.
          // To be safe for "Import", maybe generate new ID if one exists?
          // User request was "Import", usually implies adding. 
          // Let's ask user if they want to overwrite if exists, or save as copy?
          // Simple MVP: Save (Overwrite if ID matches, which is unlikely from other users, but likely from same user backup)
          
          // Let's check if it exists
          const existing = recipes.find(r => r.id === importedRecipe.id);
          if (existing) {
              presentAlert({
                  header: t('recipeExists'),
                  message: t('recipeExistsMessage'),
                  buttons: [
                      {
                          text: t('cancel'),
                          role: 'cancel'
                      },
                      {
                          text: t('overwrite'),
                          handler: () => {
                              StorageService.saveRecipe(importedRecipe);
                              refreshRecipes();
                              presentToast({ message: t('importSuccess'), duration: 2000, color: 'success' });
                          }
                      },
                      {
                          text: t('saveAsCopy'),
                          handler: () => {
                              const newRecipe = { ...importedRecipe, id: crypto.randomUUID(), name: `${importedRecipe.name} (Copy)` };
                              StorageService.saveRecipe(newRecipe);
                              refreshRecipes();
                              presentToast({ message: t('importSuccess'), duration: 2000, color: 'success' });
                          }
                      }
                  ]
              });
          } else {
              StorageService.saveRecipe(importedRecipe);
              refreshRecipes();
              presentToast({ message: t('importSuccess'), duration: 2000, color: 'success' });
          }

      } catch (error) {
          console.error(error);
          presentToast({ message: t('importError'), duration: 3000, color: 'danger' });
      } finally {
          if (fileInputRef.current) fileInputRef.current.value = '';
      }
  };


  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('de-DE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton routerLink="/settings">
                <IonIcon slot="icon-only" icon={settingsOutline} />
            </IonButton>
          </IonButtons>
          <IonTitle>{t('appTitle')}</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={handleImportRecipeClick}>
                <IonIcon slot="icon-only" icon={downloadOutline} />
            </IonButton>
            <IonButton routerLink="/oils">
              <IonIcon slot="icon-only" icon={flaskOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <input 
            type="file" 
            ref={fileInputRef} 
            style={{ display: 'none' }} 
            accept=".json"
            onChange={handleFileChange}
        />

        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">{t('myRecipes')}</IonTitle>
          </IonToolbar>
        </IonHeader>

        {recipes.length === 0 ? (
          <div className="ion-padding ion-text-center">
            <p>{t('noRecipes')}</p>
            <p>{t('createFirstRecipe')}</p>
          </div>
        ) : (
          <IonList style={{ paddingBottom: '120px' }}>
            {recipes.map(recipe => (
              <IonItemSliding key={recipe.id}>
                <IonItem 
                    button 
                    onClick={() => history.push(`/calculator/${recipe.id}`)}
                    detail={false}
                >
                    <IonIcon icon={calculatorOutline} slot="start" />
                    <IonLabel>
                    <h2>{recipe.name}</h2>
                    <p>
                        <IonNote>{formatDate(recipe.created)}</IonNote> • {recipe.totalFatWeight}g {t('fat')}
                    </p>
                    </IonLabel>
                </IonItem>

                <IonItemOptions side="end">
                    <IonItemOption color="secondary" onClick={(e) => handleExportRecipe(e, recipe)}>
                        <IonIcon slot="icon-only" icon={shareOutline} />
                    </IonItemOption>
                    <IonItemOption color="danger" onClick={(e) => handleDelete(e, recipe.id)}>
                        <IonIcon slot="icon-only" icon={trash} />
                    </IonItemOption>
                </IonItemOptions>
              </IonItemSliding>
            ))}
          </IonList>
        )}

        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton onClick={() => history.push('/calculator/new')}>
            <IonIcon icon={add} />
          </IonFabButton>
        </IonFab>
      </IonContent>
    </IonPage>
  );
};

export default Home;
