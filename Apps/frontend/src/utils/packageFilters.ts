
// Package filtering utilities for insurance packages

export interface PackageEligibility {
  minAge: number;
  maxAge: number;
  allowedGenders: ('male' | 'female')[];
  description?: string;
}

// Define eligibility rules for each package
export const packageEligibilityRules: Record<string, PackageEligibility> = {
  'AIA Health Happy Kids': {
    minAge: 0,
    maxAge: 17,
    allowedGenders: ['male', 'female'],
    description: 'สำหรับเด็กอายุ 0-17 ปี'
  },
  'AIA H&S (new standard)': {
    minAge: 18,
    maxAge: 65,
    allowedGenders: ['male', 'female'],
    description: 'สำหรับผู้ใหญ่อายุ 18-65 ปี'
  },
  'AIA H&S Extra (new standard)': {
    minAge: 25,
    maxAge: 60,
    allowedGenders: ['male', 'female'],
    description: 'สำหรับผู้ใหญ่อายุ 25-60 ปี'
  },
  'AIA Health Saver': {
    minAge: 18,
    maxAge: 70,
    allowedGenders: ['male', 'female'],
    description: 'สำหรับผู้ใหญ่อายุ 18-70 ปี'
  },
  'AIA Health Happy': {
    minAge: 18,
    maxAge: 65,
    allowedGenders: ['male', 'female'],
    description: 'สำหรับผู้ใหญ่อายุ 18-65 ปี'
  },
  'AIA Infinite Care (new standard)': {
    minAge: 21,
    maxAge: 55,
    allowedGenders: ['male', 'female'],
    description: 'สำหรับผู้ใหญ่อายุ 21-55 ปี'
  },
  'HB': {
    minAge: 18,
    maxAge: 65,
    allowedGenders: ['male', 'female'],
    description: 'สำหรับผู้ใหญ่อายุ 18-65 ปี'
  },
  'AIA HB Extra': {
    minAge: 25,
    maxAge: 60,
    allowedGenders: ['male', 'female'],
    description: 'สำหรับผู้ใหญ่อายุ 25-60 ปี'
  },
  'ผลประโยชน์ Day Case ของสัญญาเพิ่มเติม HB และ AIA HB Extra': {
    minAge: 18,
    maxAge: 65,
    allowedGenders: ['male', 'female'],
    description: 'เสริมสำหรับแพ็กเกจ HB'
  },
  'AIA Health Cancer': {
    minAge: 18,
    maxAge: 70,
    allowedGenders: ['male', 'female'],
    description: 'ประกันโรคมะเร็ง อายุ 18-70 ปี'
  },
  'AIA Care for Cancer': {
    minAge: 20,
    maxAge: 65,
    allowedGenders: ['male', 'female'],
    description: 'ดูแลโรคมะเร็ง อายุ 20-65 ปี'
  },
  'AIA CI Plus': {
    minAge: 18,
    maxAge: 60,
    allowedGenders: ['male', 'female'],
    description: 'โรคร้ายแรง อายุ 18-60 ปี'
  },
  'AIA CI Top Up': {
    minAge: 25,
    maxAge: 55,
    allowedGenders: ['male', 'female'],
    description: 'เสริมโรคร้ายแรง อายุ 25-55 ปี'
  },
  'multi pay-ci plus': {
    minAge: 30,
    maxAge: 50,
    allowedGenders: ['male', 'female'],
    description: 'โรคร้ายแรงแบบจ่ายหลายครั้ง อายุ 30-50 ปี'
  },
  'Lady Care & Lady Care Plus': {
    minAge: 18,
    maxAge: 65,
    allowedGenders: ['female'],
    description: 'สำหรับผู้หญิงเท่านั้น อายุ 18-65 ปี'
  },
  'AIA TPD': {
    minAge: 18,
    maxAge: 60,
    allowedGenders: ['male', 'female'],
    description: 'ทุพพลภาพถาวร อายุ 18-60 ปี'
  },
  'AIA Multi-Pay CI': {
    minAge: 25,
    maxAge: 55,
    allowedGenders: ['male', 'female'],
    description: 'โรคร้ายแรงจ่ายหลายครั้ง อายุ 25-55 ปี'
  },
  'AIA Total Care': {
    minAge: 30,
    maxAge: 50,
    allowedGenders: ['male', 'female'],
    description: 'ดูแลครอบคลุม อายุ 30-50 ปี'
  },
  'Accident Coverage': {
    minAge: 1,
    maxAge: 75,
    allowedGenders: ['male', 'female'],
    description: 'ประกันอุบัติเหตุ อายุ 1-75 ปี'
  }
};

// Check if a package is eligible for the user
export const isPackageEligible = (
  packageName: string,
  userAge: number,
  userGender: 'male' | 'female'
): boolean => {
  const rules = packageEligibilityRules[packageName];
  if (!rules) return true; // Default to allow if no rules defined

  const ageEligible = userAge >= rules.minAge && userAge <= rules.maxAge;
  const genderEligible = rules.allowedGenders.includes(userGender);

  return ageEligible && genderEligible;
};

// Get eligibility reason for display
export const getEligibilityReason = (
  packageName: string,
  userAge: number,
  userGender: 'male' | 'female'
): string => {
  const rules = packageEligibilityRules[packageName];
  if (!rules) return '';

  if (!isPackageEligible(packageName, userAge, userGender)) {
    if (userAge < rules.minAge || userAge > rules.maxAge) {
      return `ไม่เหมาะสำหรับอายุ ${userAge} ปี (เหมาะสำหรับอายุ ${rules.minAge}-${rules.maxAge} ปี)`;
    }
    if (!rules.allowedGenders.includes(userGender)) {
      return `ไม่เหมาะสำหรับ${userGender === 'male' ? 'ชาย' : 'หญิง'}`;
    }
  }

  return rules.description || '';
};

// Filter packages by eligibility
export const filterEligiblePackages = (
  packages: string[],
  userAge: number,
  userGender: 'male' | 'female'
): string[] => {
  return packages.filter(packageName => 
    isPackageEligible(packageName, userAge, userGender)
  );
};
