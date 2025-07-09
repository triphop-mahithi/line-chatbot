import { Button } from '@/components/ui/button';
import { Shield } from 'lucide-react';

interface Step2Props {
    availablePlans : {label: string}[];
    selectedPackage: string;
    selectPlan: (label: string) => void;
    goBack: () => void;
}
const Step2 = ({ availablePlans, selectedPackage, selectPlan, goBack }: Step2Props) => {
    
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-brand-green">เลือกแผนความคุ้มครอง</h4>
        <Button variant="outline" size="sm" onClick={goBack}>
          ย้อนกลับ
        </Button>
      </div>

      <p className="text-sm text-gray-600">แพ็กเกจที่เลือก: {selectedPackage}</p>

      <div className="grid gap-3">
        {availablePlans.map((plan, index) => (
          <Button
            key={index}
            variant="outline"
            className="h-auto p-4 text-left justify-start"
            onClick={() => selectPlan(plan.label)}
          >
            <Shield className="w-4 h-4 mr-2 flex-shrink-0" />
            <span className="text-sm">{plan.label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default Step2;