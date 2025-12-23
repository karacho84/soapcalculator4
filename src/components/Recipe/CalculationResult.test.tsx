import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import CalculationResultCard from './CalculationResult';
import type { CalculationResult } from '../../services/SoapMath';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../i18n';
// @ts-ignore
import React from 'react';

// Mock Ionic components since they are not fully supported in jsdom env without setup
vi.mock('@ionic/react', () => ({
  IonCard: ({ children }: any) => <div data-testid="ion-card">{children}</div>,
  IonCardHeader: ({ children }: any) => <div data-testid="ion-card-header">{children}</div>,
  IonCardTitle: ({ children }: any) => <div data-testid="ion-card-title">{children}</div>,
  IonCardContent: ({ children }: any) => <div data-testid="ion-card-content">{children}</div>,
  IonGrid: ({ children }: any) => <div data-testid="ion-grid">{children}</div>,
  IonRow: ({ children }: any) => <div data-testid="ion-row">{children}</div>,
  IonCol: ({ children }: any) => <div data-testid="ion-col">{children}</div>,
  IonText: ({ children }: any) => <span>{children}</span>,
  IonBadge: ({ children }: any) => <span>{children}</span>,
}));

describe('CalculationResultCard', () => {
  it('should render nothing if result is null', () => {
    const { container } = render(
      <I18nextProvider i18n={i18n}>
        <CalculationResultCard result={null} />
      </I18nextProvider>
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('should render calculation results correctly', () => {
    const mockResult: CalculationResult = {
      lyeAmount: { naoh: 50, koh: 0 },
      waterAmount: 150,
      fragranceAmount: 30, // 3% of 1000g fat
      totalWeight: 1230,
      iodine: 55,
      ins: 145,
      warnings: [],
      isValid: true
    };

    render(
      <I18nextProvider i18n={i18n}>
        <CalculationResultCard result={mockResult} />
      </I18nextProvider>
    );

    expect(screen.getByText('50 g NaOH')).toBeInTheDocument();
    expect(screen.getByText('150 g')).toBeInTheDocument();
    expect(screen.getByText('1230 g')).toBeInTheDocument();
  });

  it('should display warnings if present', () => {
    const mockResult: CalculationResult = {
        lyeAmount: { naoh: 50, koh: 0 },
        waterAmount: 150,
        fragranceAmount: 0,
        totalWeight: 700,
        iodine: 0,
        ins: 0,
        warnings: ['Warning 1', 'Warning 2'],
        isValid: true
      };
  
      render(
        <I18nextProvider i18n={i18n}>
          <CalculationResultCard result={mockResult} />
        </I18nextProvider>
      );
  
      expect(screen.getByText('⚠️ Warning 1')).toBeInTheDocument();
      expect(screen.getByText('⚠️ Warning 2')).toBeInTheDocument();
  });
});
