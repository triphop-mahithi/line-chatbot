import { Button } from '@/components/ui/button';
import { Package } from 'lucide-react';

interface Step1Props {
  eligiblePackages: string[];
  selectPackage: (pkg: string) => void;
  goBack: () => void;
}

const Step1 = ({ eligiblePackages, selectPackage, goBack }: Step1Props) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-brand-green">เลือกแพ็กเกจประกัน</h4>
        <Button variant="outline" size="sm" onClick={goBack}>
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
};

export default Step1;