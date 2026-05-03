import React, { createContext, useContext, useState, useCallback } from 'react';

interface PrefillData {
  doctorId?: string;
  department?: string;
  hospitalId?: string;
  date?: string;
  time?: string;
}

interface FormPrefillContextType {
  prefillData: PrefillData | null;
  setPrefillData: (data: PrefillData) => void;
  clearPrefillData: () => void;
}

const FormPrefillContext = createContext<FormPrefillContextType | undefined>(undefined);

export function FormPrefillProvider({ children }: { children: React.ReactNode }) {
  const [prefillData, setPrefill] = useState<PrefillData | null>(null);

  const setPrefillData = useCallback((data: PrefillData) => {
    setPrefill(data);
  }, []);

  const clearPrefillData = useCallback(() => {
    setPrefill(null);
  }, []);

  return (
    <FormPrefillContext.Provider value={{ prefillData, setPrefillData, clearPrefillData }}>
      {children}
    </FormPrefillContext.Provider>
  );
}

export function useFormPrefill() {
  const context = useContext(FormPrefillContext);
  if (!context) {
    throw new Error('useFormPrefill must be used within FormPrefillProvider');
  }
  return context;
}
