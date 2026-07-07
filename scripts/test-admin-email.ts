import "dotenv/config";
import { adminNewOrderEmail, sendAdminEmail } from "../lib/email";

async function main() {
  const key = process.env.RESEND_API_KEY?.trim();
  const admin = process.env.ADMIN_EMAIL?.trim();
  const from = process.env.EMAIL_FROM ?? "Mama Peace <orders@mamapeacemart.com>";

  console.log("ADMIN_EMAIL set:", Boolean(admin));
  console.log("RESEND_API_KEY set:", Boolean(key));
  console.log("EMAIL_FROM:", from);

  if (!admin) {
    console.error("ADMIN_EMAIL is missing or empty.");
    process.exit(1);
  }

  if (!key) {
    console.error(
      "RESEND_API_KEY is missing. Emails are only logged to the server console in dev mode."
    );
    process.exit(1);
  }

  const result = await sendAdminEmail(
    adminNewOrderEmail({
      customerName: "Test Customer",
      phoneNumber: "0241234567",
      customerEmail: "customer@example.com",
      referenceNumber: "MP-TEST-0001",
      itemsRequested: "Rice, tomatoes, cooking oil",
      gpsAddress: "East Legon, Accra",
      specialInstructions: "Call on arrival",
      adminUrl: process.env.NEXT_PUBLIC_APP_URL
        ? `${process.env.NEXT_PUBLIC_APP_URL}/admin`
        : "http://localhost:3000/admin",
    })
  );

  console.log("Result:", result);
  if ("error" in result && result.error) process.exit(1);
  if ("skipped" in result && result.skipped) process.exit(1);
  if ("dev" in result && result.dev) process.exit(1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
