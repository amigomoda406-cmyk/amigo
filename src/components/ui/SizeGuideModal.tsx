'use client';

import { useState } from 'react';
import { X, Ruler } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SizeRow {
  size: string;
  chest?: string;
  waist?: string;
  hips?: string;
  length?: string;
  eu?: string;
}

const CLOTHING_SIZES: SizeRow[] = [
  { size: 'XS', chest: '80-84', waist: '60-64', hips: '86-90', length: '64' },
  { size: 'S',  chest: '84-88', waist: '64-68', hips: '90-94', length: '65' },
  { size: 'M',  chest: '88-92', waist: '68-72', hips: '94-98', length: '66' },
  { size: 'L',  chest: '92-96', waist: '72-76', hips: '98-102', length: '67' },
  { size: 'XL', chest: '96-100', waist: '76-80', hips: '102-106', length: '68' },
  { size: 'XXL', chest: '100-106', waist: '80-86', hips: '106-112', length: '69' },
  { size: '3XL', chest: '106-112', waist: '86-92', hips: '112-118', length: '70' },
];

const SHOE_SIZES: SizeRow[] = [
  { size: 'EU 36', eu: '36', length: '22.5' },
  { size: 'EU 37', eu: '37', length: '23.0' },
  { size: 'EU 38', eu: '38', length: '23.5' },
  { size: 'EU 39', eu: '39', length: '24.5' },
  { size: 'EU 40', eu: '40', length: '25.0' },
  { size: 'EU 41', eu: '41', length: '25.5' },
  { size: 'EU 42', eu: '42', length: '26.5' },
  { size: 'EU 43', eu: '43', length: '27.0' },
  { size: 'EU 44', eu: '44', length: '27.5' },
  { size: 'EU 45', eu: '45', length: '28.5' },
];

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  type?: 'clothing' | 'shoes';
}

export default function SizeGuideModal({ isOpen, onClose, type = 'clothing' }: SizeGuideModalProps) {
  const [activeType, setActiveType] = useState<'clothing' | 'shoes'>(type);
  const sizes = activeType === 'clothing' ? CLOTHING_SIZES : SHOE_SIZES;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 60 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-xl md:w-full z-50 bg-white rounded-t-3xl md:rounded-3xl max-h-[85vh] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100">
              <div className="flex items-center gap-2">
                <Ruler className="w-4 h-4 text-zinc-500" strokeWidth={1.5} />
                <h2 className="text-sm font-black uppercase tracking-widest">دليل المقاسات</h2>
              </div>
              <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-zinc-100">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Type Tabs */}
            <div className="flex border-b border-zinc-100 px-5 pt-3 gap-4">
              {(['clothing', 'shoes'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setActiveType(t)}
                  className={`text-[10px] font-black uppercase tracking-widest pb-3 border-b-2 transition-colors ${
                    activeType === t ? 'border-zinc-900 text-zinc-900' : 'border-transparent text-zinc-400'
                  }`}
                >
                  {t === 'clothing' ? 'ملابس' : 'أحذية'}
                </button>
              ))}
            </div>

            {/* Measurement tip */}
            <div className="px-5 py-3 bg-zinc-50 mx-5 mt-4 rounded-xl">
              <p className="text-[10px] text-zinc-500 leading-relaxed font-medium">
                💡 <strong>نصيحة:</strong> قِس نفسك بشريط قياس مرن. إذا كنت بين مقاسين، اختر الأكبر للراحة.
                جميع القياسات بالـ <strong>سنتيمتر (cm)</strong>.
              </p>
            </div>

            {/* Table */}
            <div className="overflow-y-auto flex-1 px-5 pb-6 mt-4">
              <table className="w-full text-center border-collapse">
                <thead>
                  <tr className="border-b border-zinc-100">
                    <th className="text-[9px] font-black uppercase tracking-wider text-zinc-400 py-2 text-right">المقاس</th>
                    {activeType === 'clothing' ? (
                      <>
                        <th className="text-[9px] font-black uppercase tracking-wider text-zinc-400 py-2">الصدر</th>
                        <th className="text-[9px] font-black uppercase tracking-wider text-zinc-400 py-2">الخصر</th>
                        <th className="text-[9px] font-black uppercase tracking-wider text-zinc-400 py-2">الأرداف</th>
                        <th className="text-[9px] font-black uppercase tracking-wider text-zinc-400 py-2">الطول</th>
                      </>
                    ) : (
                      <>
                        <th className="text-[9px] font-black uppercase tracking-wider text-zinc-400 py-2">مقاس EU</th>
                        <th className="text-[9px] font-black uppercase tracking-wider text-zinc-400 py-2">طول القدم (cm)</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {sizes.map((row, i) => (
                    <tr key={row.size} className={`border-b border-zinc-50 ${i % 2 === 0 ? 'bg-zinc-50/50' : ''}`}>
                      <td className="py-2.5 text-[11px] font-black text-zinc-900 text-right">{row.size}</td>
                      {activeType === 'clothing' ? (
                        <>
                          <td className="py-2.5 text-[11px] text-zinc-600 font-medium">{row.chest}</td>
                          <td className="py-2.5 text-[11px] text-zinc-600 font-medium">{row.waist}</td>
                          <td className="py-2.5 text-[11px] text-zinc-600 font-medium">{row.hips}</td>
                          <td className="py-2.5 text-[11px] text-zinc-600 font-medium">{row.length}</td>
                        </>
                      ) : (
                        <>
                          <td className="py-2.5 text-[11px] text-zinc-600 font-medium">{row.eu}</td>
                          <td className="py-2.5 text-[11px] text-zinc-600 font-medium">{row.length}</td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
