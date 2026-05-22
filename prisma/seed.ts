import { prisma } from "../libs/prisma";
import bcrypt from "bcrypt";

async function seed() {
  console.log("Adding admin user...");
  await prisma.adminUser.create({
    data: {
      email: "aungphyokhant.official@gmail.com",
      password: await bcrypt.hash("255982apk", 10),
      role: "ADMIN",
      lastLogin: new Date(),
      isActive: true,
    },
  });
  console.log("Admin user added successfully.");

  const openingHoursData = [
    { dayOfWeek: "Monday", openTime: "05:00 PM", closeTime: "10:00 PM", isClosed: false },
    { dayOfWeek: "Tuesday", openTime: "05:00 PM", closeTime: "10:00 PM", isClosed: false },
    { dayOfWeek: "Wednesday", openTime: "05:00 PM", closeTime: "10:00 PM", isClosed: false },
    { dayOfWeek: "Thursday", openTime: "05:00 PM", closeTime: "10:00 PM", isClosed: false },
    { dayOfWeek: "Friday", openTime: "05:00 PM", closeTime: "11:00 PM", isClosed: false },
    { dayOfWeek: "Saturday", openTime: "11:00 AM", closeTime: "11:00 PM", isClosed: false },
    { dayOfWeek: "Sunday", openTime: null, closeTime: null, isClosed: true },
  ];

  console.log("⏳ Seeding opening hours...");

  for (const hour of openingHoursData) {
    await prisma.openingHour.upsert({
      where: { dayOfWeek: hour.dayOfWeek },
      update: {
        openTime: hour.openTime,
        closeTime: hour.closeTime,
        isClosed: hour.isClosed,
      },
      create: hour,
    });
  }
  console.log("Seed success!");

  console.log("🌱 Starting seeding...");

  const menuCategories = [
    {
      name: "Sunday Menu",
      image:
        "https://images.unsplash.com/photo-1773431178270-7ec0483cb288?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8RGFpbHklMjBmb29kfGVufDB8fDB8fHww",
    },
    {
      name: "Monday Menu",
      image:
        "https://plus.unsplash.com/premium_photo-1672363353881-68c8ff594e25?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8RGFpbHklMjBmb29kfGVufDB8fDB8fHww",
    },
  ];
  console.log("⏳ Seeding Menu Categories...");
  for (const category of menuCategories) {
    await prisma.menuCategory.create({
      data: {
        name: category.name,
        image: category.image,
      },
    });
  }

  console.log("Seed success!");

  console.log("⏳ Seeding Menu Items...");

  const menuItems = [
    {
      name: "Chicken Tikka",
      price: 10,
      image:
        "https://plus.unsplash.com/premium_photo-1672498193267-4f0e8c819bc8?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8Y2hpY2tlbiUyMHRpa2thfGVufDB8fDB8fHww",
      menuCategoryId: 2,
    },
    {
      name: "Beef Tikka",
      price: 15,
      image:
        "https://plus.unsplash.com/premium_photo-1668616817075-0d6918b7f9e8?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8QmVlZiUyMFRpa2thfGVufDB8fDB8fHww",
      menuCategoryId: 2,
    },
    {
      name: "Chicken Biryani",
      price: 20,
      image:
        "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Q2hpY2tlbiUyMEJpcnlhbml8ZW58MHx8MHx8fDA%3D",
      menuCategoryId: 2,
    },
    {
      name: "Vegetable Biryani",
      price: 25,
      image:
        "https://images.unsplash.com/photo-1775039983787-3fe9b416c545?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8VmVnZXRhYmxlJTIwQmlyeWFuaXxlbnwwfHwwfHx8MA%3D%3D",
      menuCategoryId: 1,
    },
    {
      name: "Fish Curry",
      price: 30,
      image:
        "https://plus.unsplash.com/premium_photo-1723708871094-2c02cf5f5394?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8RmlzaCUyMEN1cnJ5fGVufDB8fDB8fHww",
      menuCategoryId: 1,
    },
    {
      name: "Lamb Curry",
      price: 35,
      image:
        "https://images.unsplash.com/photo-1545247181-516773cae754?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8TGFtYiUyMEN1cnJ5fGVufDB8fDB8fHww",
      menuCategoryId: 1,
    },
    {
      name: "Egg Roll",
      price: 40,
      image:
        "https://images.unsplash.com/photo-1559095240-55a16b2dda6a?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8RWdnJTIwUm9sbHxlbnwwfHwwfHx8MA%3D%3D",
      menuCategoryId: 1,
    },
    {
      name: "Fried Rice",
      price: 45,
      image:
        "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8RnJpZWQlMjBSaWNlfGVufDB8fDB8fHww",
      menuCategoryId: 1,
    },
    {
      name: "Paneer Tikka",
      price: 50,
      image:
        "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8UGFuZWVyJTIwVGlra2F8ZW58MHx8MHx8fDA%3D",
      menuCategoryId: 1,
    },
    {
      name: "Butter Chicken",
      price: 55,
      image:
        "https://plus.unsplash.com/premium_photo-1661419883163-bb4df1c10109?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8QnV0dGVyJTIwQ2hpY2tlbnxlbnwwfHwwfHx8MA%3D%3D",
      menuCategoryId: 1,
    },
  ];

  for (const item of menuItems) {
    await prisma.menuItem.create({
      data: {
        name: item.name,
        price: item.price,
        image: item.image,
        menuCategoryId: item.menuCategoryId,
      },
    });
  }

  console.log("🌱 Starting seeding...");

  const galleryItems = [
    // 1. Event Photos
    {
      title: "Grand Opening Night",
      type: "image",
      url: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b",
      category: "Event",
    },
    // 2. Birthday Celebration (Video)
    {
      title: "Chef Harlan Birthday Surprise",
      type: "video",
      url: "https://www.youtube.com/watch?v=example1",
      category: "Birthday",
    },
    // 3. Private Party
    {
      title: "Exclusive Wine Tasting Party",
      type: "image",
      url: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3",
      category: "Party",
    },
    // 4. Anniversary Event
    {
      title: "5th Year Anniversary Dinner",
      type: "image",
      url: "https://plus.unsplash.com/premium_photo-1711044544207-ad0e3be6b292?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8NXRoJTIwWWVhciUyMEFubml2ZXJzYXJ5JTIwRGlubmVyfGVufDB8fDB8fHww",
      category: "Event",
    },
    // 5. Customer Birthday
    {
      title: "Guest Birthday Celebration",
      type: "image",
      url: "https://images.unsplash.com/photo-1464349153735-7db50ed83c84",
      category: "Birthday",
    },
  ];

  console.log("⏳ Seeding Gallery Items...");

  for (const item of galleryItems) {
    await prisma.galleryItem.create({
      data: item,
    });
  }

  console.log("Start seeding contact messages...");

  const contactMessages = [
    {
      userName: "U Kyaw Kyaw",
      userEmail: "kyawkyaw@gmail.com",
      subject: "Inquiry about Private Party",
      message: "I would like to host a birthday party for 20 people next month. Do you have a private room?",
      isRead: false,
    },
    {
      userName: "Ms. Sarah Jones",
      userEmail: "sarah.j@example.com",
      subject: "Dietary Requirements",
      message: "Hello, I have a reservation tomorrow. Just wanted to confirm if you offer gluten-free options in the Tasting Menu.",
      isRead: true, // Admin ဖတ်ပြီးသားအဖြစ် နမူနာပြထားခြင်း
    },
    {
      userName: "Daw Nu Nu",
      userEmail: "nunu.pattaya@outlook.com",
      subject: "Career Opportunity",
      message: "I am a pastry chef with 5 years of experience. Are you currently hiring?",
      isRead: false,
    },
  ];

  for (const msg of contactMessages) {
    const createdMsg = await prisma.contactMessage.create({
      data: msg,
    });
    console.log(`Created message from: ${createdMsg.userName}`);
  }

  console.log("Seeding contact messages finished.");

  console.log("⏳ Seeding Reservations...");

  const reservations = [
    {
      bookingDate: "06/01/2024",
      bookingTime: "12:00 PM",
      guestsCount: 10,
      selectedMenu: "Sunday Menu",
      guestName: "Mr. John Doe",
      phoneNumber: "09444555666",
      email: "john.doe@example.com",
      otherContactId: "@johndoe_line",
      specialNotes: "Birthday celebration",
      status: "confirmed",
      agreedToTerms: true,
      understoodLeadTime: true,
    },
  ];

  for (const res of reservations) {
    await prisma.reservation.create({
      data: res,
    });
  }

  console.log("✅ Reservations Seeded!");

 
  const room = await prisma.chatRoom.create({
    data: {
      guestName: "Kyaw Kyaw",
      phoneNumber: "091234567",
      email: "kyawkyaw@gmail.com",
    }
  });
   console.log("room Success")


  await prisma.message.createMany({
    data: [
      { roomId: room.id, senderType: "GUEST", text: "မင်္ဂလာပါ admin ခင်ဗျာ။" },
      { roomId: room.id, senderType: "ADMIN", text: "ဟုတ်ကဲ့ပါ၊ ဘာများ ကူညီပေးရမလဲခင်ဗျာ။" }
    ]
  });

  console.log("message success")

}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
