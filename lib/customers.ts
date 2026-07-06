import { prisma } from "@/lib/prisma";
import { PAID_ORDER_STATUSES } from "@/lib/constants";

export type CustomerSummary = {
  phone: string;
  name: string;
  email: string | null;
  orderCount: number;
  totalSpent: number;
  lastOrderAt: Date;
  area: string | null;
};

function normalizePhone(phone: string) {
  return phone.replace(/\D/g, "");
}

export async function getCustomerSummaries(): Promise<CustomerSummary[]> {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      customerName: true,
      phoneNumber: true,
      customerEmail: true,
      gpsAddress: true,
      totalAmount: true,
      status: true,
      createdAt: true,
    },
  });

  const byPhone = new Map<string, CustomerSummary>();

  for (const order of orders) {
    const phone = normalizePhone(order.phoneNumber);
    const existing = byPhone.get(phone);

    const isPaid = PAID_ORDER_STATUSES.includes(
      order.status as (typeof PAID_ORDER_STATUSES)[number]
    );
    const spent = isPaid ? (order.totalAmount ?? 0) : 0;

    if (!existing) {
      byPhone.set(phone, {
        phone: order.phoneNumber,
        name: order.customerName,
        email: order.customerEmail?.trim().toLowerCase() || null,
        orderCount: 1,
        totalSpent: spent,
        lastOrderAt: order.createdAt,
        area: order.gpsAddress,
      });
      continue;
    }

    existing.orderCount += 1;
    existing.totalSpent += spent;
    if (order.createdAt > existing.lastOrderAt) {
      existing.lastOrderAt = order.createdAt;
      existing.name = order.customerName;
      if (order.customerEmail) {
        existing.email = order.customerEmail.trim().toLowerCase();
      }
      existing.area = order.gpsAddress;
    } else if (!existing.email && order.customerEmail) {
      existing.email = order.customerEmail.trim().toLowerCase();
    }
  }

  return Array.from(byPhone.values()).sort(
    (a, b) => b.lastOrderAt.getTime() - a.lastOrderAt.getTime()
  );
}

export const PROMOTION_PRESETS = [
  {
    id: "weekend-deal",
    label: "Weekend Deal",
    subject: "Weekend specials at Mama Peace Mini Mart",
    message:
      "Fresh vegetables, fruits, and household essentials at great prices this weekend. Place your order today and we'll deliver across Greater Accra.",
  },
  {
    id: "holiday-greeting",
    label: "Holiday Greeting",
    subject: "Happy holidays from Mama Peace Mini Mart",
    message:
      "Wishing you and your family a wonderful celebration. When you're ready to restock, we're here with fresh groceries delivered to your door.",
  },
  {
    id: "new-arrivals",
    label: "New Arrivals",
    subject: "New stock just in at Mama Peace",
    message:
      "We've added fresh seasonal produce and new items to our shelves. Browse our catalog and send us your shopping list — we'll handle the rest.",
  },
  {
    id: "thank-you",
    label: "Thank You",
    subject: "Thank you for shopping with Mama Peace",
    message:
      "We appreciate your trust in Mama Peace Mini Mart. As a thank you, enjoy reliable delivery and carefully selected groceries every time you order.",
  },
] as const;
