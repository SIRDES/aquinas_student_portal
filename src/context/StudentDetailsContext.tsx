"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export const StudentContext = createContext<any>({});
type StudentContextProviderProps = {
  children: React.ReactNode;
};
export const StudentContextProvider = ({
  children,
}: StudentContextProviderProps) => {
  const [studentDetails, setStudentDetails] = useState<any>(null);

  const value = {
    studentDetails,
    setStudentDetails,
  };

  return (
    <StudentContext.Provider value={value}>{children}</StudentContext.Provider>
  );
};

export const useStudentDetailsContext = () => useContext(StudentContext);
