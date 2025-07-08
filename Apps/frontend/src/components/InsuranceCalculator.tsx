import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Calculator, RotateCcw, Package, Shield, Search, Save, CheckCircle, ChevronDown, Minus, Plus, Eye, Filter, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import QuoteResult from './QuoteResult';
import { isPackageEligible, filterEligiblePackages, getEligibilityReason } from '@/utils/packageFilters';

interface CalculatorData {
  gender: string;
  currentAge: string;
  coverageAge: string;
  paymentFrequency: string;
  plans: string[];
  packages: string[];
}

interface StepData {
  selectedPackage: string;
  selectedPlan: string;
  searchResults: any;
  savedData: any;
}

interface SubPlan {
  id: string;
  name: string;
  coverage: string;
  monthlyPremium: number;
  annualPremium: number;
  minAge: number;
  maxAge: number;
  genderRestriction?: 'male' | 'female' | null;
}

interface SelectedPackage {
  id: string;
  name: string;
  category: string;
  subPackages?: string[];
  selectedPlans: {
    planId: string;
    planName: string;
    coverage: string;
    units: number;
    monthlyPremium: number;
    annualPremium: number;
  }[];
}

const InsuranceCalculator = () => {
  const [formData, setFormData] = useState<CalculatorData>({
    gender: '',
    currentAge: '',
    coverageAge: '',
    paymentFrequency: 'annual',
    plans: [],
    packages: []
  });
  
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [stepData, setStepData] = useState<StepData>({
    selectedPackage: '',
    selectedPlan: '',
    searchResults: null,
    savedData: null
  });

  const [showResult, setShowResult] = useState(false);
  const [calculatedPremium, setCalculatedPremium] = useState<{
    monthly: number;
    quarterly: number;
    semiAnnual: number;
    annual: number;
  } | null>(null);

  // Category selection states
  const [selectedPackages, setSelectedPackages] = useState<SelectedPackage[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [showAllPlans, setShowAllPlans] = useState(false);

  const { toast } = useToast();

  const allPackages = [
    'AIA Health Happy Kids',
    'AIA H&S (new standard)',
    'AIA H&S Extra (new standard)',
    'AIA Health Saver',
    'AIA Health Happy',
    'AIA Infinite Care (new standard)',
    'HB',
    'AIA HB Extra',
    'AIA Health Cancer',
    'AIA Care for Cancer',
    'AIA CI Plus',
    'AIA CI Top Up',
    'Lady Care & Lady Care Plus',
    'AIA TPD',
    'AIA Multi-Pay CI',
    'AIA Total Care',
    'Accident Coverage'
  ];

  const plansByPackage: Record<string, string[]> = {
    'AIA Health Happy Kids': ['Basic Plan', 'Premium Plan', 'Deluxe Plan'],
    'AIA H&S (new standard)': ['Standard Plan', 'Enhanced Plan'],
    'AIA H&S Extra (new standard)': ['Extra Plan A', 'Extra Plan B'],
    'AIA Health Saver': ['Saver Basic', 'Saver Plus'],
    'AIA Health Happy': ['Happy Basic', 'Happy Premium'],
    'AIA Infinite Care (new standard)': ['Infinite Basic', 'Infinite Premium'],
    'HB': ['HB Standard', 'HB Plus'],
    'AIA HB Extra': ['HB Extra A', 'HB Extra B'],
    'AIA Health Cancer': ['Cancer Basic', 'Cancer Premium'],
    'AIA Care for Cancer': ['Care Basic', 'Care Plus'],
    'AIA CI Plus': ['CI Basic', 'CI Premium'],
    'AIA CI Top Up': ['Top Up A', 'Top Up B'],
    'Lady Care & Lady Care Plus': ['Lady Basic', 'Lady Premium'],
    'AIA TPD': ['TPD Standard', 'TPD Plus'],
    'AIA Multi-Pay CI': ['Multi A', 'Multi B'],
    'AIA Total Care': ['Total Basic', 'Total Premium'],
    'Accident Coverage': ['Accident Basic', 'Accident Plus']
  };

  // Category data
  const categories = {
    additional: {
      id: 'additional',
      name: 'Additional contract',
      packages: [
        'AIA Health Happy Kids',
        'AIA H&S (new standard)',
        'AIA H&S Extra (new standard)',
        'AIA Health Saver',
        'AIA Health Happy',
        'AIA Infinite Care (new standard)',
        'HB',
        'AIA HB Extra'
      ]
    },
    critical: {
      id: 'critical',
      name: 'Critical Illness',
      packages: [
        'AIA Health Cancer',
        'AIA Care for Cancer',
        'AIA CI Plus',
        'AIA CI Top Up',
        'AIA Multi-Pay CI',
        'Lady Care & Lady Care Plus',
        'AIA TPD'
      ]
    },
    accident: {
      id: 'accident',
      name: 'Accident coverage',
      packages: [
        'AIA Total Care',
        'Accident Coverage'
      ]
    }
  };

  const getEligiblePackages = () => {
    if (!formData.currentAge || !formData.gender) return [];
    return filterEligiblePackages(
      allPackages,
      parseInt(formData.currentAge),
      formData.gender as 'male' | 'female'
    );
  };

  // Category selection functions
  const getFilteredCategories = () => {
    const validGender = (formData.gender === 'male' || formData.gender === 'female') ? formData.gender : 'male';
    const validAge = formData.currentAge && parseInt(formData.currentAge) > 0 ? parseInt(formData.currentAge) : 25;

    const filteredCategories = { ...categories };
    
    Object.keys(filteredCategories).forEach(categoryKey => {
      const category = filteredCategories[categoryKey];
      category.packages = filterEligiblePackages(category.packages, validAge, validGender);
    });

    Object.keys(filteredCategories).forEach(categoryKey => {
      if (filteredCategories[categoryKey].packages.length === 0) {
        delete filteredCategories[categoryKey];
      }
    });

    return filteredCategories;
  };

  const getSubPlans = (packageName: string): SubPlan[] => {
    const basePlans = [
      { coverage: '1M', multiplier: 1 },
      { coverage: '5M', multiplier: 5 },
      { coverage: '10M', multiplier: 10 },
      { coverage: '15M', multiplier: 15 }
    ];

    const basePricing = {
      'AIA Health Happy Kids': { monthly: 500, annual: 5500 },
      'AIA H&S (new standard)': { monthly: 800, annual: 9000 },
      'AIA H&S Extra (new standard)': { monthly: 1200, annual: 13500 },
      'AIA Health Saver': { monthly: 600, annual: 6800 },
      'AIA Health Happy': { monthly: 900, annual: 10200 },
      'AIA Infinite Care (new standard)': { monthly: 1500, annual: 17000 },
      'HB': { monthly: 700, annual: 8000 },
      'AIA HB Extra': { monthly: 1000, annual: 11500 },
      'AIA Health Cancer': { monthly: 1200, annual: 13800 },
      'AIA Care for Cancer': { monthly: 1000, annual: 11500 },
      'AIA CI Plus': { monthly: 1500, annual: 17500 },
      'AIA CI Top Up': { monthly: 800, annual: 9200 },
      'Lady Care & Lady Care Plus': { monthly: 1100, annual: 12800 },
      'AIA TPD': { monthly: 600, annual: 7000 },
      'AIA Multi-Pay CI': { monthly: 1800, annual: 20500 },
      'AIA Total Care': { monthly: 2200, annual: 25000 },
      'Accident Coverage': { monthly: 400, annual: 4500 }
    };

    const packagePricing = basePricing[packageName] || { monthly: 500, annual: 6000 };
    const currentAge = parseInt(formData.currentAge) || 25;

    return basePlans.map(plan => ({
      id: `${packageName}-${plan.coverage}`,
      name: `${plan.coverage} Coverage`,
      coverage: plan.coverage,
      monthlyPremium: Math.round(packagePricing.monthly * plan.multiplier * (currentAge > 40 ? 1.3 : 1.1) * (formData.gender === 'male' ? 1.1 : 1.0)),
      annualPremium: Math.round(packagePricing.annual * plan.multiplier * (currentAge > 40 ? 1.3 : 1.1) * (formData.gender === 'male' ? 1.1 : 1.0)),
      minAge: packageName.includes('Kids') ? 0 : (packageName.includes('Lady') ? 18 : 18),
      maxAge: packageName.includes('Kids') ? 17 : 75,
      genderRestriction: packageName.includes('Lady') ? 'female' as const : null
    })).filter(plan => {
      const ageValid = currentAge >= plan.minAge && currentAge <= plan.maxAge;
      const genderValid = !plan.genderRestriction || plan.genderRestriction === formData.gender;
      return ageValid && genderValid;
    });
  };

  const toggleCategory = (categoryId: string) => {
    const newExpanded = [...expandedCategories];
    const index = newExpanded.indexOf(categoryId);
    
    if (index > -1) {
      newExpanded.splice(index, 1);
    } else {
      newExpanded.push(categoryId);
    }
    
    setExpandedCategories(newExpanded);
  };

  const togglePackage = (packageName: string, categoryId: string) => {
    const packageId = `${categoryId}-${packageName}`;
    const existing = selectedPackages.find(p => p.id === packageId);
    
    if (existing) {
      setSelectedPackages(selectedPackages.filter(p => p.id !== packageId));
    } else {
      const newPackage: SelectedPackage = {
        id: packageId,
        name: packageName,
        category: categoryId,
        selectedPlans: []
      };
      setSelectedPackages([...selectedPackages, newPackage]);
    }
  };

  const togglePlan = (packageId: string, plan: SubPlan) => {
    setSelectedPackages(selectedPackages.map(pkg => {
      if (pkg.id === packageId) {
        const existingPlanIndex = pkg.selectedPlans.findIndex(p => p.planId === plan.id);
        
        if (existingPlanIndex > -1) {
          return {
            ...pkg,
            selectedPlans: pkg.selectedPlans.filter(p => p.planId !== plan.id)
          };
        } else {
          return {
            ...pkg,
            selectedPlans: [...pkg.selectedPlans, {
              planId: plan.id,
              planName: plan.name,
              coverage: plan.coverage,
              units: 1,
              monthlyPremium: plan.monthlyPremium,
              annualPremium: plan.annualPremium
            }]
          };
        }
      }
      return pkg;
    }));
  };

  const updatePlanUnits = (packageId: string, planId: string, newUnits: number) => {
    if (newUnits < 0) return;
    
    setSelectedPackages(selectedPackages.map(pkg => {
      if (pkg.id === packageId) {
        return {
          ...pkg,
          selectedPlans: pkg.selectedPlans.map(plan => 
            plan.planId === planId ? { ...plan, units: newUnits } : plan
          ).filter(plan => plan.units > 0)
        };
      }
      return pkg;
    }));
  };

  const getTotalMonthly = () => {
    return selectedPackages.reduce((total, pkg) => {
      return total + pkg.selectedPlans.reduce((pkgTotal, plan) => {
        return pkgTotal + (plan.monthlyPremium * plan.units);
      }, 0);
    }, 0);
  };

  const getTotalAnnual = () => {
    return selectedPackages.reduce((total, pkg) => {
      return total + pkg.selectedPlans.reduce((pkgTotal, plan) => {
        return pkgTotal + (plan.annualPremium * plan.units);
      }, 0);
    }, 0);
  };

  const handlePackageSelection = () => {
    if (!formData.gender || !formData.currentAge) {
      toast({
        title: "ข้อมูลไม่ครบ",
        description: "กรุณากรอกข้อมูลส่วนตัวก่อนเลือกแพ็กเกจ",
        variant: "destructive",
      });
      return;
    }
    setCurrentStep(1);
  };

  const selectPackage = (packageName: string) => {
    setStepData({ ...stepData, selectedPackage: packageName, selectedPlan: '' });
    setCurrentStep(2);
    toast({
      title: "เลือกแพ็กเกจสำเร็จ",
      description: `เลือก ${packageName} แล้ว`,
    });
  };

  const selectPlan = (planName: string) => {
    setStepData({ ...stepData, selectedPlan: planName });
    setCurrentStep(3);
    toast({
      title: "เลือกแผนสำเร็จ",
      description: `เลือก ${planName} แล้ว`,
    });
  };

  const handleSearch = () => {
    if (!stepData.selectedPackage || !stepData.selectedPlan) {
      toast({
        title: "ข้อมูลไม่ครบ",
        description: "กรุณาเลือกแพ็กเกจและแผนก่อนค้นหา",
        variant: "destructive",
      });
      return;
    }

    const mockPremium = {
      monthly: Math.floor(Math.random() * 5000) + 1000,
      quarterly: 0,
      semiAnnual: 0,
      annual: 0
    };
    mockPremium.quarterly = Math.round(mockPremium.monthly * 3 * 1.02);
    mockPremium.semiAnnual = Math.round(mockPremium.monthly * 6 * 1.01);
    mockPremium.annual = mockPremium.monthly * 12;

    setStepData({ ...stepData, searchResults: mockPremium });
    setCalculatedPremium(mockPremium);
    setCurrentStep(4);
    
    toast({
      title: "ค้นหาสำเร็จ",
      description: "พบเบี้ยประกันที่เหมาะสม",
    });
  };

  const handleSave = () => {
    setFormData({
      ...formData,
      packages: [stepData.selectedPackage],
      plans: [stepData.selectedPlan]
    });
    
    setStepData({ ...stepData, savedData: true });
    setShowResult(true);
    
    toast({
      title: "บันทึกสำเร็จ",
      description: "บันทึกข้อมูลประกันเรียบร้อย",
    });
  };

  const resetForm = () => {
    setFormData({
      gender: '',
      currentAge: '',
      coverageAge: '',
      paymentFrequency: 'annual',
      plans: [],
      packages: []
    });
    setCurrentStep(0);
    setStepData({
      selectedPackage: '',
      selectedPlan: '',
      searchResults: null,
      savedData: null
    });
    setShowResult(false);
    setCalculatedPremium(null);
    setSelectedPackages([]);
    setExpandedCategories([]);
    setShowAllPlans(false);
    
    toast({
      title: "รีเซ็ตฟอร์มเรียบร้อย",
      description: "สามารถกรอกข้อมูลใหม่ได้",
    });
  };

  const goBackStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const calculatePremium = () => {
    if (!formData.gender || !formData.currentAge || !formData.coverageAge || 
        formData.packages.length === 0 || formData.plans.length === 0) {
      toast({
        title: "ข้อมูลไม่ครบ",
        description: "กรุณากรอกข้อมูลให้ครบถ้วน",
        variant: "destructive",
      });
      return;
    }

    const mockPremium = {
      monthly: Math.floor(Math.random() * 5000) + 1000,
      quarterly: 0,
      semiAnnual: 0,
      annual: 0
    };
    mockPremium.quarterly = Math.round(mockPremium.monthly * 3 * 1.02);
    mockPremium.semiAnnual = Math.round(mockPremium.monthly * 6 * 1.01);
    mockPremium.annual = mockPremium.monthly * 12;

    setCalculatedPremium(mockPremium);
    setShowResult(true);
    
    toast({
      title: "คำนวณสำเร็จ",
      description: "พบเบี้ยประกันที่เหมาะสมแล้ว",
    });
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        const eligiblePackages = getEligiblePackages();
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-brand-green">เลือกแพ็กเกจประกัน</h4>
              <Button variant="outline" size="sm" onClick={goBackStep}>
                ย้อนกลับ
              </Button>
            </div>
            <div className="grid gap-3 max-h-60 overflow-y-auto">
              {eligiblePackages.map((pkg) => (
                <Button
                  key={pkg}
                  variant="outline"
                  className="h-auto p-4 text-left justify-start"
                  onClick={() => selectPackage(pkg)}
                >
                  <Package className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span className="text-sm">{pkg}</span>
                </Button>
              ))}
            </div>
          </div>
        );

      case 2:
        const availablePlans = plansByPackage[stepData.selectedPackage] || [];
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-brand-green">เลือกแผนความคุ้มครอง</h4>
              <Button variant="outline" size="sm" onClick={goBackStep}>
                ย้อนกลับ
              </Button>
            </div>
            <p className="text-sm text-gray-600">แพ็กเกจที่เลือก: {stepData.selectedPackage}</p>
            <div className="grid gap-3">
              {availablePlans.map((plan) => (
                <Button
                  key={plan}
                  variant="outline"
                  className="h-auto p-4 text-left justify-start"
                  onClick={() => selectPlan(plan)}
                >
                  <Shield className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span className="text-sm">{plan}</span>
                </Button>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-brand-green">ค้นหาเบี้ยประกัน</h4>
              <Button variant="outline" size="sm" onClick={goBackStep}>
                ย้อนกลับ
              </Button>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <p className="text-sm"><strong>แพ็กเกจ:</strong> {stepData.selectedPackage}</p>
              <p className="text-sm"><strong>แผน:</strong> {stepData.selectedPlan}</p>
              <p className="text-sm"><strong>อายุ:</strong> {formData.currentAge} ปี</p>
              <p className="text-sm"><strong>เพศ:</strong> {formData.gender === 'male' ? 'ชาย' : 'หญิง'}</p>
            </div>
            <Button 
              onClick={handleSearch}
              className="brand-green text-white w-full"
            >
              <Search className="w-4 h-4 mr-2" />
              ค้นหาเบี้ยประกัน
            </Button>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-brand-green">ผลลัพธ์การค้นหา</h4>
              <Button variant="outline" size="sm" onClick={goBackStep}>
                ย้อนกลับ
              </Button>
            </div>
            {stepData.searchResults && (
              <div className="bg-green-50 border border-green-200 p-4 rounded-lg space-y-2">
                <h5 className="font-semibold text-green-800">เบี้ยประกันที่คำนวณได้</h5>
                <p className="text-sm text-green-700">รายเดือน: ฿{stepData.searchResults.monthly.toLocaleString()}</p>
                <p className="text-sm text-green-700">รายปี: ฿{stepData.searchResults.annual.toLocaleString()}</p>
              </div>
            )}
            <Button 
              onClick={handleSave}
              className="brand-green text-white w-full"
              disabled={stepData.savedData}
            >
              {stepData.savedData ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  บันทึกแล้ว
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  บันทึกข้อมูล
                </>
              )}
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  const renderPackageContent = (packageName: string, categoryId: string) => {
    const isSelected = selectedPackages.some(p => p.id === `${categoryId}-${packageName}`);
    const selectedPkg = selectedPackages.find(p => p.id === `${categoryId}-${packageName}`);
    const validGender = (formData.gender === 'male' || formData.gender === 'female') ? formData.gender : 'male';
    const validAge = formData.currentAge && parseInt(formData.currentAge) > 0 ? parseInt(formData.currentAge) : 25;
    const eligibilityReason = getEligibilityReason(packageName, validAge, validGender);

    return (
      <div className="space-y-3">
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1">
              <Checkbox
                checked={isSelected}
                onCheckedChange={() => togglePackage(packageName, categoryId)}
                className="mt-1"
              />
              <div className="flex-1">
                <Label className="font-medium text-gray-800 cursor-pointer">
                  {packageName}
                </Label>
                {eligibilityReason && (
                  <div className="text-xs text-brand-gold bg-brand-gold/10 px-2 py-1 rounded mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {eligibilityReason}
                  </div>
                )}
              </div>
            </div>
          </div>

          {isSelected && (
            <div className="mt-4 space-y-3">
              <Label className="text-sm font-medium text-brand-green">
                เลือกแผนความคุ้มครอง:
              </Label>
              
              {getSubPlans(packageName).map((plan) => {
                const selectedPlan = selectedPkg?.selectedPlans.find(p => p.planId === plan.id);
                const isPlanSelected = !!selectedPlan;
                
                return (
                  <div key={plan.id} className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={isPlanSelected}
                          onCheckedChange={() => togglePlan(selectedPkg!.id, plan)}
                        />
                        <div>
                          <Label className="font-medium text-gray-800">
                            {plan.name} ({plan.coverage})
                          </Label>
                          <div className="text-xs text-gray-600">
                            เดือนละ ฿{plan.monthlyPremium.toLocaleString()} | ปีละ ฿{plan.annualPremium.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {isPlanSelected && selectedPlan && (
                      <div className="flex items-center gap-3 mt-3">
                        <Label className="text-sm text-gray-600">จำนวนหน่วย:</Label>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-8 h-8 p-0"
                            onClick={() => updatePlanUnits(selectedPkg!.id, plan.id, selectedPlan.units - 1)}
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <span className="w-12 text-center font-medium bg-white px-2 py-1 rounded border">
                            {selectedPlan.units}
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-8 h-8 p-0"
                            onClick={() => updatePlanUnits(selectedPkg!.id, plan.id, selectedPlan.units + 1)}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="text-sm text-brand-gold ml-4">
                          รวม: ฿{(selectedPlan.monthlyPremium * selectedPlan.units).toLocaleString()}/เดือน
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  };

  const filteredCategories = getFilteredCategories();

  return (
    <section id="calculator" className="py-8 bg-gray-50">
      <div className="container mx-auto px-3">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-brand-green mb-3">
            เครื่องคำนวณเบี้ยประกัน
          </h2>
          <p className="text-gray-600 text-sm md:text-base">
            คำนวณเบี้ยประกันที่เหมาะสมกับคุณ ง่ายๆ ในไม่กี่ขั้นตอน
          </p>
        </div>

        <div className="max-w-2xl mx-auto space-y-6">
          <Card className="shadow-lg border-0">
            <CardHeader className="brand-green text-white py-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calculator className="w-5 h-5" />
                กรอกข้อมูลเพื่อคำนวณเบี้ยประกัน
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-6">
              
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-brand-green border-b pb-2">
                  ข้อมูลส่วนตัว
                </h3>
                
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="gender" className="text-sm">เพศ *</Label>
                    <Select value={formData.gender} onValueChange={value => setFormData({...formData, gender: value})}>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="เลือกเพศ" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">ชาย</SelectItem>
                        <SelectItem value="female">หญิง</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="currentAge" className="text-sm">อายุปัจจุบัน (ปี) *</Label>
                      <Input
                        id="currentAge"
                        type="number"
                        min="1"
                        max="99"
                        value={formData.currentAge}
                        onChange={e => setFormData({...formData, currentAge: e.target.value})}
                        placeholder="กรอกอายุปัจจุบัน"
                        className="h-12"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="coverageAge" className="text-sm">ความคุ้มครองจนถึงอายุ (ปี) *</Label>
                      <Input
                        id="coverageAge"
                        type="number"
                        min={formData.currentAge || "1"}
                        max="99"
                        value={formData.coverageAge}
                        onChange={e => setFormData({...formData, coverageAge: e.target.value})}
                        placeholder="กรอกอายุสิ้นสุดความคุ้มครอง"
                        className="h-12"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="paymentFrequency" className="text-sm">ความถี่ในการจ่าย</Label>
                    <Select value={formData.paymentFrequency} onValueChange={value => setFormData({...formData, paymentFrequency: value})}>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="เลือกวิธีการจ่าย" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="annual">รายปี</SelectItem>
                        <SelectItem value="monthly">รายเดือน</SelectItem>
                        <SelectItem value="quarterly">รายไตรมาส</SelectItem>
                        <SelectItem value="semiannual">ราย 6 เดือน</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* 4-Step Process */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-brand-green border-b pb-2">
                  เลือกประกันภัย (4 ขั้นตอน)
                </h3>
                
                {/* Progress Indicator */}
                <div className="flex items-center justify-between mb-4">
                  {[1, 2, 3, 4].map((step) => (
                    <div key={step} className="flex items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                        currentStep >= step ? 'bg-brand-green text-white' : 'bg-gray-200 text-gray-600'
                      }`}>
                        {currentStep > step ? <CheckCircle className="w-5 h-5" /> : step}
                      </div>
                      {step < 4 && (
                        <div className={`w-12 h-1 ${
                          currentStep > step ? 'bg-brand-green' : 'bg-gray-200'
                        }`} />
                      )}
                    </div>
                  ))}
                </div>

                {/* Step Buttons */}
                {currentStep === 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Button 
                      onClick={handlePackageSelection}
                      variant="outline" 
                      className="h-16 flex-col gap-1 border-brand-green text-brand-green hover:bg-brand-green hover:text-white"
                    >
                      <Package className="w-5 h-5" />
                      <span className="text-xs">เลือกแพ็กเกจ</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-16 flex-col gap-1" 
                      disabled
                    >
                      <Shield className="w-5 h-5" />
                      <span className="text-xs">เลือกแผน</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-16 flex-col gap-1" 
                      disabled
                    >
                      <Search className="w-5 h-5" />
                      <span className="text-xs">ค้นหา</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-16 flex-col gap-1" 
                      disabled
                    >
                      <Save className="w-5 h-5" />
                      <span className="text-xs">บันทึก</span>
                    </Button>
                  </div>
                )}

                {/* Step Content */}
                {currentStep > 0 && (
                  <Card className="p-4">
                    {renderStepContent()}
                  </Card>
                )}
              </div>

              {/* Category Selection Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-brand-green border-b pb-2">
                  เลือกแพ็กเกจตามหมวดหมู่
                </h3>
                
                {formData.currentAge && formData.gender && (
                  <div className="flex items-center gap-2 text-sm text-brand-green mb-4">
                    <Filter className="w-4 h-4" />
                    <span>กรองสำหรับ: {formData.gender === 'male' ? 'ชาย' : 'หญิง'} อายุ {formData.currentAge} ปี</span>
                  </div>
                )}

                {/* No eligible packages message */}
                {Object.keys(filteredCategories).length === 0 && (
                  <div className="text-center py-8">
                    <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">ไม่มีแพ็กเกจที่เหมาะสมสำหรับข้อมูลที่กรอก</p>
                    <p className="text-sm text-gray-500 mt-1">กรุณาตรวจสอบอายุและเพศที่กรอก</p>
                  </div>
                )}

                {/* Category View */}
                {Object.values(filteredCategories).map((category) => (
                  <Collapsible 
                    key={category.id}
                    open={expandedCategories.includes(category.id)}
                    onOpenChange={() => toggleCategory(category.id)}
                  >
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-between h-12 text-left border-brand-green hover:bg-brand-green/5"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-4 h-4 rounded border-2 ${
                            selectedPackages.some(p => p.category === category.id && p.selectedPlans.length > 0)
                              ? 'bg-brand-green border-brand-green'
                              : 'border-gray-300'
                          }`}>
                            {selectedPackages.some(p => p.category === category.id && p.selectedPlans.length > 0) && (
                              <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                            )}
                          </div>
                          <span className="font-medium text-brand-green">{category.name}</span>
                          <span className="text-xs text-gray-500">({category.packages.length} แพ็กเกจ)</span>
                        </div>
                        <ChevronDown className={`w-5 h-5 transition-transform ${
                          expandedCategories.includes(category.id) ? 'rotate-180' : ''
                        }`} />
                      </Button>
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent className="space-y-3 mt-3 pl-4">
                      {category.packages.map((packageName) => (
                        <div key={packageName}>
                          {renderPackageContent(packageName, category.id)}
                        </div>
                      ))}
                    </CollapsibleContent>
                  </Collapsible>
                ))}

                {/* Selected Summary */}
                {selectedPackages.some(pkg => pkg.selectedPlans.length > 0) && (
                  <div className="mt-6 p-6 bg-gradient-to-r from-brand-green/10 to-brand-gold/10 rounded-lg border border-brand-green/20">
                    <h4 className="font-bold text-brand-green mb-4 text-lg">สรุปแพ็กเกจที่เลือก:</h4>
                    <div className="space-y-3">
                      {selectedPackages.filter(pkg => pkg.selectedPlans.length > 0).map((pkg) => (
                        <div key={pkg.id} className="space-y-2 bg-white p-4 rounded-lg shadow-sm">
                          <div className="font-bold text-brand-green">{pkg.name}</div>
                          {pkg.selectedPlans.map((plan) => (
                            <div key={plan.planId} className="flex justify-between items-center text-sm pl-4 py-2 bg-brand-green/5 rounded">
                              <span className="text-brand-green">{plan.planName} ({plan.coverage})</span>
                              <span className="text-brand-gold font-bold">
                                {plan.units} หน่วย - ฿{(plan.monthlyPremium * plan.units).toLocaleString()}/เดือน
                              </span>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-6 pt-4 border-t border-brand-green/20">
                      <div className="flex justify-between items-center font-bold text-lg">
                        <span className="text-brand-green">รวมทั้งหมด:</span>
                        <div className="text-right">
                          <div className="text-brand-green">฿{getTotalMonthly().toLocaleString()}/เดือน</div>
                          <div className="text-brand-gold text-sm">฿{getTotalAnnual().toLocaleString()}/ปี</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-4 border-t">
                <Button 
                  onClick={calculatePremium}
                  className="brand-green text-white w-full h-12"
                  size="lg"
                >
                  <Calculator className="w-5 h-5 mr-2" />
                  คำนวณเบี้ยประกัน
                </Button>
                
                <Button 
                  onClick={resetForm}
                  variant="outline"
                  className="border-brand-green text-brand-green hover:bg-brand-green hover:text-white w-full h-12"
                  size="lg"
                >
                  <RotateCcw className="w-5 h-5 mr-2" />
                  รีเซ็ตฟอร์ม
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          {showResult && calculatedPremium && (
            <QuoteResult 
              formData={formData}
              premium={calculatedPremium}
              selectedPackages={[{
                id: '1',
                name: stepData.selectedPackage || 'แพ็กเกจที่เลือก',
                coverage: 1000000,
                premium: calculatedPremium.monthly
              }]}
              selectedPlans={[]}
            />
          )}
        </div>
      </div>
    </section>
  );
};

export default InsuranceCalculator;
