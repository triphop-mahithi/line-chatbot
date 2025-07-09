import { Button } from '@/components/ui/button';
import { CheckCircle, Save } from 'lucide-react';

interface Step3Props {
  searchResults: { monthly: number; annual: number } | null;
  saved: boolean;
  onSave: () => void;
  goBack: () => void;
}
const Step3 = ({ searchResults, saved, onSave, goBack }: Step3Props) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-brand-green">สรุปผลการค้นหา</h4>
        <Button variant="outline" size="sm" onClick={goBack}>
          ย้อนกลับ
        </Button>
      </div>
      {searchResults && (
        <div className="bg-green-50 border border-green-200 p-4 rounded-lg space-y-2">
          <h5 className="font-semibold text-green-800">เบี้ยประกันที่คำนวณได้</h5>
          <p className="text-sm text-green-700">รายเดือน: ฿{searchResults.monthly.toLocaleString()}</p>
          <p className="text-sm text-green-700">รายปี: ฿{searchResults.annual.toLocaleString()}</p>
        </div>
      )}
      <Button 
        onClick={onSave}
        className="brand-green text-white w-full"
        disabled={saved}
      >
        {saved ? (
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
};

export default Step3;