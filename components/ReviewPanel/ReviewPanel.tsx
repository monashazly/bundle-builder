'use client';

import { useReviewItems, useTotals } from '@/hooks/useBundleStore';
import { formatPrice } from '@/lib/calculations';
import type { ConfigItem } from '@/lib/types';
import { saveConfig } from '@/lib/api';
import { useBundleStore } from '@/store/bundleStore';
import { ShoppingCart } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ReviewLineItem } from './ReviewLineItem';

function buildConfigItems(
  variantQty: Record<string, Record<string, number>>,
  singleQty: Record<string, number>
): ConfigItem[] {
  const items: ConfigItem[] = [];
  for (const [productId, variants] of Object.entries(variantQty)) {
    for (const [variantId, qty] of Object.entries(variants)) {
      if (qty > 0) items.push({ productId, variantId, qty });
    }
  }
  for (const [productId, qty] of Object.entries(singleQty)) {
    if (qty > 0) items.push({ productId, qty });
  }
  return items;
}

export function ReviewPanel() {
  const items = useReviewItems();
  const totals = useTotals();
  const categories = useBundleStore((s) => s.categories);
  const variantQty = useBundleStore((s) => s.variantQty);
  const singleQty = useBundleStore((s) => s.singleQty);
  const router = useRouter();

  const [saved, setSaved] = useState(false);

  const groupedItems = categories
    .map((cat) => ({
      label: cat.label.toUpperCase(),
      categoryId: cat.id,
      items: items.filter((item) => cat.products.some((p) => p.id === item.product.id)),
    }))
    .filter((group) => group.items.length > 0);

  const handleSave = async () => {
    const configItems = buildConfigItems(variantQty, singleQty);
    const { id } = await saveConfig(configItems);
    localStorage.setItem('bundle-config-id', id);
    router.replace(`/?config=${id}`);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const monthlyPayment = totals.total > 0 ? totals.total / 12 : 0;

  return (
    <div className="bg-secondary-active rounded-[10px] pt-[15px]">
      {/* "REVIEW" label */}
      <div className="px-[15px] pb-[5px]">
        <span className="text-[12px] uppercase tracking-[1.6px] text-text-step">Review</span>
      </div>

      {/* Main content */}
      <div className="px-[20px] pb-[31px] pt-[20px] flex flex-col gap-[10px]">
        {/* Title */}
        <div className="flex flex-col gap-[5px] tracking-[0.6px]">
          <h2 className="text-[22px] font-semibold text-[#1F1F1F] leading-none">
            Your security system
          </h2>
          <p className="text-[14px] text-[rgba(31,31,31,0.75)] leading-[1.3]">
            Review your personalized protection system designed to keep what matters most safe.
          </p>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <ShoppingCart size={32} className="text-gray-300 mb-3" />
            <p className="text-sm text-text-muted">
              Your system is empty. Add products from the steps on the left.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-[10px]">
            {/* Grouped items */}
            {groupedItems.map((group) => (
              <div
                key={group.label}
                className="border-t border-border-panel pt-[15px] flex flex-col gap-[8px]"
              >
                <span className="text-[12px] text-[#A8B2BD] uppercase tracking-[0.03em]">
                  {group.label}
                </span>
                <div className="flex flex-col gap-[12px]">
                  {group.items.map((item, i) => (
                    <ReviewLineItem
                      key={`${item.product.id}-${item.variant?.id ?? i}`}
                      item={item}
                      categoryId={group.categoryId}
                    />
                  ))}
                </div>
              </div>
            ))}

            {/* Fast Shipping */}
            <div className="border-t border-border-panel pt-[15px]">
              <div className="flex items-center gap-[16px]">
                <div className="shrink-0 w-[41px] h-[41px] bg-white rounded-[5px] flex items-center justify-center overflow-hidden">
                  <svg width="29" height="29" viewBox="0 0 29 29" fill="none">
                    <path
                      d="M3.625 14.5H14.5V16.3125H3.625V14.5ZM1.8125 9.96875H10.875V11.7812H1.8125V9.96875Z"
                      fill="#0AA288"
                    />
                    <path
                      d="M27.114 15.0492L24.3953 8.70544C24.3254 8.54245 24.2092 8.40355 24.0612 8.30593C23.9132 8.20831 23.7397 8.15627 23.5624 8.15625H20.8437V6.34375C20.8437 6.1034 20.7482 5.87289 20.5782 5.70293C20.4083 5.53298 20.1778 5.4375 19.9374 5.4375H5.43741V7.25H19.0312V18.6289C18.6185 18.869 18.2573 19.1882 17.9683 19.5683C17.6793 19.9484 17.4683 20.3819 17.3473 20.8438H11.6525C11.4319 19.9895 10.9073 19.245 10.1771 18.7498C9.44685 18.2546 8.56108 18.0427 7.68581 18.1539C6.81054 18.2651 6.00587 18.6916 5.42261 19.3537C4.83936 20.0157 4.51758 20.8677 4.51758 21.75C4.51758 22.6323 4.83936 23.4843 5.42261 24.1463C6.00587 24.8084 6.81054 25.2349 7.68581 25.3461C8.56108 25.4573 9.44685 25.2454 10.1771 24.7502C10.9073 24.255 11.4319 23.5105 11.6525 22.6563H17.3473C17.5445 23.434 17.9953 24.1239 18.6286 24.6166C19.2618 25.1094 20.0413 25.3769 20.8437 25.3769C21.646 25.3769 22.4255 25.1094 23.0587 24.6166C23.692 24.1239 24.1428 23.434 24.34 22.6563H26.2812C26.5215 22.6563 26.752 22.5608 26.922 22.3908C27.0919 22.2209 27.1874 21.9904 27.1874 21.75V15.4063C27.1874 15.2835 27.1624 15.162 27.114 15.0492ZM8.15616 23.5625C7.79768 23.5625 7.44725 23.4562 7.14919 23.257C6.85112 23.0579 6.61881 22.7748 6.48162 22.4436C6.34444 22.1124 6.30855 21.748 6.37848 21.3964C6.44842 21.0448 6.62104 20.7219 6.87453 20.4684C7.12801 20.2149 7.45097 20.0423 7.80256 19.9723C8.15415 19.9024 8.51858 19.9383 8.84977 20.0755C9.18096 20.2127 9.46404 20.445 9.6632 20.743C9.86236 21.0411 9.96866 21.3915 9.96866 21.75C9.96866 22.2307 9.7777 22.6917 9.43779 23.0316C9.09788 23.3715 8.63686 23.5625 8.15616 23.5625ZM20.8437 9.96875H22.9643L24.9073 14.5H20.8437V9.96875ZM20.8437 23.5625C20.4852 23.5625 20.1348 23.4562 19.8367 23.257C19.5386 23.0579 19.3063 22.7748 19.1691 22.4436C19.0319 22.1124 18.996 21.748 19.066 21.3964C19.1359 21.0448 19.3085 20.7219 19.562 20.4684C19.8155 20.2149 20.1385 20.0423 20.4901 19.9723C20.8416 19.9024 21.2061 19.9383 21.5373 20.0755C21.8685 20.2127 22.1515 20.445 22.3507 20.743C22.5499 21.0411 22.6562 21.3915 22.6562 21.75C22.6562 22.2307 22.4652 22.6917 22.1253 23.0316C21.7854 23.3715 21.3244 23.5625 20.8437 23.5625ZM25.3749 20.8438H24.34C24.1403 20.0675 23.6888 19.3794 23.056 18.8874C22.4233 18.3954 21.6452 18.1272 20.8437 18.125V16.3125H25.3749V20.8438Z"
                      fill="#0AA288"
                    />
                  </svg>
                </div>
                <span className="flex-[1_0_0] text-[14px] text-text-obsidian leading-[16px] tracking-[0.07px]">
                  Fast Shipping
                </span>
                <div className="shrink-0 flex flex-col items-end">
                  <span className="text-[14px] text-[#6F7882] line-through leading-[16px]">
                    $5.99
                  </span>
                  <span className="text-[14px] font-semibold text-prim-600 leading-[16px]">
                    FREE
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom — badge, financing, totals, savings, checkout */}
            <div className="flex flex-col gap-[8px]">
              {/* Badge + pricing row */}
              <div className="flex items-center justify-between w-full">
                <div className="relative shrink-0 size-[78px]">
                  <Image
                    src="/images/satisfaction-badge.png"
                    alt="30-day satisfaction guarantee"
                    fill
                    className="object-contain"
                  />
                </div>
                <div className="flex flex-col gap-[8px] items-end justify-center">
                  {monthlyPayment > 0 && (
                    <div className="bg-prim-600 rounded-[3px] px-[8px] py-[5px]">
                      <span className="text-[12px] text-white tracking-[-0.6px] whitespace-nowrap">
                        as low as {formatPrice(monthlyPayment)}/mo
                      </span>
                    </div>
                  )}
                  <div className="flex items-baseline gap-[8px]">
                    {totals.savings > 0 && (
                      <span className="text-[18px] text-[#6F7882] line-through leading-[20px]">
                        {formatPrice(totals.subtotal)}
                      </span>
                    )}
                    <span className="text-[24px] font-bold text-prim-600 leading-[32px]">
                      {formatPrice(totals.total)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Savings + checkout */}
              <div className="flex flex-col gap-[4px] pt-[10px]">
                {totals.savings > 0 && (
                  <p className="text-[12px] font-semibold text-savings text-center w-full leading-none">
                    Congrats! You&apos;re saving {formatPrice(totals.savings)} on your security
                    bundle!
                  </p>
                )}
                <button
                  type="button"
                  className="w-full bg-prim-600 text-white font-bold text-[17px] py-[13px] px-[16px] rounded-[4px] hover:bg-prim-700 transition-colors disabled:opacity-50"
                  onClick={() => alert('Checkout coming soon!')}
                  disabled={items.length === 0}
                >
                  Checkout
                </button>
              </div>
            </div>
          </div>
        )}

        {items.length > 0 && (
          <button
            type="button"
            className="w-full text-[14px] italic text-text-step underline text-center tracking-[-0.016px]"
            onClick={handleSave}
          >
            {saved ? 'Saved! Come back anytime.' : 'Save my system for later'}
          </button>
        )}
      </div>
    </div>
  );
}
