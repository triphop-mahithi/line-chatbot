import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Save, Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';

interface PackagePrice {
  packageName: string;
  baseMonthly: number;
  baseAnnual: number;
}

const Admin = () => {
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  
  // Redirect if not admin
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  const [selectedPackage, setSelectedPackage] = useState('');
  const [monthlyPrice, setMonthlyPrice] = useState('');
  const [annualPrice, setAnnualPrice] = useState('');
  
  const [packagePrices, setPackagePrices] = useState<PackagePrice[]>([
    { packageName: 'AIA Health Happy Kids', baseMonthly: 500, baseAnnual: 5500 },
    { packageName: 'AIA H&S (new standard)', baseMonthly: 800, baseAnnual: 9000 },
    { packageName: 'AIA H&S Extra (new standard)', baseMonthly: 1200, baseAnnual: 13500 },
    { packageName: 'AIA Health Saver', baseMonthly: 600, baseAnnual: 6800 },
    { packageName: 'AIA Health Happy', baseMonthly: 900, baseAnnual: 10200 },
    { packageName: 'AIA Infinite Care (new standard)', baseMonthly: 1500, baseAnnual: 17000 },
    { packageName: 'HB', baseMonthly: 700, baseAnnual: 8000 },
    { packageName: 'AIA HB Extra', baseMonthly: 1000, baseAnnual: 11500 },
    { packageName: 'AIA Health Cancer', baseMonthly: 1200, baseAnnual: 13800 },
    { packageName: 'AIA Care for Cancer', baseMonthly: 1000, baseAnnual: 11500 },
    { packageName: 'AIA CI Plus', baseMonthly: 1500, baseAnnual: 17500 },
    { packageName: 'AIA CI Top Up', baseMonthly: 800, baseAnnual: 9200 },
    { packageName: 'multi pay-ci plus', baseMonthly: 2000, baseAnnual: 23000 },
    { packageName: 'Lady Care & Lady Care Plus', baseMonthly: 1100, baseAnnual: 12800 },
    { packageName: 'AIA TPD', baseMonthly: 600, baseAnnual: 7000 },
    { packageName: 'Accident Coverage', baseMonthly: 400, baseAnnual: 4500 }
  ]);

  const allPackages = [
    'AIA Health Happy Kids',
    'AIA H&S (new standard)',
    'AIA H&S Extra (new standard)',
    'AIA Health Saver',
    'AIA Health Happy',
    'AIA Infinite Care (new standard)',
    'HB',
    'AIA HB Extra',
    'ผลประโยชน์ Day Case ของสัญญาเพิ่มเติม HB และ AIA HB Extra',
    'AIA Health Cancer',
    'AIA Care for Cancer',
    'AIA CI Plus',
    'AIA CI Top Up',
    'multi pay-ci plus',
    'Lady Care & Lady Care Plus',
    'AIA TPD',
    'AIA Multi-Pay CI',
    'AIA Total Care',
    'Accident Coverage'
  ];

  const handleSavePrice = () => {
    if (!selectedPackage || !monthlyPrice || !annualPrice) {
      toast({
        title: "ข้อมูลไม่ครบถ้วน",
        description: "กรุณากรอกข้อมูลให้ครบถ้วน",
        variant: "destructive",
      });
      return;
    }

    const existingIndex = packagePrices.findIndex(p => p.packageName === selectedPackage);
    
    if (existingIndex > -1) {
      // Update existing
      const newPrices = [...packagePrices];
      newPrices[existingIndex] = {
        packageName: selectedPackage,
        baseMonthly: parseInt(monthlyPrice),
        baseAnnual: parseInt(annualPrice)
      };
      setPackagePrices(newPrices);
    } else {
      // Add new
      setPackagePrices([...packagePrices, {
        packageName: selectedPackage,
        baseMonthly: parseInt(monthlyPrice),
        baseAnnual: parseInt(annualPrice)
      }]);
    }

    toast({
      title: "บันทึกสำเร็จ",
      description: `อัพเดทราคาสำหรับ ${selectedPackage} แล้ว`,
    });

    setSelectedPackage('');
    setMonthlyPrice('');
    setAnnualPrice('');
  };

  const handlePackageSelect = (packageName: string) => {
    setSelectedPackage(packageName);
    const existing = packagePrices.find(p => p.packageName === packageName);
    if (existing) {
      setMonthlyPrice(existing.baseMonthly.toString());
      setAnnualPrice(existing.baseAnnual.toString());
    } else {
      setMonthlyPrice('');
      setAnnualPrice('');
    }
  };

  const handleDeletePrice = (packageName: string) => {
    setPackagePrices(packagePrices.filter(p => p.packageName !== packageName));
    toast({
      title: "ลบสำเร็จ",
      description: `ลบราคาสำหรับ ${packageName} แล้ว`,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-brand-green/5">
      <Header />
      <div className="py-8">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-brand-green mb-2">
              ระบบจัดการแพ็กเกจประกัน
            </h1>
            <p className="text-gray-600">
              จัดการราคา แพ็กเกจ และแผนประกันภัย
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <Tabs defaultValue="pricing" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="pricing">จัดการราคา</TabsTrigger>
                <TabsTrigger value="packages">จัดการแพ็กเกจ</TabsTrigger>
                <TabsTrigger value="settings">ตั้งค่า</TabsTrigger>
              </TabsList>

              <TabsContent value="pricing" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="w-5 h-5" />
                      แก้ไขราคาแพ็กเกจ
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>เลือกแพ็กเกจ</Label>
                        <Select value={selectedPackage} onValueChange={handlePackageSelect}>
                          <SelectTrigger>
                            <SelectValue placeholder="เลือกแพ็กเกจ" />
                          </SelectTrigger>
                          <SelectContent>
                            {allPackages.map((pkg) => (
                              <SelectItem key={pkg} value={pkg}>{pkg}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="monthlyPrice">ราคาต่อเดือน (฿)</Label>
                        <Input
                          id="monthlyPrice"
                          type="number"
                          value={monthlyPrice}
                          onChange={(e) => setMonthlyPrice(e.target.value)}
                          placeholder="0"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="annualPrice">ราคาต่อปี (฿)</Label>
                        <Input
                          id="annualPrice"
                          type="number"
                          value={annualPrice}
                          onChange={(e) => setAnnualPrice(e.target.value)}
                          placeholder="0"
                        />
                      </div>
                    </div>

                    <Button onClick={handleSavePrice} className="brand-green">
                      <Save className="w-4 h-4 mr-2" />
                      บันทึกราคา
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>รายการราคาปัจจุบัน</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {packagePrices.map((price) => (
                        <div key={price.packageName} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <h4 className="font-medium">{price.packageName}</h4>
                            <p className="text-sm text-gray-600">
                              เดือนละ ฿{price.baseMonthly.toLocaleString()} | ปีละ ฿{price.baseAnnual.toLocaleString()}
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeletePrice(price.packageName)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="packages">
                <Card>
                  <CardHeader>
                    <CardTitle>จัดการแพ็กเกจ</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">
                      ฟีเจอร์การจัดการแพ็กเกจจะพัฒนาในเวอร์ชันต่อไป
                    </p>
                    <Button disabled>
                      <Plus className="w-4 h-4 mr-2" />
                      เพิ่มแพ็กเกจใหม่
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="settings">
                <Card>
                  <CardHeader>
                    <CardTitle>ตั้งค่าระบบ</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">
                      ฟีเจอร์การตั้งค่าจะพัฒนาในเวอร์ชันต่อไป
                    </p>
                    <div className="space-y-4">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-medium mb-2">สูตรคำนวณปัจจุบัน</h4>
                        <p className="text-sm text-gray-600">
                          ราคาเบี้ย = ราคาฐาน × ตัวคูณตามอายุ × ตัวคูณตามเพศ × จำนวนหน่วย
                        </p>
                        <ul className="text-xs text-gray-500 mt-2 space-y-1">
                          <li>• อายุ &gt; 40: ตัวคูณ 1.3, อื่นๆ: ตัวคูณ 1.1</li>
                          <li>• เพศชาย: ตัวคูณ 1.1, เพศหญิง: ตัวคูณ 1.0</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
