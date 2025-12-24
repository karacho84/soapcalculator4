import React from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonBackButton,
  IonText,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle
} from '@ionic/react';
import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';

const Help: React.FC = () => {
  const { t } = useTranslation();

  const topics = [
    { key: 'basics', title: t('helpTopics.basics'), content: t('helpTopics.basicsContent') },
    { key: 'export', title: t('helpTopics.export'), content: t('helpTopics.exportContent') },
    { key: 'backup', title: t('helpTopics.backup'), content: t('helpTopics.backupContent') },
    { key: 'sync', title: t('helpTopics.sync'), content: t('helpTopics.syncContent') },
    { key: 'oils', title: t('helpTopics.oils'), content: t('helpTopics.oilsContent') },
  ];

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/settings" />
          </IonButtons>
          <IonTitle>{t('help')}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
         <IonText color="medium" className="ion-margin-bottom">
             <p className="ion-padding-start">{t('helpDesc')}</p>
         </IonText>

         {topics.map(topic => (
             <IonCard key={topic.key}>
                 <IonCardHeader>
                     <IonCardTitle>{topic.title}</IonCardTitle>
                 </IonCardHeader>
                 <IonCardContent>
                     <ReactMarkdown>{topic.content}</ReactMarkdown>
                 </IonCardContent>
             </IonCard>
         ))}
      </IonContent>
    </IonPage>
  );
};

export default Help;