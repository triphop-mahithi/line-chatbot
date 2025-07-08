
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Calendar, Share2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateQuotePDF } from '@/utils/pdfGenerator';

interface QuoteResultProps {
  formData: {
    gender: string;
    currentAge: string;
    coverageAge: string;
    paymentFrequency: string;
    plans: string[];
    packages: string[];
  };
  premium: {
    monthly: number;
    quarterly: number;
    semiAnnual: number;
    annual: number;
  };
  selectedPackages: Array<{
    id: string;
    name: string;
    coverage: number;
    premium: number;
  }>;
  selectedPlans: Array<{
    id: string;
    name: string;
    description: string;
    basePremium: number;
  }>;
}

const QuoteResult: React.FC<QuoteResultProps> = ({ 
  formData, 
  premium, 
  selectedPackages, 
  selectedPlans 
}) => {
  const { toast } = useToast();

  const genderText = formData.gender === 'male' ? 'ชาย' : 'หญิง';

  const generatePDF = async () => {
    toast({
      title: "กำลังสร้าง PDF",
      description: "กรุณารอสักครู่...",
    });
    
    try {
      await generateQuotePDF('quote-content', 'insurance-quote');
      
      toast({
        title: "ดาวน์โหลดสำเร็จ",
        description: "ใบเสนอราคาถูกบันทึกแล้ว",
      });
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถสร้าง PDF ได้",
        variant: "destructive",
      });
    }
  };

  const shareQuote = () => {
    if (navigator.share) {
      navigator.share({
        title: 'ใบเสนอราคาประกันภัย',
        text: `เบี้ยประกันรวม ${premium.annual.toLocaleString()} บาทต่อปี`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "คัดลอกลิงก์แล้ว",
        description: "สามารถแชร์ลิงก์นี้ได้",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* PDF Content Container */}
      <div id="quote-content" className="bg-white">
        <Card className="shadow-lg border border-brand-green/20">
          <CardHeader className="bg-gradient-to-r from-brand-green to-brand-green/80 text-white py-6">
            <CardTitle className="flex items-center gap-3 text-xl">
              <Calendar className="w-6 h-6" />
              ใบเสนอราคาเบี้ยประกัน
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            
            {/* Company Logo Area */}
            <div className="text-center pb-6 border-b border-brand-green/20">
              <div className="flex items-center justify-center space-x-4 mb-4">
                <div className="w-16 h-16 brand-green rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-2xl">A</span>
                </div>
                <div className="text-left">
                  <h3 className="text-2xl font-bold text-brand-green">ANAN IP CO., LTD.</h3>
                  <p className="text-brand-gold font-medium">Insurance Calculator Co., Ltd.</p>
                </div>
              </div>
              <div className="bg-brand-green/5 p-3 rounded-lg">
                <p className="text-sm text-brand-green font-medium">
                  วันที่ออกใบเสนอราคา: {new Date().toLocaleDateString('th-TH', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>

            {/* Customer Information */}
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-brand-green/5 to-brand-gold/5 p-4 rounded-lg">
                <h4 className="font-bold text-brand-green mb-4 text-lg border-b border-brand-green/20 pb-2">
                  ข้อมูลผู้เอาประกัน
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white p-3 rounded-lg shadow-sm">
                    <span className="text-brand-gold text-sm font-medium">เพศ:</span>
                    <div className="text-brand-green font-bold text-lg">{genderText}</div>
                  </div>
                  <div className="bg-white p-3 rounded-lg shadow-sm">
                    <span className="text-brand-gold text-sm font-medium">อายุปัจจุบัน:</span>
                    <div className="text-brand-green font-bold text-lg">{formData.currentAge} ปี</div>
                  </div>
                  <div className="bg-white p-3 rounded-lg shadow-sm">
                    <span className="text-brand-gold text-sm font-medium">ความคุ้มครองจนถึงอายุ:</span>
                    <div className="text-brand-green font-bold text-lg">{formData.coverageAge} ปี</div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-brand-green/5 to-brand-gold/5 p-4 rounded-lg">
                <h4 className="font-bold text-brand-green mb-4 text-lg border-b border-brand-green/20 pb-2">
                  แผนประกันที่เลือก
                </h4>
                <div className="space-y-3">
                  {selectedPlans.map((plan) => (
                    <div key={plan.id} className="bg-white p-4 rounded-lg shadow-sm border border-brand-green/10">
                      <div className="font-bold text-brand-green text-lg">{plan.name}</div>
                      <div className="text-gray-600 mt-1">{plan.description}</div>
                      <div className="text-brand-gold font-bold mt-2 text-lg">
                        ฿{plan.basePremium.toLocaleString()} บาท/ปี
                      </div>
                    </div>
                  ))}
                  
                  {selectedPackages.length > 0 && (
                    <div className="mt-4">
                      <div className="font-medium text-brand-green mb-3">แพ็กเกจเสริม:</div>
                      <div className="space-y-2">
                        {selectedPackages.map((pkg) => (
                          <div key={pkg.id} className="bg-brand-gold/10 p-3 rounded-lg border border-brand-gold/20">
                            <div className="font-bold text-brand-green">{pkg.name}</div>
                            <div className="text-sm text-gray-600">
                              ความคุ้มครอง: ฿{pkg.coverage.toLocaleString()} บาท
                            </div>
                            <div className="text-brand-gold font-bold text-sm">
                              +฿{pkg.premium.toLocaleString()} บาท/ปี
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Premium Breakdown */}
            <div className="bg-gradient-to-br from-brand-green/10 to-brand-gold/10 p-6 rounded-lg border border-brand-green/20">
              <h4 className="font-bold text-brand-green mb-6 text-center text-xl">
                เบี้ยประกันรวม
              </h4>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center p-4 bg-white rounded-lg shadow-md border border-brand-green/10">
                  <div className="text-2xl font-bold text-brand-green">
                    ฿{premium.annual.toLocaleString()}
                  </div>
                  <div className="text-brand-gold font-medium">ต่อปี</div>
                </div>
                
                <div className="text-center p-4 bg-white rounded-lg shadow-md border border-brand-green/10">
                  <div className="text-2xl font-bold text-brand-green">
                    ฿{premium.semiAnnual.toLocaleString()}
                  </div>
                  <div className="text-brand-gold font-medium">ต่อครึ่งปี</div>
                </div>
                
                <div className="text-center p-4 bg-white rounded-lg shadow-md border border-brand-green/10">
                  <div className="text-2xl font-bold text-brand-green">
                    ฿{premium.quarterly.toLocaleString()}
                  </div>
                  <div className="text-brand-gold font-medium">ต่อไตรมาส</div>
                </div>
                
                <div className="text-center p-4 bg-white rounded-lg shadow-md border border-brand-green/10">
                  <div className="text-2xl font-bold text-brand-green">
                    ฿{premium.monthly.toLocaleString()}
                  </div>
                  <div className="text-brand-gold font-medium">ต่อเดือน</div>
                </div>
              </div>

              <div className="text-center p-4 bg-gradient-to-r from-brand-gold to-brand-gold/80 rounded-lg text-white">
                <div className="text-xl font-bold">
                  เบี้ยประกันต่อวัน: ฿{Math.round(premium.annual / 365).toLocaleString()}
                </div>
                <div className="text-sm opacity-90 mt-1">
                  (คำนวณจากเบี้ยประกันรายปี ÷ 365 วัน)
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="pt-4 border-t border-brand-green/20 text-center text-sm text-gray-600 space-y-2 bg-gray-50 p-4 rounded-lg">
              <p className="font-medium text-brand-green">
                ใบเสนอราคานี้มีผลใช้บังคับเป็นเวลา 30 วัน นับจากวันที่ออกใบเสนอราคา
              </p>
              <p>
                สอบถามข้อมูลเพิ่มเติม โทร. 02-xxx-xxxx หรือ info@insurance.co.th
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button 
          onClick={generatePDF}
          className="flex-1 brand-green text-white hover:opacity-90 h-12 text-lg font-medium shadow-lg"
          size="lg"
        >
          <Download className="w-5 h-5 mr-2" />
          ดาวน์โหลด PDF
        </Button>
        
        <Button 
          onClick={shareQuote}
          variant="outline"
          className="flex-1 border-brand-gold text-brand-gold hover:bg-brand-gold hover:text-white h-12 text-lg font-medium shadow-lg"
          size="lg"
        >
          <Share2 className="w-5 h-5 mr-2" />
          แชร์ใบเสนอราคา
        </Button>
      </div>
    </div>
  );
};

export default QuoteResult;
