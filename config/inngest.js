import User from "@/models/User";
import { Inngest } from "inngest";
import connectDB from "./db";

export const inngest = new Inngest({ id: "quickcart-next" });

// Create / Update User
export const syncUserCreation = inngest.createFunction(
  { id: "sync-user-from-clerk" },
  { event: "clerk/user.created" },
  async ({ event }) => {
    const { id, first_name, last_name, email_addresses, image_url } = event.data;

    if (!id) return; // Safety check

    await connectDB();

    await User.findByIdAndUpdate(
      id,
      {
        email: email_addresses[0]?.email_address || "",
        name: `${first_name ?? ""} ${last_name ?? ""}`.trim(),
        imageUrl: image_url || ""
      },
      { upsert: true, new: true }
    );
  }
);

// Delete User
export const syncUserDeletion = inngest.createFunction(
  { id: "delete-user-with-clerk" },
  { event: "clerk/user.deleted" },
  async ({ event }) => {
    const { id } = event.data;

    if (!id) return; // Safety check

    await connectDB();
    await User.findByIdAndDelete(id);
  }
);
