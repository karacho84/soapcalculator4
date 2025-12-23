export interface Oil {
  id: string;
  name: string;
  sapNaoh?: number; // Verseifungszahl NaOH (optional for draft)
  sapKoh?: number;  // Verseifungszahl KOH (optional for draft)
  iodine?: number; // Jodzahl
  notes?: string;
}
