import { Timestamp } from 'firebase/firestore';

export type UserRole =
  | 'bedside_nurse'
  | 'consultant'
  | 'junior_doctor'
  | 'ward_manager'
  | 'physiotherapist'
  | 'parent';

export type Permission =
  | 'view_babies'
  | 'create_baby'
  | 'view_vitals'
  | 'create_vitals'
  | 'view_medications'
  | 'administer_medications'
  | 'prescribe_medications'
  | 'approve_prescriptions'
  | 'view_feeds'
  | 'record_feeds'
  | 'view_care_plans'
  | 'create_care_plans'
  | 'view_clinical_reviews'
  | 'create_clinical_reviews'
  | 'manage_ward'
  | 'view_audit_logs';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  permissions: Permission[];
  unitId?: string;
  trustId?: string;
  babyIds?: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  bedside_nurse: [
    'view_babies',
    'view_vitals',
    'create_vitals',
    'view_medications',
    'administer_medications',
    'view_feeds',
    'record_feeds',
    'view_care_plans',
  ],
  consultant: [
    'view_babies',
    'create_baby',
    'view_vitals',
    'create_vitals',
    'view_medications',
    'prescribe_medications',
    'approve_prescriptions',
    'view_feeds',
    'view_care_plans',
    'create_care_plans',
    'view_clinical_reviews',
    'create_clinical_reviews',
  ],
  junior_doctor: [
    'view_babies',
    'view_vitals',
    'view_medications',
    'view_feeds',
    'view_care_plans',
    'view_clinical_reviews',
    'create_clinical_reviews',
  ],
  ward_manager: [
    'view_babies',
    'view_vitals',
    'view_medications',
    'view_feeds',
    'manage_ward',
    'view_audit_logs',
  ],
  physiotherapist: [
    'view_babies',
    'view_vitals',
    'view_care_plans',
  ],
  parent: [
    'view_babies',
    'view_vitals',
    'view_medications',
    'view_feeds',
    'view_care_plans',
  ],
};

export const ROLE_DISPLAY_NAMES: Record<UserRole, string> = {
  bedside_nurse: 'Bedside Nurse',
  consultant: 'Consultant',
  junior_doctor: 'Junior Doctor',
  ward_manager: 'Ward Manager',
  physiotherapist: 'Physiotherapist',
  parent: 'Parent',
};
