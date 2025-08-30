export type PracticalChecklist = {
  preOp: { ppe: boolean; forksDown: boolean; brakeSet: boolean };
  maneuvers: { startStopSmooth: boolean; slowTurns: boolean; hornAtCorners: boolean };
  loadHandling: { lowTiltBack: boolean; capacityRespected: boolean };
  shutdown: { neutral: boolean; forksDown: boolean; keyOff: boolean; branchOK: boolean };
};

export type PracticalPayload = {
  enrollmentId: string;
  traineeUserId: string; // learner's user id
  evaluatorName: string;
  evaluatorTitle?: string;
  siteLocation?: string;
  evaluationDate?: string; // ISO date
  checklist: PracticalChecklist;
  notes?: string;
  practicalPass: boolean;
  signatureUrl?: string; // set after upload
};
