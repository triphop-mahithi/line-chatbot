import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { config} from '@/config';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Save, Plus, Trash2 , Edit, Package} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import axios from 'axios';
import { ConfirmDeleteDialog } from "@/components/ConfirmDeleteDialog";
import { UploadWithConflictDialog } from "@/components/UploadWithConflictDialog";
import ConfirmDeleteAll from "@/components/ConfirmDeleteAll";


interface Pricing {
  ageFrom: number;
  ageTo: number;
  female: number | string;
  male: number | string;
}

interface NewPackage {
  id: string;
  name: string;
  categoryId: string;
  baseMonthly: number;
  baseAnnual: number;
  special: boolean;
  genderRestriction: string;
  minAge: number | string;
  maxAge: number | string;
  pricing: Pricing[];
}

const Admin = () => {
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const [packageList, setPackageList] = useState<NewPackage[]>([]); // State to store all packages
  const [promotionListState, setPromotionListState] = useState([]); // ข้อมูลโปรโมชั่น

  /**
 * 
 *    Page Function
 */
  function safeSlice<T>(arr: T[] | null | undefined, start: number, end: number): T[] {
    if (!Array.isArray(arr)) return [];
  return arr.slice(start, end);
}

  // ฟังก์ชันเกี่ยวกับ ขึ้นหน้าใหม่
  const ItemsPerPage = 5; // จำนวนรายการที่จะแสดงในแต่ละหน้า
  // current state
  const [packagePage, setPackagePage] = useState(1);
  const [promotionPage, setPromotionPage] = useState(1);

  // ฟังก์ชันคำนวณข้อมูลที่จะแสดงในแต่ละหน้า
  const startIndex = (packagePage - 1) * ItemsPerPage;
  const currentPackages = safeSlice(packageList, startIndex, startIndex + ItemsPerPage);
  const currentPromotions = safeSlice(promotionListState, (promotionPage - 1) * ItemsPerPage, promotionPage * ItemsPerPage);
  
  // ฟังก์ชันไปหน้าถัดไป
  const nextPage = () => {
    if (packagePage < Math.ceil(packageList.length / ItemsPerPage)) {
      setPackagePage(packagePage + 1);
      setPromotionPage(promotionPage + 1);
    }
  };

  // ฟังก์ชันไปหน้าก่อนหน้า
  const prevPage = () => {
    if (packagePage > 1) {
      setPackagePage(packagePage - 1);
      setPromotionPage(promotionPage - 1);
    }
  };  
  
  
  const [query, setQuery] = useState('');
  const [packages, setPackages] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState<NewPackage | null>(null);
  const [noResults, setNoResults] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showMoreInfo, setShowMoreInfo] = useState(false); // สำหรับการแสดงข้อมูลเพิ่มเติม
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

    /**
   *  Promotion
   * 
   */
function getDaysUntilExpiration(validTo: string): number {
  const today = new Date();
  const endDate = new Date(validTo);

  // เคลียร์เวลาให้เป็น 00:00:00 ทั้งสองฝั่งเพื่อให้แม่นยำเฉพาะวัน
  today.setHours(0, 0, 0, 0);
  endDate.setHours(0, 0, 0, 0);

  const diffTime = endDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}


  // Upload file
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true); // สถานะการโหลดข้อมูล
  const [error, setError] = useState(null); // ข้อผิดพลาด
  const [conflicts, setConflicts] = useState([]); // เก็บความต่าง
  const [showConflictPopup, setShowConflictPopup] = useState(false);

  const [promotionType, setPromotionType] = useState('general');  // default type
  const [promotionName, setPromotionName] = useState('');
  const [promotionDescription, setPromotionDescription] = useState('');
  const [discountPercentage, setDiscountPercentage] = useState('');
  const [validFrom, setValidFrom] = useState('');
  const [validTo, setValidTo] = useState('');
  const [packageId, setPackageId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [editPromotionId, setEditPromotionId] = useState<string | null>(null);
  const [editPromotion, setEditPromotion] = useState({
  name: "",
  description: "",
  type: "",
  discountPercentage: 0,
  validFrom: "",
  validTo: "",
});
  // edit price
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editPrice, setEditPrice] = useState({
  ageFrom: "",
  ageTo: "",
  male: "",
  female: "",
  packageName: "",
  categoryId: ""
});

  /** 
   *  
   * Search 
   * 
   */

  // ฟังก์ชันค้นหาแพ็กเกจ
  const handleSearch = async (e) => {
    const searchQuery = e.target.value;
    setQuery(searchQuery);

    if (searchQuery.length >= 1) {
      try {
        const fullURL = `${config.apiBase}/search?query=${searchQuery}`
        // ส่งคำค้นหาไปที่ backend
        /** fullURL 
         * ex : http://localhost:8080/api/search?query=${searchQuery}
         */
        const response = await axios.get(fullURL);
        if (response.data.length === 0) {
          setNoResults(true);
        } else {
          setPackages(response.data);
          setNoResults(false);
        }
      } catch (error) {
        console.error("Error fetching packages", error);
      }
    } else {
      setPackages([]);
    }
  };
  const handlePackageSelect = (pkg) => {
    setSelectedPackage(pkg); // pkg should be the full package object
    setIsDropdownOpen(false); // ปิด dropdown เมื่อเลือกแล้ว
  };

  // คำนวณอายุที่น้อยที่สุดและมากที่สุดจาก pricing
  const getMinAge = (pricing) => {
    if (!pricing || pricing.length === 0) return null;
    return Math.min(...pricing.map(p => p.ageFrom));
  };

  const getMaxAge = (pricing) => {
    if (!pricing || pricing.length === 0) return null;
    return Math.max(...pricing.map(p => p.ageTo));
  };

/**
 * 
 *  Package
 * 
 */


  // Fetch package list from database when the component is mounted
  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const response = await axios.get(config.Packages);
        setPackageList(response.data); // Store the received data in state
        console.log('Package - ', response.data)
        // updated ui
      } catch (error) {
        toast({
          title: 'Error fetching packages',
          description: error.message,
          variant: 'destructive',
        });
      }
    };

    fetchPackages();
  }, [toast]); // Add 'toast' to the dependency array to fix the missing dependency warning


  //(Promotion) ดึงข้อมูลโปรโมชั่นจาก API เมื่อ component ถูก mount
useEffect(() => {
  let isMounted = true;

  const fetchPromotions = async () => {
    try {
      const response = await axios.get(config.Promotions);
      if (isMounted) setPromotionListState(response.data);
    } catch (error) {
      if (isMounted) setError("ไม่สามารถดึงข้อมูลโปรโมชั่นได้");
    } finally {
      if (isMounted) setLoading(false);
    }
  };

  fetchPromotions();

  return () => {
    isMounted = false;
  };
}, []);
  const [newPackage, setNewPackage] = useState<NewPackage>({
    id: '',
    name: '',
    categoryId: '',
    baseMonthly: 0,
    baseAnnual: 0,
    special: false,
    genderRestriction: '',
    minAge: '',
    maxAge: '',
    pricing: [],
  });

  const [pricingInputs, setPricingInputs] = useState<{ ageFrom: number, ageTo: number, female: number, male: number }[]>([]);

// ฟังก์ชันเพิ่มช่องกรอกข้อมูลราคาใหม่
const addPricingInput = () => {
  if (newPackage.minAge && newPackage.maxAge) {
    // เพิ่มข้อมูลราคาโดยใช้ minAge และ maxAge ที่กรอก
    setPricingInputs([
      ...pricingInputs,
      {
        ageFrom: parseInt(newPackage.minAge as string), // ใช้ minAge ที่กรอก
        ageTo: parseInt(newPackage.maxAge as string), // ใช้ maxAge ที่กรอก
        female: 0,
        male: 0,
      }
    ]);

    // รีเซ็ตอายุขั้นต่ำและสูงสุดหลังจากเพิ่มราคา
    setNewPackage({ ...newPackage, minAge: '', maxAge: '' }); // รีเซ็ตค่า minAge และ maxAge
  } else {
    toast({
      title: 'ข้อมูลไม่ครบถ้วน',
      description: 'กรุณากรอกอายุขั้นต่ำและสูงสุดให้ครบถ้วน',
      variant: 'destructive',
    });
  }
};

  // ฟังก์ชันลบราคา
  const removePricingInput = (index: number) => {
    const updatedPricingInputs = [...pricingInputs];
    updatedPricingInputs.splice(index, 1);
    setPricingInputs(updatedPricingInputs);
  };

const handleSavePackage = () => {
  if (!newPackage.name || !newPackage.categoryId || pricingInputs.length === 0) {
    toast({
      title: 'ข้อมูลไม่ครบถ้วน',
      description: 'กรุณากรอกข้อมูลให้ครบถ้วน',
      variant: 'destructive',
    });
    return;
  }

  // ตรวจสอบว่า minAge และ maxAge ไม่มีค่า หรือเป็น ''
  let minAge = newPackage.minAge;
  let maxAge = newPackage.maxAge;

  if (minAge === '' || maxAge === '') {
    // คำนวณค่า minAge และ maxAge จาก pricingInputs
    if (pricingInputs.length > 0) {
      minAge = Math.min(...pricingInputs.map(p => p.ageFrom)); // หาค่าน้อยที่สุดจาก ageFrom
      maxAge = Math.max(...pricingInputs.map(p => p.ageTo)); // หาค่ามากที่สุดจาก ageTo
    } else {
      toast({
        title: 'กรุณากรอกข้อมูลราคาให้ครบถ้วน',
        description: 'กรุณากรอกข้อมูลอายุขั้นต่ำและสูงสุดก่อนที่จะบันทึกแพ็คเกจ',
        variant: 'destructive',
      });
      return;
    }
  }

  // รวมข้อมูลที่กรอกลงใน pricing
  const newPricingData = pricingInputs.map(input => ({
    ageFrom: input.ageFrom,
    ageTo: input.ageTo,
    female: input.female,
    male: input.male,
  }));

  const packageToSave = { 
    ...newPackage, 
    minAge: parseInt(minAge as string), // แปลงเป็นตัวเลข
    maxAge: parseInt(maxAge as string), // แปลงเป็นตัวเลข
    pricing: newPricingData 
  };
    // ส่งข้อมูลใหม่ไปที่ backend (สมมุติว่าเป็น POST request)
    /**
     * axios.post('http://localhost:8080/api/packages', packageToSave)
     */
    axios.post(config.Packages, packageToSave)
    .then((response) => {
    // เมื่อการส่งข้อมูลสำเร็จ
    toast({
      title: 'บันทึกสำเร็จ',
      description: `เพิ่มแพ็คเกจ ${newPackage.name} แล้ว`,
    });
    // เพิ่มแพ็คเกจที่เพิ่มใหม่ลงใน packageList โดยตรง
    setPackageList([...packageList, packageToSave]); // อัปเดต packageList ทันที

    // รีเซ็ตข้อมูลหลังจากบันทึก
    setNewPackage({
      id: '',
      name: '',
      categoryId: '',
      baseMonthly: 0,
      baseAnnual: 0,
      special: false,
      genderRestriction: '',
      minAge: '',
      maxAge: '',
      pricing: [],
    });
    setPricingInputs([]);
  })
  .catch((error) => {
    // จัดการข้อผิดพลาด
    toast({
      title: 'เกิดข้อผิดพลาด',
      description: error.response?.data?.message || 'ไม่สามารถเพิ่มแพ็คเกจได้',
      variant: 'destructive',
    });
  });
}

 // ฟังก์ชันจัดการการเปลี่ยนแปลงราคา
const handlePricingChange = (index: number, field: string, value: string) => {
    const updatedPricingInputs = [...pricingInputs];
    // แปลงค่าเป็นตัวเลขเมื่อกรอกข้อมูล
    updatedPricingInputs[index] = { ...updatedPricingInputs[index], [field]: value === '' ? '' : parseFloat(value) };
    setPricingInputs(updatedPricingInputs);
  };

  // Redirect if not admin
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  const handleDeletePackage = async (packageId : string ,packageName: string) => {
    console.log('PackageID - ',packageId)
    try {
      await axios.delete(`${config.Packages}/${packageId}`);

      // อัปเดต state ทันที (ลบแพ็คเกจออกจาก state)
      setPackages((prev) => prev.filter((pkg) => pkg.id !== packageId));

    } catch (error) {
      toast({
      title: "เกิดข้อผิดพลาด",
      description: "ไม่สามารถลบแพ็คเกจได้",
      variant: "destructive",
    });
    }
    toast({
      title: "ลบสำเร็จ",
      description: `ลบราคาสำหรับ ${packageName} แล้ว`,
    });

  };

  const handleEditPackage = (packageId : string,packageName : string) => {
    console.log("packageId - ", packageId)
      toast({
      title: "แก้ไข",
      description: `แก้ไขข้อมูลของ ${packageName} แล้ว`,
    });
};

const handleDeletePromotion = async (promotionId: string, promotionName : string) => {
  console.log("promotionId -",promotionId)

  try {
    // ส่งคำขอ DELETE ไปยัง backend
    // const response = await axios.delete(`http://localhost:8080/api/promotions/${promotionId}`);
    const response = await axios.delete(`${config.Promotions}/${promotionId}`);
    console.log("Response from delete:", response);    
    toast({
      title: "ลบโปรโมชั่นสำเร็จ",
      description: `โปรโมชั่น ${promotionName} ถูกลบแล้ว`,
    });
  } catch (error) {
    console.error("Error deleting promotion", error);
    toast({
      title: "เกิดข้อผิดพลาด",
      description: "ไม่สามารถลบโปรโมชั่นได้",
      variant: "destructive",
    });
  }
};

interface Promotion {
  _id: string;
  name: string;
  description: string;
  type: string;
  discountPercentage: number;
  validFrom?: string;
  validTo?: string;
}

const handleEditPromotion = (promotion: Promotion) => {
  console.log("Editing:", promotion);
  setEditPromotionId(promotion._id);
  setEditPromotion({
    name: promotion.name || "",
    description: promotion.description || "",
    type: promotion.type || "",
    discountPercentage: promotion.discountPercentage || 0,
    validFrom: promotion.validFrom
      ? new Date(promotion.validFrom).toISOString().slice(0, 10)
      : "",
    validTo: promotion.validTo
      ? new Date(promotion.validTo).toISOString().slice(0, 10)
      : "",
  });
};

const handleSavePromotion = () => {
  // ส่ง editPromotion และ editPromotionId ไป backend
  console.log("Saving Promotion ID:", editPromotionId, editPromotion);

  // TODO: API call หรืออัปเดต state

  // รีเซต
  setEditPromotionId(null);
};

const handleAddPromotion = async () => {
  // ตรวจสอบข้อมูลที่กรอก
  if (!promotionName || !promotionDescription) {
    toast({
      title: 'ข้อมูลไม่ครบถ้วน',
      description: 'กรุณากรอกชื่อโปรโมชั่นและรายละเอียด',
      variant: 'destructive',
    });
    return;
  }

  // ตรวจสอบสำหรับ "โปรโมชั่นเฉพาะแพ็คเกจ"
  if (promotionType === 'package' && !packageId) {
    toast({
      title: 'ข้อมูลไม่ครบถ้วน',
      description: 'กรุณากรอกชื่อแพ็คเกจที่โปรโมชั่นใช้ได้',
      variant: 'destructive',
    });
    return;
  }

  // ตรวจสอบสำหรับ "โปรโมชั่นเฉพาะ categoryId"
  if (promotionType === 'category' && !categoryId) {
    toast({
      title: 'ข้อมูลไม่ครบถ้วน',
      description: 'กรุณากรอก categoryId ที่โปรโมชั่นใช้ได้',
      variant: 'destructive',
    });
    return;
  }

  // สร้างข้อมูลโปรโมชั่น
  const promotionData = {
    name: promotionName,
    description: promotionDescription,
    type: promotionType,
    discountPercentage: parseFloat(discountPercentage),
    validFrom,
    validTo,
    packageId: promotionType === 'package' ? packageId : null,
    categoryId: promotionType === 'category' ? categoryId : null,
  };

  try {
    // ส่งข้อมูลโปรโมชั่นไปยัง backend
    //const response = await axios.post('http://localhost:8080/api/promotions', promotionData);
    const response = await axios.post(config.Promotions, promotionData);
    // รับข้อมูลโปรโมชั่นที่ถูกสร้างพร้อม _id
    const createdPromotion = response.data.promotion;

    // อัปเดตรายการโปรโมชั่นใน state
    setPromotionListState((prev) => [...prev, createdPromotion]);
    
    toast({
      title: 'โปรโมชั่นถูกเพิ่มแล้ว',
      description: `เพิ่มโปรโมชั่น ${promotionName} สำเร็จ`,
    });

    // รีเซ็ตฟอร์มหลังจากเพิ่ม
    setPromotionName('');
    setPromotionDescription('');
    setPackageId('');
    setCategoryId('');
  } catch (error) {
    toast({
      title: 'เกิดข้อผิดพลาด',
      description: error.response?.data?.message || 'ไม่สามารถเพิ่มโปรโมชั่นได้',
      variant: 'destructive',
    });
  }
}

const handleSelect = (pkg) => {
  setSelectedPackage(pkg);   // เก็บข้อมูลแพ็กเกจที่เลือก
  setQuery(pkg.name);        // ใส่ชื่อแพ็กเกจลงในช่องค้นหา
  setIsDropdownOpen(false);  // ปิด dropdown
};


// show-info option 
//const handleEditPricing = (index: number) => {
//  const p = selectedPackage.pricing[index];
//  setEditIndex(index);
//  setEditPrice({
//    ageFrom: p.ageFrom.toString(),
//    ageTo: p.ageTo.toString(),
//    male: p.male.toString(),
//    female: p.female.toString(),
//  });
//};

const handleEditPricing = (index: number) => {
  const p = selectedPackage.pricing[index];
  setEditIndex(index);
  setEditPrice({
    ageFrom: p.ageFrom.toString(),
    ageTo: p.ageTo.toString(),
    male: p.male.toString(),
    female: p.female.toString(),
    packageName: selectedPackage.name || "",     // ✅ เปลี่ยนจาก packageName เป็น name
    categoryId: selectedPackage.categoryId || ""        // ✅ เพิ่ม
  });
};


// check minAge and maxAge
const checkAndUpdateMinMax = async (pricing: Pricing[]) => {
  const newMinAge = Math.min(...pricing.map(p => Number(p.ageFrom)));
  const newMaxAge = Math.max(...pricing.map(p => Number(p.ageTo)));

  const currentMinAge = Number(selectedPackage.minAge);
  const currentMaxAge = Number(selectedPackage.maxAge);

  if (newMinAge !== currentMinAge || newMaxAge !== currentMaxAge) {
    const MinMaxAgeURL = `${config.Packages}/${selectedPackage.id}/minmax`
    await fetch(MinMaxAgeURL, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ minAge: newMinAge, maxAge: newMaxAge }),
    });

    // อัปเดตใน frontend ด้วยถ้าจำเป็น
    setSelectedPackage(prev => ({
      ...prev,
      minAge: newMinAge,
      maxAge: newMaxAge,
    }));
  }
};

const updatePricingInDB = async (
  updatedPricing: Pricing & { name: string; categoryId: string },
  index: number
) => {
  try {
    const updated = [...selectedPackage.pricing];
    updated[index] = updatedPricing;

    const pricingURL = `${config.Packages}/${selectedPackage.id}/pricing/${index}`;

    const payload = {
      pricing: updatedPricing,
      name: updatedPricing.name,           
      categoryId: updatedPricing.categoryId
    };

    const response = await fetch(pricingURL, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) throw new Error("Update failed");

    await checkAndUpdateMinMax(updated);

    toast({ title: "สำเร็จ", description: "อัปเดตราคาเรียบร้อยแล้ว" });
  } catch (error) {
    console.error("Update error:", error);
    toast({ title: "ผิดพลาด", description: "ไม่สามารถอัปเดตได้" });
  }
};

const handleSavePricing = async (index: number) => {
  const newData = {
    ageFrom: parseInt(editPrice.ageFrom),
    ageTo: parseInt(editPrice.ageTo),
    male: parseFloat(editPrice.male),
    female: parseFloat(editPrice.female),
  };

  //  1. อัปเดต pricing ใน UI
  const updatedPricing = [...selectedPackage.pricing];
  updatedPricing[index] = newData;

  //  2. อัปเดตทั้ง pricing, name, categoryId
  const updatedPackage = {
    ...selectedPackage,
    pricing: updatedPricing,
    name: editPrice.packageName,
    categoryId: editPrice.categoryId,
  };

  setSelectedPackage(updatedPackage);

  //  3. อัปเดต backend
  await updatePricingInDB(
    {
      ...newData,
      name: editPrice.packageName,
      categoryId: editPrice.categoryId,
    },
    index
  );

  //  4. ตรวจสอบ min/max
  await checkAndUpdateMinMax(updatedPricing);

  setEditIndex(null);
};

const handleDeleteAllPackages = async () => {
  try {
    const response = await fetch(`${config.Packages}`, {
      method: "DELETE",
    });

    if (!response.ok) throw new Error("ลบไม่สำเร็จ");

    // เคลียร์ state หรือโหลดใหม่
    setSelectedPackage(null);
    toast({ title: "สำเร็จ", description: "ลบข้อมูลทั้งหมดแล้ว" });
  } catch (err) {
    console.error(err);
    toast({ title: "ผิดพลาด", description: "ไม่สามารถลบข้อมูลทั้งหมดได้", variant: "destructive" });
  }
};

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const uploadURL = `${config.apiBase}/upload`
      const response = await axios.post(uploadURL, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // ถ้ามี field `conflicts` กลับมา
      if (response.data.conflicts?.length > 0) {
        setConflicts(response.data.conflicts);
        setShowConflictPopup(true); // แสดง popup
      } else {
        toast({ title: "อัปโหลดสำเร็จ", description: "บันทึกข้อมูลเรียบร้อย", duration: 3000 });
      }
    } catch (error) {
      toast({ title: "เกิดข้อผิดพลาด", description: "ไม่สามารถอัปโหลดได้", variant: "destructive" });
    }
  };

  

  if (loading) {
    return <p>กำลังโหลดข้อมูล...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-brand-green/5">
      <Header />
      <div className="py-8">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-brand-green mb-2">
              ระบบจัดการแพ็คเกจประกัน
            </h1>
            <p className="text-gray-600">
              จัดการราคา แพ็คเกจ และแผนประกันภัย
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <Tabs defaultValue="pricing" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="pricing">จัดการราคา</TabsTrigger>
                <TabsTrigger value="packages">จัดการแพ็คเกจ</TabsTrigger>
                <TabsTrigger value="settings">โปรโมชั่น</TabsTrigger>
              </TabsList>

              <TabsContent value="pricing" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="w-5 h-5" />
                      แก้ไขราคาแพ็คเกจ
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
        <div className="space-y-4">
  <div className="relative w-full max-w-lg">
  <input
    type="text"
    value={query}
    onChange={handleSearch}
    placeholder="ค้นหาแพ็กเกจ..."
    onFocus={() => setIsDropdownOpen(true)}
    className="w-full px-4 py-2 border border-gray-300 rounded-2xl focus:outline-none focus:border-brand-green hover:border-transparent transition duration-200"
  />

  {isDropdownOpen && (
  <div className="absolute top-full mt-1 w-full bg-white border border-gray-200 rounded-2xl shadow-lg z-10">
    {packages.length > 0 ? (
      packages.map((pkg, index) => (
        <div
          key={index}
          className="px-4 py-2 hover:bg-gray-100 cursor-pointer rounded-2xl"
          onClick={() => handleSelect(pkg)}
        >
          {pkg.name}
        </div>
      ))
    ) : query.length > 0 ? (
      <div className="px-4 py-2 text-gray-400">ไม่พบผลลัพธ์</div>
    ) : null}
  </div>
)}

</div>
<div>
  {selectedPackage && typeof selectedPackage === 'object' && (
  <div className="mt-6 p-6 bg-white rounded-xl shadow-md space-y-4">
    <h3 className="text-2xl font-bold text-brand-green">ข้อมูลแพ็กเกจ</h3>
    <p className="text-gray-800">
      <span className="font-medium">ชื่อแพ็กเกจ:</span> {selectedPackage.name}
    </p>

    <div className="text-gray-700">
      {selectedPackage.pricing && selectedPackage.pricing.length > 0 ? (
        <>
          <p>
            <span className="font-medium">อายุที่น้อยที่สุด:</span> {getMinAge(selectedPackage.pricing)} ปี
          </p>
          <p>
            <span className="font-medium">อายุที่มากที่สุด:</span> {getMaxAge(selectedPackage.pricing)} ปี
          </p>
        </>
      ) : (
        <p className="text-sm text-gray-500">ไม่มีข้อมูลช่วงอายุ</p>
      )}
    </div>

    <Button
      variant="outline"
      size="sm"
      onClick={() => setShowMoreInfo(!showMoreInfo)}
      className="mt-2"
    >
      {showMoreInfo ? "ซ่อนข้อมูลเพิ่มเติม" : "แสดงข้อมูลเพิ่มเติม"}
    </Button>

    {showMoreInfo && (
      <div className="mt-4 space-y-2 text-gray-800">
        <p><span className="font-medium">หมวดหมู่:</span> {selectedPackage.categoryId}</p>
        <p><span className="font-medium">ข้อจำกัดเพศ:</span> {selectedPackage.genderRestriction}</p>

        <p className="font-semibold mt-4">ช่วงอายุและราคา:</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {selectedPackage.pricing.map((price, index) => (
            <div
              key={index}
              className="bg-gray-50 border rounded-lg p-3 flex flex-col justify-between"
            >
              <p className="font-semibold text-brand-green">{price.ageFrom} - {price.ageTo} ปี</p>
              <div className="mt-1 text-sm">
                <p><strong>ราคาหญิง:</strong> ฿{price.female.toLocaleString()}</p>
                <p><strong>ราคาชาย:</strong> ฿{price.male.toLocaleString()}</p>
              </div>

               <div className="flex justify-end mt-2">
                  <span
                  onClick={() => handleEditPricing(index)}
                  className="text-sm text-blue-600 hover:text-white hover:bg-blue-600 px-3 py-1 rounded cursor-pointer transition"
                  >
                    แก้ไข
                  </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    )}
    {editIndex !== null && (
  <div className="mt-4 p-4 border rounded bg-gray-100 space-y-2">
    <h4 className="text-lg font-semibold text-brand-green">แก้ไขช่วงอายุและราคา</h4>
    <div className="grid grid-cols-2 gap-4">
      {/* ✅ ช่องแก้ไขชื่อแพ็กเกจ */}
      <Input
        type="text"
        value={editPrice.packageName}
        onChange={(e) => setEditPrice({ ...editPrice, packageName: e.target.value })}
        placeholder="ชื่อแพ็กเกจ"
      />

      {/* ✅ ช่องแก้ไขหมวดหมู่ */}
      <Input
        type="text"
        value={editPrice.categoryId}
        onChange={(e) => setEditPrice({ ...editPrice, categoryId: e.target.value })}
        placeholder="หมวดหมู่"
      />
      <Input
        type="number"
        value={editPrice.ageFrom}
        onChange={(e) => setEditPrice({ ...editPrice, ageFrom: e.target.value })}
        placeholder="อายุจาก"
      />
      <Input
        type="number"
        value={editPrice.ageTo}
        onChange={(e) => setEditPrice({ ...editPrice, ageTo: e.target.value })}
        placeholder="อายุถึง"
      />
      <Input
        type="number"
        value={editPrice.female}
        onChange={(e) => setEditPrice({ ...editPrice, female: e.target.value })}
        placeholder="ราคาหญิง"
      />
      <Input
        type="number"
        value={editPrice.male}
        onChange={(e) => setEditPrice({ ...editPrice, male: e.target.value })}
        placeholder="ราคาชาย"
      />
    </div>

    <div className="flex justify-end space-x-2 mt-4">
      <Button variant="ghost" onClick={() => setEditIndex(null)}>ยกเลิก</Button>
      <Button onClick={() => handleSavePricing(editIndex)}>บันทึก</Button>
    </div>
  </div>
)}


<div className="flex justify-end mt-6">
  <ConfirmDeleteDialog
    packageName={selectedPackage.name}
    onConfirm={() => handleDeletePackage(selectedPackage.id, selectedPackage.name)}
    triggerLabel="ลบแพ็คเกจ"
  />
</div>
  </div>
)}

</div>

      </div>
</CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>รายการราคาปัจจุบัน</CardTitle>
<div className="relative space-y-2">
  <span
    onClick={() => setShowConfirmDelete(true)}
    className="absolute top-0 right-0 text-sm text-red-500 hover:underline cursor-pointer"
  >
    ลบทั้งหมด
  </span>

  {/* ฟอร์มอื่น ๆ */}

  {showConfirmDelete && (
    <ConfirmDeleteAll onCancel={() => setShowConfirmDelete(false)} />
  )}
</div>

                  </CardHeader>
<CardContent>
      <div className="space-y-2">
        {currentPackages.length === 0 ? (
      <div className="text-center text-gray-500 py-6">
        ไม่พบแพ็คเกจในระบบ
      </div>) : (
        
        currentPackages.map((pkg) => (
          <div key={pkg.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium">{pkg.name}</h4> {/* ใช้ pkg.name สำหรับแสดงชื่อแพ็คเกจ */}
              <p className="text-sm text-gray-600">
                ช่วงอายุ: {pkg.minAge ? pkg.minAge : 'ไม่ระบุ'} - {pkg.maxAge ? pkg.maxAge : 'ไม่ระบุ'}
              </p>
            </div>

<div className="flex space-x-4">
  {/* ปุ่มลบพร้อมยืนยัน */}
  <ConfirmDeleteDialog
    packageName={pkg.name}
    onConfirm={() => handleDeletePackage(pkg.id, pkg.name)}
    triggerLabel={
      <span className="text-sm text-red-600 hover:text-white hover:bg-red-600 px-2 py-1 rounded cursor-pointer transition flex items-center space-x-1">
        <Trash2 className="w-4 h-4" />
        <span>ลบ</span>
      </span>
    }
  />

  {/* ปุ่มแก้ไขแบบข้อความ */}
    {/**
  <span
    onClick={() => handleEditPackage(pkg.id, pkg.name)}
    className="text-sm text-blue-600 hover:text-white hover:bg-blue-600 px-2 py-1 rounded cursor-pointer transition flex items-center space-x-1"
  >
    <Edit className="w-4 h-4" />
    <span>แก้ไข</span>
  </span>
   */}
</div>
          </div>
          )
        )
      )}
      </div>

      {/* แสดงปุ่มเปลี่ยนหน้า */}
      <div className="flex justify-between mt-4">
        <Button onClick={prevPage} disabled={packagePage === 1}>
          ก่อนหน้า
        </Button>
        <Button
        onClick={nextPage}
        disabled={packagePage >= Math.ceil((packageList || []).length / ItemsPerPage)}
        >
        ถัดไป
        </Button>
      </div>
    </CardContent>
                </Card>
              </TabsContent>

              {/** จัดการแพ็คเกจ */}
          <TabsContent value="packages">
      <Card>
        <CardHeader>
          <CardTitle>จัดการแพ็คเกจ</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="packageName">ชื่อแพ็คเกจ</Label>
              <Input
                id="packageName"
                value={newPackage.name}
                onChange={(e) => setNewPackage({ ...newPackage, name: e.target.value })}
                placeholder="กรอกชื่อแพ็คเกจ"
              />
            </div>
            <div className="space-y-2">
  {/* แถวหมวดหมู่ + ปุ่ม */}
  <div className="flex justify-between items-center">
    <Label htmlFor="categoryId">หมวดหมู่</Label>

    <div className="flex gap-2">
      <button
        type="button"
        onClick={() => setNewPackage({ ...newPackage, categoryId: "สัญญาเพิ่มเติม" })}
        className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm"
      >
        สัญญาเพิ่มเติม
      </button>
      <button
        type="button"
        onClick={() => setNewPackage({ ...newPackage, categoryId: "โรคร้ายแรง" })}
        className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm"
      >
        โรคร้ายแรง
      </button>
      <button
        type="button"
        onClick={() => setNewPackage({ ...newPackage, categoryId: "อุบัติเหตุ" })}
        className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm"
      >
        อุบัติเหตุ
      </button>
    </div>
  </div>

  {/* ช่องกรอกหมวดหมู่ */}
  <Input
    id="categoryId"
    value={newPackage.categoryId}
    onChange={(e) => setNewPackage({ ...newPackage, categoryId: e.target.value })}
    placeholder="กรอกหมวดหมู่"
  />
</div>

            <div className="space-y-2">
              <Label htmlFor="minAge">อายุขั้นต่ำ</Label>
              <Input
                id="minAge"
                type="number"
                value={newPackage.minAge}
                onChange={(e) => setNewPackage({ ...newPackage, minAge: parseInt(e.target.value) })}
                placeholder="กรอกอายุขั้นต่ำ"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxAge">อายุสูงสุด</Label>
              <Input
                id="maxAge"
                type="number"
                value={newPackage.maxAge}
                onChange={(e) => setNewPackage({ ...newPackage, maxAge: parseInt(e.target.value) })}
                placeholder="กรอกอายุสูงสุด"
              />
            </div>
<div className="flex justify-end mt-4">
  <div className="space-y-2">
    <div className="flex items-center gap-4">
<>
  <div className="p-6">
      <h1 className="text-xl font-bold mb-4">อัปโหลดไฟล์ข้อมูลแพ็คเกจ</h1>
      <UploadWithConflictDialog />
    </div>

</>
    </div>

    {selectedFile && (
      <div className="text-sm text-gray-600 text-right">
        ไฟล์ที่เลือก: <span className="font-medium">{selectedFile.name}</span>
      </div>
    )}
  </div>
</div>

            {/* ฟอร์มกรอกข้อมูลราคา */}
            <div className="space-y-2">
              <Button onClick={addPricingInput} className="brand-green" disabled={!(newPackage.minAge && newPackage.maxAge)}>
                เพิ่มราคา
              </Button>
            </div>

            {/* แสดงราคาที่เพิ่ม */}
            <div>
              {pricingInputs.map((input, index) => (
                <div key={index} className="space-y-2 mb-4 p-4 border border-gray-300 rounded">
                  <div>
                    <Label>อายุ {input.ageFrom} ถึง {input.ageTo}</Label>
                    <div className="flex gap-4">
                      <Input
                        type="number"
                        value={input.female === 0 ? '' : input.female} // ใช้ค่าว่างถ้าไม่มีข้อมูล
                        onChange={(e) => handlePricingChange(index, 'female', e.target.value)}
                        placeholder="กรอกราคาเพศหญิง"
                      />
                      <Input
                        type="number"
                        value={input.male === 0 ? '' : input.male} // ใช้ค่าว่างถ้าไม่มีข้อมูล
                        onChange={(e) => handlePricingChange(index, 'male', e.target.value)}
                        placeholder="กรอกราคาเพศชาย"
                      />
                    </div>
                  </div>

                  {/* ปุ่มลบราคา */}
                  <Button onClick={() => removePricingInput(index)} className="text-red-600 hover:text-red-700">
                    <Trash2 className="w-4 h-4" />
                    ลบราคา
                  </Button>
                </div>
              ))}
            </div>

            {/* ปุ่มบันทึกแพ็คเกจ */}
            <Button onClick={handleSavePackage} className="brand-green">
              <Plus className="w-4 h-4 mr-2" />
              เพิ่มแพ็คเกจใหม่
            </Button>
            </div>
        </CardContent>
      </Card>
    </TabsContent>

              <TabsContent value="settings">
                <Card>
                  <CardHeader>
                    <CardTitle>ตั้งค่าระบบ</CardTitle>
                  </CardHeader>
                  <CardContent>
<div className="max-w-xl mx-auto space-y-4 bg-white p-6 rounded-2xl shadow-md border border-gray-200">
  <h2 className="text-xl font-semibold text-gray-700">เพิ่มโปรโมชั่นใหม่</h2>

  {/* ฟอร์มกรอกชื่อโปรโมชั่นและรายละเอียด */}
  <div className="space-y-2">
    <label className="block text-sm font-medium text-gray-600">ชื่อโปรโมชั่น</label>
    <input
      type="text"
      placeholder="กรอกชื่อโปรโมชั่น"
      value={promotionName}
      onChange={(e) => setPromotionName(e.target.value)}
      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green"
    />
  </div>

  <div className="space-y-2">
    <label className="block text-sm font-medium text-gray-600">รายละเอียดโปรโมชั่น</label>
    <textarea
      placeholder="กรอกรายละเอียด"
      value={promotionDescription}
      onChange={(e) => setPromotionDescription(e.target.value)}
      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green"
    />
  </div>

  <div className="space-y-2">
    <label className="block text-sm font-medium text-gray-600">เปอร์เซ็นต์ส่วนลด (%)</label>
    <input
      type="number"
      placeholder="เช่น 10"
      value={discountPercentage}
      onChange={(e) => setDiscountPercentage(e.target.value)}
      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green"
    />
  </div>

  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-600">วันที่เริ่มต้น</label>
      <input
        type="date"
        value={validFrom}
        onChange={(e) => setValidFrom(e.target.value)}
        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green"
      />
    </div>

    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-600">วันที่สิ้นสุด</label>
      <input
        type="date"
        value={validTo}
        onChange={(e) => setValidTo(e.target.value)}
        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green"
      />
    </div>
  </div>
  <div className="space-y-2">
  <label className="block text-sm font-medium text-gray-600">ประเภทโปรโมชั่น</label>
  <select
    value={promotionType}
    onChange={(e) => setPromotionType(e.target.value)}
    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green"
  >
    <option value="">-- กรุณาเลือกประเภท --</option>
    <option value="package">โปรโมชั่นเฉพาะแพ็คเกจ</option>
    <option value="category">โปรโมชั่นเฉพาะกลุ่มสัญญา</option>
    <option value="general">โปรโมชั่นทั่วไป (ใช้ได้กับทุกแพ็คเกจ)</option>
  </select>
</div>

  {/* เงื่อนไขสำหรับ "โปรโมชั่นเฉพาะแพ็คเกจ" */}
  {promotionType === 'package' && (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-600">ชื่อแพ็คเกจที่ใช้โปรโมชั่นได้</label>
      <input
        type="text"
        placeholder="กรอกชื่อแพ็คเกจ"
        value={packageId}
        onChange={(e) => setPackageId(e.target.value)}
        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green"
      />
    </div>
  )}

  {/* เงื่อนไขสำหรับ "โปรโมชั่นเฉพาะ categoryId" */}
  {promotionType === 'category' && (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-600">ชื่อสัญญาที่ใช้โปรโมชั่นได้</label>
      <input
        type="text"
        placeholder="กรอกชื่อสัญญา"
        value={categoryId}
        onChange={(e) => setCategoryId(e.target.value)}
        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green"
      />
    </div>
  )}

  {/* ปุ่มเพิ่มโปรโมชั่น */}
  <div className="pt-4">
<Button
  onClick={handleAddPromotion}
  className="w-full bg-brand-green text-black hover:bg-brand-green/90 rounded-xl py-3 text-base font-semibold shadow-md transition duration-200"
>
  เพิ่มโปรโมชั่น
</Button>
  </div>
</div>

                  </CardContent>





<CardContent>
  <div className="space-y-2">
    {currentPromotions.length === 0 ? (
      <div className="text-center text-gray-500 py-6">
        ไม่พบโปรโมชั่นในระบบ
      </div>
    ) : (
      currentPromotions.map((promotion) => (
        <div
          key={promotion.id}
          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
        >
          <div>
            <p className="text-sm font-medium text-gray-800">
              {promotion.Name}{" "}
              {promotion.ValidTo && (() => {
                const daysLeft = getDaysUntilExpiration(promotion.ValidTo);
                const isExpired = daysLeft < 0;
                const text = daysLeft > 0
                  ? `(เหลืออีก ${daysLeft} วัน)`
                  : daysLeft === 0
                    ? `(วันนี้วันสุดท้าย)`
                    : `(หมดอายุแล้ว)`;
              
                return (
                  <span className={`ml-2 font-normal ${isExpired ? 'text-red-600' : 'text-green-600'}`}>
                    {text}
                  </span>
                );
              })()}
            </p>
            <p className="text-sm text-gray-600">ชนิด: {promotion.Type}</p>
            {promotion.Type === 'package' && (
              <p className="text-sm text-gray-600">
                ชื่อแพ็กเกจที่รองรับ: {promotion.PackageID || "(ไม่พบข้อมูลหมวดหมู่)"}
              </p>
            )}
            {promotion.Type === 'category' && (
              <p className="text-sm text-gray-600">
                หมวดหมู่ที่รองรับ: {promotion.CategoryID || "(ไม่พบข้อมูลหมวดหมู่)"}
              </p>
            )}

            <p className="text-sm text-gray-600">คำอธิบาย: {promotion.Description}</p>
            <p className="text-sm text-gray-600">ส่วนลด: {promotion.DiscountPercentage}%</p>
            <p className="text-sm text-gray-600">
              วันที่เริ่มต้น: {promotion.ValidFrom || 'ไม่ระบุ'}
            </p>
            <p className="text-sm text-gray-600">
              วันที่สิ้นสุด: {promotion.ValidTo || 'ไม่ระบุ'}
            </p>
          </div>

<div className="flex space-x-2">
  <ConfirmDeleteDialog
    packageName={promotion.Name}
    onConfirm={() => handleDeletePromotion(promotion.ID, promotion.Name)}
    triggerLabel={
      <span className="flex items-center gap-1 text-sm text-red-600 hover:text-white hover:bg-red-600 px-2 py-1 rounded cursor-pointer transition">
        <Trash2 className="w-4 h-4" />
        ลบ
      </span>
    }
  />
{/** 

  <span
    onClick={() => handleEditPromotion(promotion)}
    className="flex items-center gap-1 text-sm text-blue-600 hover:text-white hover:bg-blue-600 px-2 py-1 rounded cursor-pointer transition"
  >
    <Edit className="w-4 h-4" />
    แก้ไข
  </span>
  */}
</div>


        </div>
      ))
    )}
  </div>

  {/* ปุ่มเปลี่ยนหน้า */}
  {Array.isArray(promotionListState) && promotionListState.length > ItemsPerPage && (
    <div className="flex justify-between mt-6">
      <Button onClick={prevPage} disabled={promotionPage === 1}>
        ก่อนหน้า
      </Button>
      <Button
        onClick={nextPage}
        disabled={promotionPage >= Math.ceil(promotionListState.length / ItemsPerPage)}
      >
        ถัดไป
      </Button>
    </div>
  )}
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
