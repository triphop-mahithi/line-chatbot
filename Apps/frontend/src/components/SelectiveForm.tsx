import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, Save, Package, RotateCcw, Minus, Plus, Eye, Filter, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { filterEligiblePackages, getEligibilityReason, isPackageEligible } from '@/utils/packageFilters';

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

interface SelectiveFormProps {
  onPackagesSelected?: (packages: SelectedPackage[]) => void;
  userAge?: number;
  userGender?: string;
}

const SelectiveForm: React.FC<SelectiveFormProps> = ({ onPackagesSelected, userAge = 25, userGender = 'male' }) => {
  const [selectedPackages, setSelectedPackages] = useState<SelectedPackage[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [expandedPackages, setExpandedPackages] = useState<string[]>([]);
  const [expandedSubPackages, setExpandedSubPackages] = useState<string[]>([]);
  const [showAllPlans, setShowAllPlans] = useState(false);
  
  // New state for age inputs
  const [currentAge, setCurrentAge] = useState<number>(userAge);
  const [coverageAge, setCoverageAge] = useState<number>(65);
  
  const { toast } = useToast();

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
        'AIA HB Extra',
        'ผลประโยชน์ Day Case ของสัญญาเพิ่มเติม HB และ AIA HB Extra'
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
        'multi pay-ci plus',
        'Lady Care & Lady Care Plus',
        'AIA TPD'
      ]
    },
    accident: {
      id: 'accident',
      name: 'Accident coverage',
      packages: [
        'Accident Coverage'
      ]
    }
  };

  const subPackages = {
    'multi pay-ci plus': [
      'AIA Multi-Pay CI',
      'AIA Total Care'
    ]
  };

  // Special packages that don't show coverage plans directly
  const specialPackages = ['multi pay-ci plus', 'Accident Coverage'];

  // Filter categories and packages based on user eligibility
  const getFilteredCategories = () => {
    const validGender = (userGender === 'male' || userGender === 'female') ? userGender : 'male';
    const validAge = userAge && userAge > 0 ? userAge : 25;

    const filteredCategories = { ...categories };
    
    Object.keys(filteredCategories).forEach(categoryKey => {
      const category = filteredCategories[categoryKey];
      category.packages = filterEligiblePackages(category.packages, validAge, validGender);
    });

    // Remove empty categories
    Object.keys(filteredCategories).forEach(categoryKey => {
      if (filteredCategories[categoryKey].packages.length === 0) {
        delete filteredCategories[categoryKey];
      }
    });

    return filteredCategories;
  };

  // Get filtered packages for "Show All Plans" view
  const getFilteredAllPackages = () => {
    const validGender = (userGender === 'male' || userGender === 'female') ? userGender : 'male';
    const validAge = userAge && userAge > 0 ? userAge : 25;
    
    const allPackages: string[] = [];
    Object.values(categories).forEach(category => {
      allPackages.push(...category.packages);
    });
    
    return filterEligiblePackages(allPackages, validAge, validGender);
  };

  // Update getSubPlans to use the current age state
  const getSubPlans = (packageName: string): SubPlan[] => {
    const basePlans = [
      { coverage: '1M', multiplier: 1 },
      { coverage: '5M', multiplier: 5 },
      { coverage: '10M', multiplier: 10 },
      { coverage: '15M', multiplier: 15 }
    ];

    // Base pricing varies by package type
    const basePricing = {
      'AIA Health Happy Kids': { monthly: 500, annual: 5500 },
      'AIA H&S (new standard)': { monthly: 800, annual: 9000 },
      'AIA H&S Extra (new standard)': { monthly: 1200, annual: 13500 },
      'AIA Health Saver': { monthly: 600, annual: 6800 },
      'AIA Health Happy': { monthly: 900, annual: 10200 },
      'AIA Infinite Care (new standard)': { monthly: 1500, annual: 17000 },
      'HB': { monthly: 700, annual: 8000 },
      'AIA HB Extra': { monthly: 1000, annual: 11500 },
      'ผลประโยชน์ Day Case ของสัญญาเพิ่มเติม HB และ AIA HB Extra': { monthly: 300, annual: 3500 },
      'AIA Health Cancer': { monthly: 1200, annual: 13800 },
      'AIA Care for Cancer': { monthly: 1000, annual: 11500 },
      'AIA CI Plus': { monthly: 1500, annual: 17500 },
      'AIA CI Top Up': { monthly: 800, annual: 9200 },
      'multi pay-ci plus': { monthly: 2000, annual: 23000 },
      'Lady Care & Lady Care Plus': { monthly: 1100, annual: 12800 },
      'AIA TPD': { monthly: 600, annual: 7000 },
      'AIA Multi-Pay CI': { monthly: 1800, annual: 20500 },
      'AIA Total Care': { monthly: 2200, annual: 25000 },
      'Accident Coverage': { monthly: 400, annual: 4500 }
    };

    const packagePricing = basePricing[packageName] || { monthly: 500, annual: 6000 };

    return basePlans.map(plan => ({
      id: `${packageName}-${plan.coverage}`,
      name: `${plan.coverage} Coverage`,
      coverage: plan.coverage,
      monthlyPremium: Math.round(packagePricing.monthly * plan.multiplier * (currentAge > 40 ? 1.3 : 1.1) * (userGender === 'male' ? 1.1 : 1.0)),
      annualPremium: Math.round(packagePricing.annual * plan.multiplier * (currentAge > 40 ? 1.3 : 1.1) * (userGender === 'male' ? 1.1 : 1.0)),
      minAge: packageName.includes('Kids') ? 0 : (packageName.includes('Lady') ? 18 : 18),
      maxAge: packageName.includes('Kids') ? 17 : 75,
      genderRestriction: packageName.includes('Lady') ? 'female' as const : null
    })).filter(plan => {
      // Filter by age and gender using current age state
      const ageValid = currentAge >= plan.minAge && currentAge <= plan.maxAge;
      const genderValid = !plan.genderRestriction || plan.genderRestriction === userGender;
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
      setExpandedPackages(expandedPackages.filter(id => id !== packageId));
    } else {
      const newPackage: SelectedPackage = {
        id: packageId,
        name: packageName,
        category: categoryId,
        subPackages: subPackages[packageName] ? [] : undefined,
        selectedPlans: []
      };
      setSelectedPackages([...selectedPackages, newPackage]);
      setExpandedPackages([...expandedPackages, packageId]);
    }
  };

  const toggleSubPackage = (subPackageName: string, parentPackageId: string) => {
    setSelectedPackages(selectedPackages.map(pkg => {
      if (pkg.id === parentPackageId) {
        const currentSubs = pkg.subPackages || [];
        const hasSubPackage = currentSubs.includes(subPackageName);
        
        return {
          ...pkg,
          subPackages: hasSubPackage 
            ? currentSubs.filter(sub => sub !== subPackageName)
            : [...currentSubs, subPackageName]
        };
      }
      return pkg;
    }));
  };

  const togglePlan = (packageId: string, plan: SubPlan) => {
    setSelectedPackages(selectedPackages.map(pkg => {
      if (pkg.id === packageId) {
        const existingPlanIndex = pkg.selectedPlans.findIndex(p => p.planId === plan.id);
        
        if (existingPlanIndex > -1) {
          // Remove plan
          return {
            ...pkg,
            selectedPlans: pkg.selectedPlans.filter(p => p.planId !== plan.id)
          };
        } else {
          // Add plan
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

  const resetSelection = () => {
    setSelectedPackages([]);
    setExpandedCategories([]);
    setExpandedPackages([]);
    setExpandedSubPackages([]);
    setShowAllPlans(false);
    
    if (onPackagesSelected) {
      onPackagesSelected([]);
    }
    
    toast({
      title: "รีเซ็ตสำเร็จ",
      description: "ล้างการเลือกแพ็กเกจทั้งหมดแล้ว",
    });
  };

  const handleSave = () => {
    const packagesWithPlans = selectedPackages.filter(pkg => pkg.selectedPlans.length > 0);
    
    if (packagesWithPlans.length === 0) {
      toast({
        title: "ไม่พบข้อมูล",
        description: "กรุณาเลือกแผนอย่างน้อย 1 รายการ",
        variant: "destructive",
      });
      return;
    }

    console.log('Selected Packages:', packagesWithPlans);
    
    if (onPackagesSelected) {
      onPackagesSelected(packagesWithPlans);
    }
    
    toast({
      title: "บันทึกสำเร็จ",
      description: `บันทึกแพ็กเกจแล้ว ${packagesWithPlans.length} รายการ`,
    });
  };

  const isPackageSelected = (packageName: string, categoryId: string) => {
    return selectedPackages.some(p => p.id === `${categoryId}-${packageName}`);
  };

  const getSelectedPackage = (packageName: string, categoryId: string) => {
    return selectedPackages.find(p => p.id === `${categoryId}-${packageName}`);
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

  const shouldShowPlans = (packageName: string) => {
    return !specialPackages.includes(packageName);
  };

  const renderPackageContent = (packageName: string, categoryId: string) => {
    const selectedPkg = getSelectedPackage(packageName, categoryId);
    const isSelected = isPackageSelected(packageName, categoryId);
    const validGender = (userGender === 'male' || userGender === 'female') ? userGender : 'male';
    const validAge = userAge && userAge > 0 ? userAge : 25;
    const eligibilityReason = getEligibilityReason(packageName, validAge, validGender);

    // Special handling for Accident Coverage - show plans directly
    if (packageName === 'Accident Coverage') {
      return (
        <div className="space-y-3">
          <div className="bg-white p-4 rounded-lg border shadow-sm">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-brand-green">
                  เลือกแผนความคุ้มครอง:
                </Label>
                {eligibilityReason && (
                  <div className="text-xs text-brand-gold bg-brand-gold/10 px-2 py-1 rounded flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {eligibilityReason}
                  </div>
                )}
              </div>
              
              {getSubPlans(packageName).map((plan) => {
                const packageId = `${categoryId}-${packageName}`;
                let selectedPackage = selectedPackages.find(p => p.id === packageId);
                
                // Auto-create package if plan is selected but package doesn't exist
                if (!selectedPackage) {
                  selectedPackage = {
                    id: packageId,
                    name: packageName,
                    category: categoryId,
                    selectedPlans: []
                  };
                }
                
                const selectedPlan = selectedPackage.selectedPlans.find(p => p.planId === plan.id);
                const isPlanSelected = !!selectedPlan;
                
                return (
                  <div key={plan.id} className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={isPlanSelected}
                          onCheckedChange={() => {
                            // Ensure package exists before toggling plan
                            if (!selectedPackages.find(p => p.id === packageId)) {
                              setSelectedPackages([...selectedPackages, selectedPackage]);
                            }
                            togglePlan(packageId, plan);
                          }}
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
                            onClick={() => updatePlanUnits(packageId, plan.id, selectedPlan.units - 1)}
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
                            onClick={() => updatePlanUnits(packageId, plan.id, selectedPlan.units + 1)}
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
          </div>
        </div>
      );
    }

    // Regular package handling for non-Accident Coverage packages
    return (
      <div className="space-y-3">
        {/* Main Package */}
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

          {/* Sub-plans for regular packages */}
          {isSelected && shouldShowPlans(packageName) && (
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
                    
                    {isPlanSelected && (
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

        {/* Sub Packages */}
        {subPackages[packageName] && isSelected && (
          <div className="ml-8 space-y-2">
            <Label className="text-sm font-medium text-brand-gold">
              ตัวเลือกเพิ่มเติม:
            </Label>
            {subPackages[packageName].map((subPackage) => {
              const parentPkg = getSelectedPackage(packageName, categoryId);
              const isSubSelected = parentPkg?.subPackages?.includes(subPackage) || false;
              
              return (
                <div key={subPackage} className="bg-brand-gold/10 p-3 rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <Checkbox
                      checked={isSubSelected}
                      onCheckedChange={() => {
                        if (parentPkg) {
                          toggleSubPackage(subPackage, parentPkg.id);
                        }
                      }}
                    />
                    <Label className="text-sm font-medium text-brand-green cursor-pointer">
                      {subPackage}
                    </Label>
                  </div>
                  
                  {/* Sub-plans for sub-packages */}
                  {isSubSelected && (
                    <div className="mt-3 space-y-2 ml-6">
                      {getSubPlans(subPackage).map((plan) => {
                        const subPackageId = `${parentPkg!.id}-${subPackage}`;
                        const selectedSubPlan = selectedPackages.find(p => p.id === subPackageId)?.selectedPlans.find(p => p.planId === plan.id);
                        const isSubPlanSelected = !!selectedSubPlan;
                        
                        return (
                          <div key={plan.id} className="bg-white p-2 rounded border">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Checkbox
                                  checked={isSubPlanSelected}
                                  onCheckedChange={() => togglePlan(subPackageId, plan)}
                                />
                                <div>
                                  <Label className="text-xs font-medium">{plan.name}</Label>
                                  <div className="text-xs text-gray-600">
                                    ฿{plan.monthlyPremium.toLocaleString()}/เดือน
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const filteredCategories = getFilteredCategories();
  const filteredAllPackages = getFilteredAllPackages();

  return (
    <div className="space-y-6">
      <div className="text-center mb-6 bg-gradient-to-r from-brand-green/5 to-brand-gold/5 p-6 rounded-lg">
        <h3 className="text-2xl font-bold text-brand-green mb-3">
          เลือกแพ็กเกจประกันภัย
        </h3>
        <p className="text-brand-gold font-medium">
          กรุณาเลือกแพ็กเกจด้านล่างอย่างน้อย 1 แพ็กเกจ
        </p>
        {userAge && userGender && (
          <div className="mt-3 flex items-center justify-center gap-2 text-sm text-brand-green">
            <Filter className="w-4 h-4" />
            <span>กรองสำหรับ: {userGender === 'male' ? 'ชาย' : 'หญิง'} อายุ {userAge} ปี</span>
          </div>
        )}
      </div>

      <Card className="shadow-lg border border-brand-green/20">
        <CardHeader className="bg-gradient-to-r from-brand-green to-brand-green/80 text-white py-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Package className="w-5 h-5" />
            เลือกหมวดหมู่สัญญา
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          
          {/* View Toggle Buttons */}
          <div className="flex gap-3 mb-6">
            <Button
              variant={!showAllPlans ? "default" : "outline"}
              size="sm"
              onClick={() => setShowAllPlans(false)}
              className={!showAllPlans ? "brand-green text-white" : "border-brand-green text-brand-green hover:bg-brand-green hover:text-white"}
            >
              ดูตามหมวดหมู่
            </Button>
            <Button
              variant={showAllPlans ? "default" : "outline"}
              size="sm"
              onClick={() => setShowAllPlans(true)}
              className={showAllPlans ? "brand-green text-white" : "border-brand-green text-brand-green hover:bg-brand-green hover:text-white"}
            >
              <Eye className="w-4 h-4 mr-1" />
              ดูแผนทั้งหมด
            </Button>
          </div>

          {/* No eligible packages message */}
          {Object.keys(filteredCategories).length === 0 && !showAllPlans && (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">ไม่มีแพ็กเกจที่เหมาะสมสำหรับข้อมูลที่กรอก</p>
              <p className="text-sm text-gray-500 mt-1">กรุณาตรวจสอบอายุและเพศที่กรอก</p>
            </div>
          )}

          {filteredAllPackages.length === 0 && showAllPlans && (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">ไม่มีแพ็กเกจที่เหมาะสมสำหรับข้อมูลที่กรอก</p>
              <p className="text-sm text-gray-500 mt-1">กรุณาตรวจสอบอายุและเพศที่กรอก</p>
            </div>
          )}

          {/* Category View */}
          {!showAllPlans && Object.values(filteredCategories).map((category) => (
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

          {/* All Plans View */}
          {showAllPlans && filteredAllPackages.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-semibold text-brand-green mb-3">
                แผนประกันที่เหมาะสม ({filteredAllPackages.length} แพ็กเกจ):
              </h4>
              {filteredAllPackages.map((packageName) => {
                const category = Object.values(categories).find(cat => cat.packages.includes(packageName));
                return (
                  <div key={packageName}>
                    {renderPackageContent(packageName, category?.id || 'all')}
                  </div>
                );
              })}
            </div>
          )}

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

          {/* Action Buttons */}
          <div className="pt-6 border-t border-brand-green/20 space-y-3">
            <Button 
              onClick={handleSave}
              className="brand-green text-white hover:opacity-90 w-full h-12 text-lg font-medium shadow-lg"
            >
              <Save className="w-5 h-5 mr-2" />
              บันทึกการเลือก
            </Button>
            
            <Button 
              onClick={resetSelection}
              variant="outline"
              className="border-brand-gold text-brand-gold hover:bg-brand-gold hover:text-white w-full h-12 text-lg font-medium shadow-lg"
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              รีเซ็ตการเลือก
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SelectiveForm;
