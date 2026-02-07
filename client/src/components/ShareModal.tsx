import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Copy, Check } from "lucide-react";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemName: string;
  itemType: "calculation" | "report";
}

export function ShareModal({ isOpen, onClose, itemName, itemType }: ShareModalProps) {
  const [email, setEmail] = useState("");
  const [permissions, setPermissions] = useState({
    canView: true,
    canEdit: false,
    canDelete: false,
    canShare: false,
  });
  const [expiresIn, setExpiresIn] = useState("never");
  const [copied, setCopied] = useState(false);
  const [shareLink, setShareLink] = useState("");

  const handleShare = () => {
    if (!email) {
      alert("يرجى إدخال بريد إلكتروني");
      return;
    }

    // محاكاة إنشاء رابط مشاركة
    const link = `${window.location.origin}/share/${itemType}/${Math.random().toString(36).substr(2, 9)}`;
    setShareLink(link);

    // هنا يتم إرسال دعوة المشاركة إلى الخادم
    console.log("مشاركة مع:", {
      email,
      itemName,
      itemType,
      permissions,
      expiresIn,
      shareLink: link,
    });
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-800 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-white">
            مشاركة {itemType === "calculation" ? "الحساب" : "التقرير"}
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            {itemName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* البريد الإلكتروني */}
          <div>
            <Label className="text-slate-300 mb-2 block">البريد الإلكتروني</Label>
            <Input
              type="email"
              placeholder="example@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-slate-700 border-slate-600 text-white placeholder-slate-500"
            />
          </div>

          {/* الأذونات */}
          <div>
            <Label className="text-slate-300 mb-3 block">الأذونات</Label>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="canView"
                  checked={permissions.canView}
                  onCheckedChange={(checked) =>
                    setPermissions({ ...permissions, canView: checked as boolean })
                  }
                  className="border-slate-600"
                />
                <label htmlFor="canView" className="text-slate-300 cursor-pointer">
                  عرض فقط
                </label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="canEdit"
                  checked={permissions.canEdit}
                  onCheckedChange={(checked) =>
                    setPermissions({ ...permissions, canEdit: checked as boolean })
                  }
                  className="border-slate-600"
                />
                <label htmlFor="canEdit" className="text-slate-300 cursor-pointer">
                  تعديل
                </label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="canDelete"
                  checked={permissions.canDelete}
                  onCheckedChange={(checked) =>
                    setPermissions({ ...permissions, canDelete: checked as boolean })
                  }
                  className="border-slate-600"
                />
                <label htmlFor="canDelete" className="text-slate-300 cursor-pointer">
                  حذف
                </label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="canShare"
                  checked={permissions.canShare}
                  onCheckedChange={(checked) =>
                    setPermissions({ ...permissions, canShare: checked as boolean })
                  }
                  className="border-slate-600"
                />
                <label htmlFor="canShare" className="text-slate-300 cursor-pointer">
                  مشاركة مع آخرين
                </label>
              </div>
            </div>
          </div>

          {/* مدة الصلاحية */}
          <div>
            <Label className="text-slate-300 mb-2 block">مدة الصلاحية</Label>
            <Select value={expiresIn} onValueChange={setExpiresIn}>
              <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 border-slate-600">
                <SelectItem value="never" className="text-white">
                  بدون انتهاء
                </SelectItem>
                <SelectItem value="1day" className="text-white">
                  يوم واحد
                </SelectItem>
                <SelectItem value="7days" className="text-white">
                  أسبوع واحد
                </SelectItem>
                <SelectItem value="30days" className="text-white">
                  شهر واحد
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* رابط المشاركة */}
          {shareLink && (
            <div>
              <Label className="text-slate-300 mb-2 block">رابط المشاركة</Label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={shareLink}
                  readOnly
                  className="bg-slate-700 border-slate-600 text-white text-sm"
                />
                <Button
                  onClick={handleCopyLink}
                  variant="outline"
                  size="sm"
                  className="border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  {copied ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* الأزرار */}
          <div className="flex gap-2 justify-end pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              إلغاء
            </Button>
            <Button
              onClick={handleShare}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              مشاركة
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
