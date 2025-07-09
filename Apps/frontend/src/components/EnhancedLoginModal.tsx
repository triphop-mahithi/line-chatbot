import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LogIn, Eye, EyeOff} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import liff from '@line/liff';
import { useNavigate } from 'react-router-dom';
interface EnhancedLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const EnhancedLoginModal: React.FC<EnhancedLoginModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { toast } = useToast();

  // Line-authentication
  useEffect(() => {
    liff.init({ liffId: '2007722996-O0Na9bz1' }).catch(console.error);
  }, []);
  
  const LoginWithLine = async () => {
    try {
      if (!liff.isLoggedIn()) {
        liff.login(); // จะ redirect ไป login page แล้วกลับมา
        return;
      }
      const profile = await liff.getProfile();
      console.log(profile);
    } catch (err) {
      console.error("LINE Login error", err);
      alert('เกิดข้อผิดพลาดในการล็อกอินผ่าน LINE');
    }
  };
  
  
  const handleSubmit = async (e?: React.FormEvent, loginType: 'manual' | 'line' = 'manual') => {
    if (e) e.preventDefault();
    setIsLoading(true);
    
    try {
      if (loginType === 'manual') {
        // ✅ Login แบบใส่ชื่อผู้ใช้ / รหัสผ่าน
        const success = await login(username, password);
        
        if (success) {
          toast({
            title: "เข้าสู่ระบบสำเร็จ",
            description: `ยินดีต้อนรับ ${username}`,
          });
          onClose();
          setUsername('');
          setPassword('');
          navigate('pages/');
          return;
        } else {
          toast({
            title: "เข้าสู่ระบบไม่สำเร็จ",
            description: "กรุณาตรวจสอบชื่อผู้ใช้และรหัสผ่าน",
            variant: "destructive",
          });
        }
      }
      
      if (loginType === 'line') {
        // ✅ Login ผ่าน LINE
        if (!liff.isLoggedIn()) {
          liff.login(); // redirect ไปหน้า LINE แล้วกลับมา
          return;
        }
        
        const profile = await liff.getProfile();
        console.log("LINE Profile:", profile);
        
        const allowedAdminIds = ["U50b99adf4d6fbc6f439402ed1a916dc1"]; // <-- Line user IDs ที่อนุญาต
        
      if (allowedAdminIds.includes(profile.userId)) {
        toast({
          title: "เข้าสู่ระบบสำเร็จด้วย LINE",
          description: `ยินดีต้อนรับ ${profile.displayName}`,
        });
        onClose();
        return;
      } else {
        toast({
          title: "บัญชีไม่ได้รับสิทธิ์",
          description: "บัญชี LINE นี้ไม่ใช่ผู้ดูแลระบบ",
          variant: "destructive",
        });
        liff.logout();
      }
    }
  } catch (error) {
    console.error("Login Error:", error);
    toast({
      title: "เกิดข้อผิดพลาด",
      description: "ไม่สามารถเข้าสู่ระบบได้",
      variant: "destructive",
    });
  } finally {
    setIsLoading(false);
  }
};

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-brand-green">
            <LogIn className="w-5 h-5" />
            เข้าสู่ระบบ
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">ชื่อผู้ใช้</Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="กรอกชื่อผู้ใช้"
              required
              className="border-brand-green/30 focus:border-brand-green"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">รหัสผ่าน</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="กรอกรหัสผ่าน"
                required
                className="border-brand-green/30 focus:border-brand-green pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-auto p-1"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4 text-gray-500" />
                ) : (
                  <Eye className="w-4 h-4 text-gray-500" />
                )}
              </Button>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 border-brand-green/30 text-brand-green hover:bg-brand-green/10"
            >
              ยกเลิก
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 brand-green text-white hover:opacity-90"
            >
              {isLoading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
            </Button>
          </div>
        </form>

        <div className="text-center text-xs text-gray-500 mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="font-medium mb-1">ข้อมูลทดสอบ:</p>
          <p>Admin: aabbcc / 11233</p>
          <p>User: ชื่อใดก็ได้ / รหัสใดก็ได้</p>
          
          <Button onClick={LoginWithLine} variant="outline" className="w-full mt-2">
            <LogIn className="mr-2 h-4 w-4" /> เข้าสู่ระบบด้วย LINE
          </Button>

        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EnhancedLoginModal;
