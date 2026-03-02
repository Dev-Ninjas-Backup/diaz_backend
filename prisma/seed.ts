import * as bcrypt from 'bcrypt';
import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from './generated/client';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({
  adapter,
});

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing data (optional - comment out if you want to keep existing data)
  console.log('🧹 Cleaning existing data...');
  // Delete in proper order to avoid foreign key constraint errors
  await prisma.invoice.deleteMany();
  await prisma.userSubscription.deleteMany();
  await prisma.promoCode.deleteMany();
  await prisma.floridaLead.deleteMany();
  await prisma.contact.deleteMany();
  await prisma.contactUs.deleteMany();
  await prisma.contactInfo.deleteMany();
  await prisma.boatImage.deleteMany();
  await prisma.boatEngine.deleteMany();
  await prisma.boats.deleteMany();
  await prisma.userNotification.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.blog.deleteMany();
  await prisma.aiSearchBanner.deleteMany();
  await prisma.packageBanner.deleteMany();
  await prisma.featuredBrands.deleteMany();
  await prisma.featuredYacht.deleteMany();
  await prisma.pageBanner.deleteMany();
  await prisma.aboutPage.deleteMany();
  await prisma.contactPage.deleteMany();
  await prisma.privacyPolicy.deleteMany();
  await prisma.termsOfServices.deleteMany();
  await prisma.footerSettings.deleteMany();
  await prisma.emailSubscription.deleteMany();
  await prisma.fAQ.deleteMany();
  await prisma.whyUs.deleteMany();
  await prisma.ourStory.deleteMany();
  await prisma.missionVision.deleteMany();
  await prisma.whatSetsUsApart.deleteMany();
  await prisma.ourTeam.deleteMany();
  await prisma.category.deleteMany();
  await prisma.setting.deleteMany();
  await prisma.fileInstance.deleteMany();
  await prisma.boatSpecification.deleteMany();
  await prisma.boatFeature.deleteMany();
  await prisma.user.deleteMany();
  await prisma.subscriptionPlan.deleteMany();
  await prisma.visitorSession.deleteMany();
  await prisma.pageView.deleteMany();

  // 1. Create Subscription Plans
  console.log('📦 Creating subscription plans...');
  const goldPlan = await prisma.subscriptionPlan.create({
    data: {
      title: 'Gold Plan',
      planType: 'GOLD',
      description: 'Basic plan for sellers',
      benefits: ['5 boat listings', 'Basic support', 'Standard features'],
      picLimit: 5,
      wordLimit: 500,
      isBest: false,
      isActive: true,
      stripeProductId: 'prod_gold_' + Date.now(),
      stripePriceId: 'price_gold_' + Date.now(),
      currency: 'usd',
      price: 29.99,
      billingPeriodMonths: 1,
    },
  });

  const platinumPlan = await prisma.subscriptionPlan.create({
    data: {
      title: 'Platinum Plan',
      planType: 'PLATINUM',
      description: 'Advanced plan for serious sellers',
      benefits: [
        '15 boat listings',
        'Priority support',
        'Advanced features',
        'Analytics',
      ],
      picLimit: 10,
      wordLimit: 1000,
      isBest: true,
      isActive: true,
      stripeProductId: 'prod_platinum_' + Date.now(),
      stripePriceId: 'price_platinum_' + Date.now(),
      currency: 'usd',
      price: 79.99,
      billingPeriodMonths: 1,
    },
  });

  const diamondPlan = await prisma.subscriptionPlan.create({
    data: {
      title: 'Diamond Plan',
      planType: 'DIAMOND',
      description: 'Premium plan for professional sellers',
      benefits: [
        'Unlimited listings',
        '24/7 support',
        'All features',
        'Advanced analytics',
        'Featured listings',
      ],
      picLimit: 20,
      wordLimit: 2000,
      isBest: false,
      isActive: true,
      stripeProductId: 'prod_diamond_' + Date.now(),
      stripePriceId: 'price_diamond_' + Date.now(),
      currency: 'usd',
      price: 149.99,
      billingPeriodMonths: 1,
    },
  });

  // 2. Create Promo Codes
  console.log('🎟️ Creating promo codes...');
  const promoCode1 = await prisma.promoCode.create({
    data: {
      stripeCouponId: 'coupon_welcome_' + Date.now(),
      code: 'WELCOME10',
      freeDays: 10,
      maxRedemptions: 100,
      expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
    },
  });

  const promoCode2 = await prisma.promoCode.create({
    data: {
      stripeCouponId: 'coupon_trial_' + Date.now(),
      code: 'TRIAL1MONTH',
      freeDays: 30,
      maxRedemptions: 50,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    },
  });

  const promoCode3 = await prisma.promoCode.create({
    data: {
      stripeCouponId: 'coupon_diamond_' + Date.now(),
      code: 'DIAMOND20',
      freeDays: 20,
      maxRedemptions: 25,
      expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    },
  });

  const promoCode4 = await prisma.promoCode.create({
    data: {
      stripeCouponId: 'coupon_summer_' + Date.now(),
      code: 'SUMMER2024',
      freeDays: 15,
      maxRedemptions: 200,
      expiresAt: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000),
    },
  });

  // 3. Create Users
  console.log('👤 Creating users...');
  const hashedPassword = await bcrypt.hash('password123', 10);

  // Check if admin user already exists (to avoid conflict with super-admin service)
  let adminUser = await prisma.user.findFirst({
    where: {
      OR: [{ email: 'admin@diaz.com' }, { username: 'admin' }],
    },
  });

  if (!adminUser) {
    adminUser = await prisma.user.create({
      data: {
        email: 'admin@diaz.com',
        username: 'admin',
        password: hashedPassword,
        name: 'Admin User',
        role: 'SUPER_ADMIN',
        status: 'ACTIVE',
        isVerified: true,
        isLoggedIn: false,
        currentPlanId: diamondPlan.id,
        currentPlanStatus: 'ACTIVE',
        stripeCustomerId: 'cus_admin_' + Date.now(),
      },
    });
    console.log('✅ Admin user created');
  } else {
    console.log('ℹ️  Admin user already exists, skipping creation');
  }

  const sellerUser1 = await prisma.user.create({
    data: {
      email: 'seller1@diaz.com',
      username: 'seller1',
      password: hashedPassword,
      name: 'John Seller',
      role: 'SELLER',
      status: 'ACTIVE',
      isVerified: true,
      phone: '+1234567890',
      country: 'USA',
      state: 'Florida',
      city: 'Miami',
      zip: '33101',
      currentPlanId: platinumPlan.id,
      currentPlanStatus: 'ACTIVE',
      stripeCustomerId: 'cus_seller1_' + Date.now(),
    },
  });

  const sellerUser2 = await prisma.user.create({
    data: {
      email: 'seller2@diaz.com',
      username: 'seller2',
      password: hashedPassword,
      name: 'Jane Seller',
      role: 'SELLER',
      status: 'ACTIVE',
      isVerified: true,
      phone: '+1987654321',
      country: 'USA',
      state: 'Florida',
      city: 'Tampa',
      zip: '33601',
      currentPlanId: goldPlan.id,
      currentPlanStatus: 'ACTIVE',
      stripeCustomerId: 'cus_seller2_' + Date.now(),
    },
  });

  const sellerUser3 = await prisma.user.create({
    data: {
      email: 'seller3@diaz.com',
      username: 'seller3',
      password: hashedPassword,
      name: 'Mike Johnson',
      role: 'SELLER',
      status: 'ACTIVE',
      isVerified: true,
      phone: '+1555123456',
      country: 'USA',
      state: 'Florida',
      city: 'Orlando',
      zip: '32801',
      currentPlanId: diamondPlan.id,
      currentPlanStatus: 'ACTIVE',
      stripeCustomerId: 'cus_seller3_' + Date.now(),
      avatarUrl: 'https://www.gravatar.com/avatar/mike?d=identicon',
    },
  });

  const sellerUser4 = await prisma.user.create({
    data: {
      email: 'seller4@diaz.com',
      username: 'seller4',
      password: hashedPassword,
      name: 'Sarah Williams',
      role: 'SELLER',
      status: 'ACTIVE',
      isVerified: true,
      phone: '+1555987654',
      country: 'USA',
      state: 'Florida',
      city: 'Fort Lauderdale',
      zip: '33301',
      currentPlanId: platinumPlan.id,
      currentPlanStatus: 'ACTIVE',
      stripeCustomerId: 'cus_seller4_' + Date.now(),
    },
  });

  const sellerUser5 = await prisma.user.create({
    data: {
      email: 'seller5@diaz.com',
      username: 'seller5',
      password: hashedPassword,
      name: 'David Brown',
      role: 'SELLER',
      status: 'ACTIVE',
      isVerified: true,
      phone: '+1555555555',
      country: 'USA',
      state: 'Florida',
      city: 'Key West',
      zip: '33040',
      currentPlanId: diamondPlan.id,
      currentPlanStatus: 'ACTIVE',
      stripeCustomerId: 'cus_seller5_' + Date.now(),
    },
  });

  const sellerUser6 = await prisma.user.create({
    data: {
      email: 'seller6@diaz.com',
      username: 'seller6',
      password: hashedPassword,
      name: 'Lisa Anderson',
      role: 'SELLER',
      status: 'ACTIVE',
      isVerified: true,
      phone: '+1555444444',
      country: 'USA',
      state: 'Florida',
      city: 'Naples',
      zip: '34101',
      currentPlanId: goldPlan.id,
      currentPlanStatus: 'ACTIVE',
      stripeCustomerId: 'cus_seller6_' + Date.now(),
    },
  });

  const adminUser2 = await prisma.user.create({
    data: {
      email: 'admin2@diaz.com',
      username: 'admin2',
      password: hashedPassword,
      name: 'Admin Manager',
      role: 'ADMIN',
      status: 'ACTIVE',
      isVerified: true,
      isLoggedIn: false,
      currentPlanId: diamondPlan.id,
      currentPlanStatus: 'ACTIVE',
      stripeCustomerId: 'cus_admin2_' + Date.now(),
    },
  });

  // 4. Create User Subscriptions
  console.log('💳 Creating user subscriptions...');
  const subscription1 = await prisma.userSubscription.create({
    data: {
      userId: sellerUser1.id,
      planId: platinumPlan.id,
      stripeTransactionId: 'pi_sub1_' + Date.now(),
      stripeSubscriptionId: 'sub_seller1_' + Date.now(),
      status: 'ACTIVE',
      planStartedAt: new Date(),
      planEndedAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      paidAt: new Date(),
      promoCodeId: promoCode2.id,
      billingCycle: 1,
    },
  });

  const subscription2 = await prisma.userSubscription.create({
    data: {
      userId: sellerUser2.id,
      planId: goldPlan.id,
      stripeTransactionId: 'pi_sub2_' + Date.now(),
      stripeSubscriptionId: 'sub_seller2_' + Date.now(),
      status: 'ACTIVE',
      planStartedAt: new Date(),
      planEndedAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      paidAt: new Date(),
      promoCodeId: promoCode1.id,
      billingCycle: 1,
    },
  });

  const subscription3 = await prisma.userSubscription.create({
    data: {
      userId: sellerUser3.id,
      planId: diamondPlan.id,
      stripeTransactionId: 'pi_sub3_' + Date.now(),
      stripeSubscriptionId: 'sub_seller3_' + Date.now(),
      status: 'ACTIVE',
      planStartedAt: new Date(),
      planEndedAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      paidAt: new Date(),
      promoCodeId: promoCode3.id,
      billingCycle: 1,
    },
  });

  const subscription4 = await prisma.userSubscription.create({
    data: {
      userId: sellerUser4.id,
      planId: platinumPlan.id,
      stripeTransactionId: 'pi_sub4_' + Date.now(),
      stripeSubscriptionId: 'sub_seller4_' + Date.now(),
      status: 'ACTIVE',
      planStartedAt: new Date(),
      planEndedAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      paidAt: new Date(),
      promoCodeId: promoCode4.id,
      billingCycle: 1,
    },
  });

  const subscription5 = await prisma.userSubscription.create({
    data: {
      userId: sellerUser5.id,
      planId: diamondPlan.id,
      stripeTransactionId: 'pi_sub5_' + Date.now(),
      stripeSubscriptionId: 'sub_seller5_' + Date.now(),
      status: 'ACTIVE',
      planStartedAt: new Date(),
      planEndedAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      paidAt: new Date(),
      billingCycle: 1,
    },
  });

  const subscription6 = await prisma.userSubscription.create({
    data: {
      userId: sellerUser6.id,
      planId: goldPlan.id,
      stripeTransactionId: 'pi_sub6_' + Date.now(),
      stripeSubscriptionId: 'sub_seller6_' + Date.now(),
      status: 'ACTIVE',
      planStartedAt: new Date(),
      planEndedAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      paidAt: new Date(),
      billingCycle: 1,
    },
  });

  // 5. Create Invoices
  console.log('🧾 Creating invoices...');
  await prisma.invoice.create({
    data: {
      stripeInvoiceId: 'in_sub1_' + Date.now(),
      userId: sellerUser1.id,
      subscriptionId: subscription1.id,
      amount: 79.99,
      currency: 'usd',
      status: 'PAID',
      paidAt: new Date(),
      dueAt: new Date(),
    },
  });

  await prisma.invoice.create({
    data: {
      stripeInvoiceId: 'in_sub2_' + Date.now(),
      userId: sellerUser2.id,
      subscriptionId: subscription2.id,
      amount: 29.99,
      currency: 'usd',
      status: 'PAID',
      paidAt: new Date(),
      dueAt: new Date(),
    },
  });

  await prisma.invoice.createMany({
    data: [
      {
        stripeInvoiceId: 'in_sub3_' + Date.now(),
        userId: sellerUser3.id,
        subscriptionId: subscription3.id,
        amount: 149.99,
        currency: 'usd',
        status: 'PAID',
        paidAt: new Date(),
        dueAt: new Date(),
      },
      {
        stripeInvoiceId: 'in_sub4_' + Date.now(),
        userId: sellerUser4.id,
        subscriptionId: subscription4.id,
        amount: 79.99,
        currency: 'usd',
        status: 'PAID',
        paidAt: new Date(),
        dueAt: new Date(),
      },
      {
        stripeInvoiceId: 'in_sub5_' + Date.now(),
        userId: sellerUser5.id,
        subscriptionId: subscription5.id,
        amount: 149.99,
        currency: 'usd',
        status: 'PAID',
        paidAt: new Date(),
        dueAt: new Date(),
      },
      {
        stripeInvoiceId: 'in_sub6_' + Date.now(),
        userId: sellerUser6.id,
        subscriptionId: subscription6.id,
        amount: 29.99,
        currency: 'usd',
        status: 'PAID',
        paidAt: new Date(),
        dueAt: new Date(),
      },
    ],
  });

  // 6. Create File Instances
  console.log('📁 Creating file instances...');
  const logoFile = await prisma.fileInstance.create({
    data: {
      filename: 'logo.png',
      originalFilename: 'logo.png',
      path: '/uploads/logo.png',
      url: 'https://example.com/uploads/logo.png',
      fileType: 'image',
      mimeType: 'image/png',
      size: 10240,
    },
  });

  const boatImage1 = await prisma.fileInstance.create({
    data: {
      filename: 'boat1.jpg',
      originalFilename: 'boat1.jpg',
      path: '/uploads/boats/boat1.jpg',
      url: 'https://example.com/uploads/boats/boat1.jpg',
      fileType: 'image',
      mimeType: 'image/jpeg',
      size: 204800,
    },
  });

  const boatImage2 = await prisma.fileInstance.create({
    data: {
      filename: 'boat2.jpg',
      originalFilename: 'boat2.jpg',
      path: '/uploads/boats/boat2.jpg',
      url: 'https://example.com/uploads/boats/boat2.jpg',
      fileType: 'image',
      mimeType: 'image/jpeg',
      size: 215040,
    },
  });

  const blogImage = await prisma.fileInstance.create({
    data: {
      filename: 'blog1.jpg',
      originalFilename: 'blog1.jpg',
      path: '/uploads/blogs/blog1.jpg',
      url: 'https://example.com/uploads/blogs/blog1.jpg',
      fileType: 'image',
      mimeType: 'image/jpeg',
      size: 153600,
    },
  });

  const bannerImage = await prisma.fileInstance.create({
    data: {
      filename: 'banner.jpg',
      originalFilename: 'banner.jpg',
      path: '/uploads/banners/banner.jpg',
      url: 'https://example.com/uploads/banners/banner.jpg',
      fileType: 'image',
      mimeType: 'image/jpeg',
      size: 307200,
    },
  });

  const featuredBrandLogo = await prisma.fileInstance.create({
    data: {
      filename: 'brand-logo.png',
      originalFilename: 'brand-logo.png',
      path: '/uploads/brands/brand-logo.png',
      url: 'https://example.com/uploads/brands/brand-logo.png',
      fileType: 'image',
      mimeType: 'image/png',
      size: 51200,
    },
  });

  // Create more boat images
  const boatImage3 = await prisma.fileInstance.create({
    data: {
      filename: 'boat3.jpg',
      originalFilename: 'boat3.jpg',
      path: '/uploads/boats/boat3.jpg',
      url: 'https://example.com/uploads/boats/boat3.jpg',
      fileType: 'image',
      mimeType: 'image/jpeg',
      size: 225280,
    },
  });

  const boatImage4 = await prisma.fileInstance.create({
    data: {
      filename: 'boat4.jpg',
      originalFilename: 'boat4.jpg',
      path: '/uploads/boats/boat4.jpg',
      url: 'https://example.com/uploads/boats/boat4.jpg',
      fileType: 'image',
      mimeType: 'image/jpeg',
      size: 235520,
    },
  });

  const boatImage5 = await prisma.fileInstance.create({
    data: {
      filename: 'boat5.jpg',
      originalFilename: 'boat5.jpg',
      path: '/uploads/boats/boat5.jpg',
      url: 'https://example.com/uploads/boats/boat5.jpg',
      fileType: 'image',
      mimeType: 'image/jpeg',
      size: 245760,
    },
  });

  const boatImage6 = await prisma.fileInstance.create({
    data: {
      filename: 'boat6.jpg',
      originalFilename: 'boat6.jpg',
      path: '/uploads/boats/boat6.jpg',
      url: 'https://example.com/uploads/boats/boat6.jpg',
      fileType: 'image',
      mimeType: 'image/jpeg',
      size: 256000,
    },
  });

  const boatImage7 = await prisma.fileInstance.create({
    data: {
      filename: 'boat7.jpg',
      originalFilename: 'boat7.jpg',
      path: '/uploads/boats/boat7.jpg',
      url: 'https://example.com/uploads/boats/boat7.jpg',
      fileType: 'image',
      mimeType: 'image/jpeg',
      size: 266240,
    },
  });

  const boatImage8 = await prisma.fileInstance.create({
    data: {
      filename: 'boat8.jpg',
      originalFilename: 'boat8.jpg',
      path: '/uploads/boats/boat8.jpg',
      url: 'https://example.com/uploads/boats/boat8.jpg',
      fileType: 'image',
      mimeType: 'image/jpeg',
      size: 276480,
    },
  });

  // More blog images
  const blogImage2 = await prisma.fileInstance.create({
    data: {
      filename: 'blog2.jpg',
      originalFilename: 'blog2.jpg',
      path: '/uploads/blogs/blog2.jpg',
      url: 'https://example.com/uploads/blogs/blog2.jpg',
      fileType: 'image',
      mimeType: 'image/jpeg',
      size: 163840,
    },
  });

  const blogImage3 = await prisma.fileInstance.create({
    data: {
      filename: 'blog3.jpg',
      originalFilename: 'blog3.jpg',
      path: '/uploads/blogs/blog3.jpg',
      url: 'https://example.com/uploads/blogs/blog3.jpg',
      fileType: 'image',
      mimeType: 'image/jpeg',
      size: 174080,
    },
  });

  // More brand logos
  const brandLogo2 = await prisma.fileInstance.create({
    data: {
      filename: 'brand-logo-2.png',
      originalFilename: 'brand-logo-2.png',
      path: '/uploads/brands/brand-logo-2.png',
      url: 'https://example.com/uploads/brands/brand-logo-2.png',
      fileType: 'image',
      mimeType: 'image/png',
      size: 61440,
    },
  });

  const brandLogo3 = await prisma.fileInstance.create({
    data: {
      filename: 'brand-logo-3.png',
      originalFilename: 'brand-logo-3.png',
      path: '/uploads/brands/brand-logo-3.png',
      url: 'https://example.com/uploads/brands/brand-logo-3.png',
      fileType: 'image',
      mimeType: 'image/png',
      size: 71680,
    },
  });

  // 7. Create Boat Specifications
  console.log('🚤 Creating boat specifications...');
  await prisma.boatSpecification.createMany({
    data: [
      { type: 'MAKE', name: 'Sea Ray', source: 'SYSTEM' },
      { type: 'MAKE', name: 'Boston Whaler', source: 'SYSTEM' },
      { type: 'MAKE', name: 'Yamaha', source: 'SYSTEM' },
      { type: 'MODEL', name: 'Sundancer 320', source: 'SYSTEM' },
      { type: 'MODEL', name: 'Outrage 250', source: 'SYSTEM' },
      { type: 'FUEL_TYPE', name: 'Gasoline', source: 'SYSTEM' },
      { type: 'FUEL_TYPE', name: 'Diesel', source: 'SYSTEM' },
      { type: 'CLASS', name: 'Sport Boat', source: 'SYSTEM' },
      { type: 'CLASS', name: 'Fishing Boat', source: 'SYSTEM' },
      { type: 'CLASS', name: 'Yacht', source: 'SYSTEM' },
      { type: 'MATERIAL', name: 'Fiberglass', source: 'SYSTEM' },
      { type: 'MATERIAL', name: 'Aluminum', source: 'SYSTEM' },
      { type: 'CONDITION', name: 'New', source: 'SYSTEM' },
      { type: 'CONDITION', name: 'Used', source: 'SYSTEM' },
      { type: 'CONDITION', name: 'Excellent', source: 'SYSTEM' },
      { type: 'ENGINE_TYPE', name: 'Inboard', source: 'SYSTEM' },
      { type: 'ENGINE_TYPE', name: 'Outboard', source: 'SYSTEM' },
      { type: 'PROP_TYPE', name: 'Single', source: 'SYSTEM' },
      { type: 'PROP_TYPE', name: 'Dual', source: 'SYSTEM' },
      { type: 'PROP_MATERIAL', name: 'Stainless Steel', source: 'SYSTEM' },
      { type: 'PROP_MATERIAL', name: 'Aluminum', source: 'SYSTEM' },
      // More makes
      { type: 'MAKE', name: 'Regal', source: 'SYSTEM' },
      { type: 'MAKE', name: 'Formula', source: 'SYSTEM' },
      { type: 'MAKE', name: 'Cobalt', source: 'SYSTEM' },
      { type: 'MAKE', name: 'Grady-White', source: 'SYSTEM' },
      { type: 'MAKE', name: 'Robalo', source: 'SYSTEM' },
      { type: 'MAKE', name: 'Scout', source: 'SYSTEM' },
      { type: 'MAKE', name: 'Pursuit', source: 'SYSTEM' },
      { type: 'MAKE', name: 'Tiara', source: 'SYSTEM' },
      // More models
      { type: 'MODEL', name: '350 Express', source: 'SYSTEM' },
      { type: 'MODEL', name: '280 Sun Sport', source: 'SYSTEM' },
      { type: 'MODEL', name: 'R5', source: 'SYSTEM' },
      { type: 'MODEL', name: 'Freedom 335', source: 'SYSTEM' },
      { type: 'MODEL', name: '242 CC', source: 'SYSTEM' },
      { type: 'MODEL', name: '330 LXF', source: 'SYSTEM' },
      { type: 'MODEL', name: '2870 CC', source: 'SYSTEM' },
      { type: 'MODEL', name: '3100 Open', source: 'SYSTEM' },
      // More fuel types
      { type: 'FUEL_TYPE', name: 'Electric', source: 'SYSTEM' },
      { type: 'FUEL_TYPE', name: 'Hybrid', source: 'SYSTEM' },
      // More classes
      { type: 'CLASS', name: 'Center Console', source: 'SYSTEM' },
      { type: 'CLASS', name: 'Bowrider', source: 'SYSTEM' },
      { type: 'CLASS', name: 'Cuddy Cabin', source: 'SYSTEM' },
      { type: 'CLASS', name: 'Deck Boat', source: 'SYSTEM' },
      { type: 'CLASS', name: 'Pontoon', source: 'SYSTEM' },
      { type: 'CLASS', name: 'Catamaran', source: 'SYSTEM' },
      // More materials
      { type: 'MATERIAL', name: 'Carbon Fiber', source: 'SYSTEM' },
      { type: 'MATERIAL', name: 'Wood', source: 'SYSTEM' },
      { type: 'MATERIAL', name: 'Steel', source: 'SYSTEM' },
      // More conditions
      { type: 'CONDITION', name: 'Like New', source: 'SYSTEM' },
      { type: 'CONDITION', name: 'Good', source: 'SYSTEM' },
      { type: 'CONDITION', name: 'Fair', source: 'SYSTEM' },
      { type: 'CONDITION', name: 'Needs Work', source: 'SYSTEM' },
      // More engine types
      { type: 'ENGINE_TYPE', name: 'Sterndrive', source: 'SYSTEM' },
      { type: 'ENGINE_TYPE', name: 'Jet Drive', source: 'SYSTEM' },
      { type: 'ENGINE_TYPE', name: 'Electric', source: 'SYSTEM' },
    ],
  });

  // 8. Create Boat Features
  console.log('⚙️ Creating boat features...');
  await prisma.boatFeature.createMany({
    data: [
      { type: 'ELECTRONICS', name: 'GPS Navigation', source: 'SYSTEM' },
      { type: 'ELECTRONICS', name: 'Fish Finder', source: 'SYSTEM' },
      { type: 'ELECTRONICS', name: 'Radar', source: 'SYSTEM' },
      { type: 'ELECTRONICS', name: 'VHF Radio', source: 'SYSTEM' },
      { type: 'INSIDE_EQUIPMENT', name: 'Air Conditioning', source: 'SYSTEM' },
      { type: 'INSIDE_EQUIPMENT', name: 'Refrigerator', source: 'SYSTEM' },
      { type: 'INSIDE_EQUIPMENT', name: 'Microwave', source: 'SYSTEM' },
      { type: 'OUTSIDE_EQUIPMENT', name: 'Bimini Top', source: 'SYSTEM' },
      { type: 'OUTSIDE_EQUIPMENT', name: 'Swim Platform', source: 'SYSTEM' },
      { type: 'OUTSIDE_EQUIPMENT', name: 'Anchor', source: 'SYSTEM' },
      {
        type: 'ELECTRICAL_EQUIPMENT',
        name: 'Battery Charger',
        source: 'SYSTEM',
      },
      { type: 'ELECTRICAL_EQUIPMENT', name: 'Inverter', source: 'SYSTEM' },
      { type: 'COVERS', name: 'Boat Cover', source: 'SYSTEM' },
      { type: 'COVERS', name: 'Cockpit Cover', source: 'SYSTEM' },
      { type: 'ADDITIONAL_EQUIPMENT', name: 'Life Jackets', source: 'SYSTEM' },
      {
        type: 'ADDITIONAL_EQUIPMENT',
        name: 'Fire Extinguisher',
        source: 'SYSTEM',
      },
      // More electronics
      { type: 'ELECTRONICS', name: 'Chartplotter', source: 'SYSTEM' },
      { type: 'ELECTRONICS', name: 'Autopilot', source: 'SYSTEM' },
      { type: 'ELECTRONICS', name: 'AIS Transponder', source: 'SYSTEM' },
      { type: 'ELECTRONICS', name: 'Sounder', source: 'SYSTEM' },
      { type: 'ELECTRONICS', name: 'Satellite Phone', source: 'SYSTEM' },
      { type: 'ELECTRONICS', name: 'WiFi Extender', source: 'SYSTEM' },
      // More inside equipment
      { type: 'INSIDE_EQUIPMENT', name: 'Stove', source: 'SYSTEM' },
      { type: 'INSIDE_EQUIPMENT', name: 'Oven', source: 'SYSTEM' },
      { type: 'INSIDE_EQUIPMENT', name: 'Dishwasher', source: 'SYSTEM' },
      { type: 'INSIDE_EQUIPMENT', name: 'Washer/Dryer', source: 'SYSTEM' },
      { type: 'INSIDE_EQUIPMENT', name: 'TV', source: 'SYSTEM' },
      { type: 'INSIDE_EQUIPMENT', name: 'Stereo System', source: 'SYSTEM' },
      // More outside equipment
      { type: 'OUTSIDE_EQUIPMENT', name: 'Tuna Tower', source: 'SYSTEM' },
      { type: 'OUTSIDE_EQUIPMENT', name: 'Outriggers', source: 'SYSTEM' },
      { type: 'OUTSIDE_EQUIPMENT', name: 'Rod Holders', source: 'SYSTEM' },
      { type: 'OUTSIDE_EQUIPMENT', name: 'Fish Box', source: 'SYSTEM' },
      { type: 'OUTSIDE_EQUIPMENT', name: 'Livewell', source: 'SYSTEM' },
      { type: 'OUTSIDE_EQUIPMENT', name: 'Trolling Motor', source: 'SYSTEM' },
      // More electrical equipment
      { type: 'ELECTRICAL_EQUIPMENT', name: 'Generator', source: 'SYSTEM' },
      { type: 'ELECTRICAL_EQUIPMENT', name: 'Solar Panels', source: 'SYSTEM' },
      {
        type: 'ELECTRICAL_EQUIPMENT',
        name: 'Wind Generator',
        source: 'SYSTEM',
      },
      {
        type: 'ELECTRICAL_EQUIPMENT',
        name: 'Battery Monitor',
        source: 'SYSTEM',
      },
      // More covers
      { type: 'COVERS', name: 'Full Cover', source: 'SYSTEM' },
      { type: 'COVERS', name: 'Tonneau Cover', source: 'SYSTEM' },
      { type: 'COVERS', name: 'Canvas Enclosure', source: 'SYSTEM' },
      // More additional equipment
      { type: 'ADDITIONAL_EQUIPMENT', name: 'Dock Lines', source: 'SYSTEM' },
      { type: 'ADDITIONAL_EQUIPMENT', name: 'Fenders', source: 'SYSTEM' },
      { type: 'ADDITIONAL_EQUIPMENT', name: 'First Aid Kit', source: 'SYSTEM' },
      { type: 'ADDITIONAL_EQUIPMENT', name: 'EPIRB', source: 'SYSTEM' },
      { type: 'ADDITIONAL_EQUIPMENT', name: 'Flares', source: 'SYSTEM' },
    ],
  });

  // 9. Create Boats
  console.log('⛵ Creating boats...');
  const boat1 = await prisma.boats.create({
    data: {
      listingId: 'BOAT-' + Date.now(),
      userId: sellerUser1.id,
      name: 'Sea Ray Sundancer 320',
      price: 125000,
      buildYear: 2020,
      description:
        'Beautiful Sea Ray Sundancer in excellent condition. Well maintained and ready for the water.',
      make: 'Sea Ray',
      model: 'Sundancer 320',
      fuelType: 'Gasoline',
      class: 'Sport Boat',
      material: 'Fiberglass',
      condition: 'Excellent',
      engineType: 'Inboard',
      propType: 'Dual',
      propMaterial: 'Stainless Steel',
      electronics: ['GPS Navigation', 'Fish Finder', 'VHF Radio'],
      insideEquipment: ['Air Conditioning', 'Refrigerator'],
      outsideEquipment: ['Bimini Top', 'Swim Platform', 'Anchor'],
      electricalEquipment: ['Battery Charger'],
      covers: ['Boat Cover'],
      additionalEquipment: ['Life Jackets', 'Fire Extinguisher'],
      length: 32.5,
      beam: 11.5,
      draft: 3.2,
      enginesNumber: 2,
      cabinsNumber: 1,
      headsNumber: 1,
      city: 'Miami',
      state: 'Florida',
      zip: '33101',
      status: 'ACTIVE',
      videoURL: 'https://example.com/videos/boat1.mp4',
      extraDetails: [
        { key: 'Hull Material', value: 'Fiberglass' },
        { key: 'Max Speed', value: '45 mph' },
      ],
    },
  });

  const boat2 = await prisma.boats.create({
    data: {
      listingId: 'BOAT-' + (Date.now() + 1),
      userId: sellerUser2.id,
      name: 'Boston Whaler Outrage 250',
      price: 85000,
      buildYear: 2019,
      description:
        'Perfect fishing boat with all the amenities. Great for offshore fishing.',
      make: 'Boston Whaler',
      model: 'Outrage 250',
      fuelType: 'Gasoline',
      class: 'Fishing Boat',
      material: 'Fiberglass',
      condition: 'Used',
      engineType: 'Outboard',
      propType: 'Dual',
      propMaterial: 'Stainless Steel',
      electronics: ['GPS Navigation', 'Fish Finder', 'Radar'],
      insideEquipment: ['Refrigerator'],
      outsideEquipment: ['Bimini Top', 'Anchor'],
      electricalEquipment: ['Battery Charger'],
      covers: ['Boat Cover', 'Cockpit Cover'],
      additionalEquipment: ['Life Jackets', 'Fire Extinguisher'],
      length: 25.0,
      beam: 9.5,
      draft: 1.8,
      enginesNumber: 2,
      cabinsNumber: 0,
      headsNumber: 0,
      city: 'Tampa',
      state: 'Florida',
      zip: '33601',
      status: 'ACTIVE',
    },
  });

  const boat3 = await prisma.boats.create({
    data: {
      listingId: 'BOAT-' + (Date.now() + 2),
      userId: sellerUser3.id,
      name: 'Regal 350 Express',
      price: 285000,
      buildYear: 2021,
      description:
        'Luxury express cruiser with spacious interior and top-of-the-line amenities. Perfect for weekend getaways.',
      make: 'Regal',
      model: '350 Express',
      fuelType: 'Gasoline',
      class: 'Yacht',
      material: 'Fiberglass',
      condition: 'Excellent',
      engineType: 'Sterndrive',
      propType: 'Dual',
      propMaterial: 'Stainless Steel',
      electronics: [
        'GPS Navigation',
        'Chartplotter',
        'Radar',
        'Autopilot',
        'VHF Radio',
      ],
      insideEquipment: [
        'Air Conditioning',
        'Refrigerator',
        'Microwave',
        'Stove',
        'TV',
        'Stereo System',
      ],
      outsideEquipment: ['Bimini Top', 'Swim Platform', 'Anchor'],
      electricalEquipment: ['Battery Charger', 'Generator', 'Inverter'],
      covers: ['Boat Cover', 'Full Cover'],
      additionalEquipment: [
        'Life Jackets',
        'Fire Extinguisher',
        'First Aid Kit',
      ],
      length: 35.0,
      beam: 12.0,
      draft: 3.5,
      enginesNumber: 2,
      cabinsNumber: 2,
      headsNumber: 2,
      city: 'Orlando',
      state: 'Florida',
      zip: '32801',
      status: 'ACTIVE',
      videoURL: 'https://example.com/videos/boat3.mp4',
      extraDetails: [
        { key: 'Max Speed', value: '52 mph' },
        { key: 'Fuel Capacity', value: '150 gallons' },
        { key: 'Water Capacity', value: '40 gallons' },
      ],
    },
  });

  const boat4 = await prisma.boats.create({
    data: {
      listingId: 'BOAT-' + (Date.now() + 3),
      userId: sellerUser4.id,
      name: 'Grady-White Freedom 335',
      price: 195000,
      buildYear: 2022,
      description:
        'Premium center console fishing machine. Built for serious anglers who demand the best.',
      make: 'Grady-White',
      model: 'Freedom 335',
      fuelType: 'Gasoline',
      class: 'Center Console',
      material: 'Fiberglass',
      condition: 'New',
      engineType: 'Outboard',
      propType: 'Dual',
      propMaterial: 'Stainless Steel',
      electronics: [
        'GPS Navigation',
        'Fish Finder',
        'Chartplotter',
        'Radar',
        'VHF Radio',
        'AIS Transponder',
      ],
      insideEquipment: ['Refrigerator', 'Microwave'],
      outsideEquipment: [
        'Tuna Tower',
        'Outriggers',
        'Rod Holders',
        'Fish Box',
        'Livewell',
        'Bimini Top',
      ],
      electricalEquipment: ['Battery Charger', 'Generator'],
      covers: ['Boat Cover', 'Cockpit Cover'],
      additionalEquipment: [
        'Life Jackets',
        'Fire Extinguisher',
        'EPIRB',
        'Flares',
      ],
      length: 33.5,
      beam: 11.0,
      draft: 2.2,
      enginesNumber: 2,
      cabinsNumber: 1,
      headsNumber: 1,
      city: 'Fort Lauderdale',
      state: 'Florida',
      zip: '33301',
      status: 'ACTIVE',
      videoURL: 'https://example.com/videos/boat4.mp4',
    },
  });

  const boat5 = await prisma.boats.create({
    data: {
      listingId: 'BOAT-' + (Date.now() + 4),
      userId: sellerUser5.id,
      name: 'Formula 280 Sun Sport',
      price: 165000,
      buildYear: 2020,
      description:
        'Sporty and stylish bowrider perfect for family fun and entertaining. Excellent condition.',
      make: 'Formula',
      model: '280 Sun Sport',
      fuelType: 'Gasoline',
      class: 'Bowrider',
      material: 'Fiberglass',
      condition: 'Excellent',
      engineType: 'Sterndrive',
      propType: 'Dual',
      propMaterial: 'Stainless Steel',
      electronics: ['GPS Navigation', 'Fish Finder', 'VHF Radio'],
      insideEquipment: ['Refrigerator', 'Stereo System'],
      outsideEquipment: ['Bimini Top', 'Swim Platform', 'Anchor'],
      electricalEquipment: ['Battery Charger'],
      covers: ['Boat Cover'],
      additionalEquipment: [
        'Life Jackets',
        'Fire Extinguisher',
        'Dock Lines',
        'Fenders',
      ],
      length: 28.0,
      beam: 8.5,
      draft: 2.0,
      enginesNumber: 1,
      cabinsNumber: 0,
      headsNumber: 1,
      city: 'Key West',
      state: 'Florida',
      zip: '33040',
      status: 'ACTIVE',
    },
  });

  const boat6 = await prisma.boats.create({
    data: {
      listingId: 'BOAT-' + (Date.now() + 5),
      userId: sellerUser6.id,
      name: 'Cobalt R5',
      price: 145000,
      buildYear: 2021,
      description:
        'Premium bowrider with luxurious appointments. Perfect for day cruising and water sports.',
      make: 'Cobalt',
      model: 'R5',
      fuelType: 'Gasoline',
      class: 'Bowrider',
      material: 'Fiberglass',
      condition: 'Like New',
      engineType: 'Sterndrive',
      propType: 'Single',
      propMaterial: 'Stainless Steel',
      electronics: ['GPS Navigation', 'Fish Finder', 'VHF Radio'],
      insideEquipment: ['Refrigerator', 'Stereo System'],
      outsideEquipment: ['Bimini Top', 'Swim Platform'],
      electricalEquipment: ['Battery Charger'],
      covers: ['Boat Cover', 'Tonneau Cover'],
      additionalEquipment: ['Life Jackets', 'Fire Extinguisher'],
      length: 26.5,
      beam: 8.0,
      draft: 1.5,
      enginesNumber: 1,
      cabinsNumber: 0,
      headsNumber: 1,
      city: 'Naples',
      state: 'Florida',
      zip: '34101',
      status: 'ACTIVE',
    },
  });

  const boat7 = await prisma.boats.create({
    data: {
      listingId: 'BOAT-' + (Date.now() + 6),
      userId: sellerUser3.id,
      name: 'Robalo 242 CC',
      price: 95000,
      buildYear: 2023,
      description:
        'Brand new center console fishing boat. Perfect for inshore and nearshore fishing.',
      make: 'Robalo',
      model: '242 CC',
      fuelType: 'Gasoline',
      class: 'Center Console',
      material: 'Fiberglass',
      condition: 'New',
      engineType: 'Outboard',
      propType: 'Single',
      propMaterial: 'Stainless Steel',
      electronics: ['GPS Navigation', 'Fish Finder', 'VHF Radio'],
      insideEquipment: ['Refrigerator'],
      outsideEquipment: ['Rod Holders', 'Fish Box', 'Livewell', 'Bimini Top'],
      electricalEquipment: ['Battery Charger'],
      covers: ['Boat Cover'],
      additionalEquipment: ['Life Jackets', 'Fire Extinguisher'],
      length: 24.2,
      beam: 8.5,
      draft: 1.3,
      enginesNumber: 1,
      cabinsNumber: 0,
      headsNumber: 0,
      city: 'Orlando',
      state: 'Florida',
      zip: '32801',
      status: 'ACTIVE',
    },
  });

  const boat8 = await prisma.boats.create({
    data: {
      listingId: 'BOAT-' + (Date.now() + 7),
      userId: sellerUser4.id,
      name: 'Scout 330 LXF',
      price: 175000,
      buildYear: 2022,
      description:
        'Luxury center console with premium features. Ideal for serious fishing and entertaining.',
      make: 'Scout',
      model: '330 LXF',
      fuelType: 'Gasoline',
      class: 'Center Console',
      material: 'Fiberglass',
      condition: 'Excellent',
      engineType: 'Outboard',
      propType: 'Dual',
      propMaterial: 'Stainless Steel',
      electronics: [
        'GPS Navigation',
        'Chartplotter',
        'Fish Finder',
        'Radar',
        'VHF Radio',
      ],
      insideEquipment: ['Refrigerator', 'Microwave', 'Air Conditioning'],
      outsideEquipment: [
        'Tuna Tower',
        'Outriggers',
        'Rod Holders',
        'Fish Box',
        'Livewell',
        'Bimini Top',
      ],
      electricalEquipment: ['Battery Charger', 'Generator'],
      covers: ['Boat Cover', 'Cockpit Cover'],
      additionalEquipment: ['Life Jackets', 'Fire Extinguisher', 'EPIRB'],
      length: 33.0,
      beam: 10.5,
      draft: 2.0,
      enginesNumber: 2,
      cabinsNumber: 1,
      headsNumber: 1,
      city: 'Fort Lauderdale',
      state: 'Florida',
      zip: '33301',
      status: 'ACTIVE',
      videoURL: 'https://example.com/videos/boat8.mp4',
    },
  });

  // 10. Create Boat Engines
  console.log('🔧 Creating boat engines...');
  await prisma.boatEngine.createMany({
    data: [
      {
        boatId: boat1.id,
        hours: 250,
        horsepower: 350,
        make: 'Mercury',
        model: '8.2L',
        fuelType: 'Gasoline',
        propellerType: 'Dual',
      },
      {
        boatId: boat1.id,
        hours: 250,
        horsepower: 350,
        make: 'Mercury',
        model: '8.2L',
        fuelType: 'Gasoline',
        propellerType: 'Dual',
      },
      {
        boatId: boat2.id,
        hours: 180,
        horsepower: 200,
        make: 'Yamaha',
        model: 'F200',
        fuelType: 'Gasoline',
        propellerType: 'Dual',
      },
      {
        boatId: boat2.id,
        hours: 180,
        horsepower: 200,
        make: 'Yamaha',
        model: 'F200',
        fuelType: 'Gasoline',
        propellerType: 'Dual',
      },
      {
        boatId: boat3.id,
        hours: 120,
        horsepower: 380,
        make: 'Volvo Penta',
        model: 'V8-380',
        fuelType: 'Gasoline',
        propellerType: 'Dual',
      },
      {
        boatId: boat3.id,
        hours: 120,
        horsepower: 380,
        make: 'Volvo Penta',
        model: 'V8-380',
        fuelType: 'Gasoline',
        propellerType: 'Dual',
      },
      {
        boatId: boat4.id,
        hours: 50,
        horsepower: 300,
        make: 'Yamaha',
        model: 'F300',
        fuelType: 'Gasoline',
        propellerType: 'Dual',
      },
      {
        boatId: boat4.id,
        hours: 50,
        horsepower: 300,
        make: 'Yamaha',
        model: 'F300',
        fuelType: 'Gasoline',
        propellerType: 'Dual',
      },
      {
        boatId: boat5.id,
        hours: 200,
        horsepower: 350,
        make: 'Mercury',
        model: '8.2L',
        fuelType: 'Gasoline',
        propellerType: 'Dual',
      },
      {
        boatId: boat6.id,
        hours: 100,
        horsepower: 300,
        make: 'Mercury',
        model: '6.2L',
        fuelType: 'Gasoline',
        propellerType: 'Single',
      },
      {
        boatId: boat7.id,
        hours: 10,
        horsepower: 200,
        make: 'Yamaha',
        model: 'F200',
        fuelType: 'Gasoline',
        propellerType: 'Single',
      },
      {
        boatId: boat8.id,
        hours: 75,
        horsepower: 300,
        make: 'Yamaha',
        model: 'F300',
        fuelType: 'Gasoline',
        propellerType: 'Dual',
      },
      {
        boatId: boat8.id,
        hours: 75,
        horsepower: 300,
        make: 'Yamaha',
        model: 'F300',
        fuelType: 'Gasoline',
        propellerType: 'Dual',
      },
    ],
  });

  // 11. Create Boat Images
  console.log('📸 Creating boat images...');
  await prisma.boatImage.createMany({
    data: [
      {
        boatId: boat1.id,
        fileId: boatImage1.id,
        imageType: 'COVER',
      },
      {
        boatId: boat1.id,
        fileId: boatImage2.id,
        imageType: 'GALLERY',
      },
      {
        boatId: boat2.id,
        fileId: boatImage1.id,
        imageType: 'COVER',
      },
      {
        boatId: boat2.id,
        fileId: boatImage2.id,
        imageType: 'GALLERY',
      },
      {
        boatId: boat3.id,
        fileId: boatImage3.id,
        imageType: 'COVER',
      },
      {
        boatId: boat3.id,
        fileId: boatImage4.id,
        imageType: 'GALLERY',
      },
      {
        boatId: boat4.id,
        fileId: boatImage5.id,
        imageType: 'COVER',
      },
      {
        boatId: boat4.id,
        fileId: boatImage6.id,
        imageType: 'GALLERY',
      },
      {
        boatId: boat5.id,
        fileId: boatImage7.id,
        imageType: 'COVER',
      },
      {
        boatId: boat5.id,
        fileId: boatImage8.id,
        imageType: 'GALLERY',
      },
      {
        boatId: boat6.id,
        fileId: boatImage1.id,
        imageType: 'COVER',
      },
      {
        boatId: boat6.id,
        fileId: boatImage2.id,
        imageType: 'GALLERY',
      },
      {
        boatId: boat7.id,
        fileId: boatImage3.id,
        imageType: 'COVER',
      },
      {
        boatId: boat8.id,
        fileId: boatImage4.id,
        imageType: 'COVER',
      },
      {
        boatId: boat8.id,
        fileId: boatImage5.id,
        imageType: 'GALLERY',
      },
    ],
  });

  // 12. Create Contacts
  console.log('📧 Creating contacts...');
  const contact1 = await prisma.contact.create({
    data: {
      name: 'John Buyer',
      email: 'buyer1@example.com',
      phone: '+1555123456',
      message:
        'I am interested in the Sea Ray Sundancer. Can I schedule a viewing?',
      source: 'FLORIDA',
      type: 'INDIVIDUAL_LISTING',
      listingId: boat1.listingId,
      listingSource: 'FLORIDA',
    },
  });

  const contact2 = await prisma.contact.create({
    data: {
      name: 'Jane Buyer',
      email: 'buyer2@example.com',
      phone: '+1555987654',
      message: 'General inquiry about your boat listings.',
      source: 'JUPITER',
      type: 'GLOBAL',
    },
  });

  const contact3 = await prisma.contact.create({
    data: {
      name: 'Robert Smith',
      email: 'robert@example.com',
      phone: '+1555111111',
      message:
        'Interested in the Regal 350 Express. Can we schedule a sea trial?',
      source: 'FLORIDA',
      type: 'INDIVIDUAL_LISTING',
      listingId: boat3.listingId,
      listingSource: 'FLORIDA',
    },
  });

  const contact4 = await prisma.contact.create({
    data: {
      name: 'Emily Davis',
      email: 'emily@example.com',
      phone: '+1555222222',
      message: 'Looking for a fishing boat. The Grady-White looks perfect!',
      source: 'FLORIDA',
      type: 'INDIVIDUAL_LISTING',
      listingId: boat4.listingId,
      listingSource: 'FLORIDA',
    },
  });

  const contact5 = await prisma.contact.create({
    data: {
      name: 'Michael Wilson',
      email: 'michael@example.com',
      phone: '+1555333333',
      message: 'Interested in multiple boats. Please contact me.',
      source: 'JUPITER',
      type: 'GLOBAL',
    },
  });

  const contact6 = await prisma.contact.create({
    data: {
      name: 'Jessica Martinez',
      email: 'jessica@example.com',
      phone: '+1555444444',
      message: 'Love the Formula 280! Is it still available?',
      source: 'FLORIDA',
      type: 'INDIVIDUAL_LISTING',
      listingId: boat5.listingId,
      listingSource: 'FLORIDA',
    },
  });

  // 13. Create Florida Leads
  console.log('🎣 Creating Florida leads...');
  await prisma.floridaLead.createMany({
    data: [
      {
        contactId: contact1.id,
        boatId: boat1.id,
      },
      {
        contactId: contact3.id,
        boatId: boat3.id,
      },
      {
        contactId: contact4.id,
        boatId: boat4.id,
      },
      {
        contactId: contact6.id,
        boatId: boat5.id,
      },
    ],
  });

  // 14. Create Blogs
  console.log('📝 Creating blogs...');
  await prisma.blog.create({
    data: {
      blogImageId: blogImage.id,
      blogTitle: 'Top 10 Boat Maintenance Tips',
      blogDescription:
        'Learn the essential maintenance tips to keep your boat in perfect condition.',
      sharedLink: 'top-10-boat-maintenance-tips',
      readTime: 5,
      postStatus: 'PUBLISHED',
    },
  });

  await prisma.blog.create({
    data: {
      blogImageId: blogImage.id,
      blogTitle: 'Best Fishing Spots in Florida',
      blogDescription: 'Discover the best fishing locations in Florida waters.',
      sharedLink: 'best-fishing-spots-florida',
      readTime: 7,
      postStatus: 'PUBLISHED',
    },
  });

  await prisma.blog.create({
    data: {
      blogImageId: blogImage2.id,
      blogTitle: 'How to Choose the Right Boat for Your Needs',
      blogDescription:
        'A comprehensive guide to help you select the perfect boat based on your lifestyle and preferences.',
      sharedLink: 'how-to-choose-right-boat',
      readTime: 8,
      postStatus: 'PUBLISHED',
    },
  });

  await prisma.blog.create({
    data: {
      blogImageId: blogImage3.id,
      blogTitle: 'Boat Safety Essentials Every Owner Should Know',
      blogDescription:
        'Learn about essential safety equipment and practices for boat owners.',
      sharedLink: 'boat-safety-essentials',
      readTime: 6,
      postStatus: 'PUBLISHED',
    },
  });

  await prisma.blog.create({
    data: {
      blogImageId: blogImage.id,
      blogTitle: 'Top 5 Luxury Yachts Under $500K',
      blogDescription:
        'Explore our selection of luxury yachts that offer premium features without breaking the bank.',
      sharedLink: 'luxury-yachts-under-500k',
      readTime: 10,
      postStatus: 'PUBLISHED',
    },
  });

  await prisma.blog.create({
    data: {
      blogImageId: blogImage2.id,
      blogTitle: 'Understanding Boat Financing Options',
      blogDescription:
        'Everything you need to know about financing your dream boat purchase.',
      sharedLink: 'boat-financing-options',
      readTime: 9,
      postStatus: 'DRAFT',
    },
  });

  // 15. Create Notifications
  console.log('🔔 Creating notifications...');
  const notification1 = await prisma.notification.create({
    data: {
      type: 'SYSTEM',
      title: 'Welcome to Diaz!',
      message: 'Thank you for joining our platform.',
      meta: { category: 'welcome', priority: 'low' },
    },
  });

  const notification2 = await prisma.notification.create({
    data: {
      type: 'BOAT',
      title: 'New Lead Received',
      message: 'You have received a new lead for your boat listing.',
      meta: { boatId: boat1.id, contactId: contact1.id },
    },
  });

  const notification3 = await prisma.notification.create({
    data: {
      type: 'BOAT',
      title: 'New Lead Received',
      message: 'You have received a new lead for your Regal 350 Express.',
      meta: { boatId: boat3.id, contactId: contact3.id },
    },
  });

  const notification4 = await prisma.notification.create({
    data: {
      type: 'BOAT',
      title: 'New Lead Received',
      message: 'You have received a new lead for your Grady-White Freedom 335.',
      meta: { boatId: boat4.id, contactId: contact4.id },
    },
  });

  const notification5 = await prisma.notification.create({
    data: {
      type: 'SUBSCRIPTION',
      title: 'Subscription Renewal Reminder',
      message: 'Your subscription will renew in 7 days.',
      meta: {
        planType: 'PLATINUM',
        renewalDate: new Date(
          Date.now() + 7 * 24 * 60 * 60 * 1000,
        ).toISOString(),
      },
    },
  });

  const notification6 = await prisma.notification.create({
    data: {
      type: 'SYSTEM',
      title: 'New Features Available',
      message: 'Check out our latest platform updates and new features.',
      meta: { category: 'update', priority: 'medium' },
    },
  });

  // 16. Create User Notifications
  console.log('👤 Creating user notifications...');
  await prisma.userNotification.createMany({
    data: [
      {
        userId: sellerUser1.id,
        notificationId: notification1.id,
        read: false,
      },
      {
        userId: sellerUser1.id,
        notificationId: notification2.id,
        read: false,
      },
      {
        userId: sellerUser2.id,
        notificationId: notification1.id,
        read: true,
      },
      {
        userId: sellerUser3.id,
        notificationId: notification1.id,
        read: false,
      },
      {
        userId: sellerUser3.id,
        notificationId: notification3.id,
        read: false,
      },
      {
        userId: sellerUser4.id,
        notificationId: notification1.id,
        read: false,
      },
      {
        userId: sellerUser4.id,
        notificationId: notification4.id,
        read: false,
      },
      {
        userId: sellerUser4.id,
        notificationId: notification5.id,
        read: false,
      },
      {
        userId: sellerUser5.id,
        notificationId: notification1.id,
        read: true,
      },
      {
        userId: sellerUser5.id,
        notificationId: notification6.id,
        read: false,
      },
      {
        userId: sellerUser6.id,
        notificationId: notification1.id,
        read: true,
      },
      {
        userId: adminUser.id,
        notificationId: notification6.id,
        read: false,
      },
    ],
  });

  // 17. Create Settings
  console.log('⚙️ Creating settings...');
  await prisma.setting.create({
    data: {
      siteName: 'Diaz Boats',
      currency: 'USD', // This is now an enum value
      maintenanceMode: false,
      logoId: logoFile.id,
      newListingSubmitted: true,
      newSellerRegistration: true,
    },
  });

  // 18. Create Page Banners
  console.log('🎨 Creating page banners...');
  await prisma.pageBanner.createMany({
    data: [
      {
        page: 'HOME',
        site: 'FLORIDA',
        bannerTitle: 'Welcome to Diaz Boats',
        subtitle: 'Find your perfect boat today',
        backgroundId: bannerImage.id,
      },
      {
        page: 'HOME',
        site: 'JUPITER',
        bannerTitle: 'Welcome to Jupiter Boats',
        subtitle: 'Premium boat listings',
        backgroundId: bannerImage.id,
      },
      {
        page: 'BLOG',
        site: 'FLORIDA',
        bannerTitle: 'Our Blog',
        subtitle: 'Latest news and tips',
        backgroundId: bannerImage.id,
      },
      {
        page: 'CONTACT',
        site: 'FLORIDA',
        bannerTitle: 'Contact Us',
        subtitle: 'Get in touch',
        backgroundId: bannerImage.id,
      },
      {
        page: 'SEARCH',
        site: 'FLORIDA',
        bannerTitle: 'Search Boats',
        subtitle: 'Find your perfect match',
        backgroundId: bannerImage.id,
      },
      {
        page: 'SEARCH',
        site: 'JUPITER',
        bannerTitle: 'Search Boats',
        subtitle: 'Discover amazing deals',
        backgroundId: bannerImage.id,
      },
      {
        page: 'BLOG',
        site: 'JUPITER',
        bannerTitle: 'Our Blog',
        subtitle: 'Latest articles and guides',
        backgroundId: bannerImage.id,
      },
      {
        page: 'CONTACT',
        site: 'JUPITER',
        bannerTitle: 'Contact Us',
        subtitle: 'We are here to help',
        backgroundId: bannerImage.id,
      },
      {
        page: 'PRIVACY_POLICY',
        site: 'FLORIDA',
        bannerTitle: 'Privacy Policy',
        subtitle: 'Your privacy matters',
        backgroundId: bannerImage.id,
      },
      {
        page: 'TERMS_AND_CONDITION',
        site: 'FLORIDA',
        bannerTitle: 'Terms & Conditions',
        subtitle: 'Please read carefully',
        backgroundId: bannerImage.id,
      },
    ],
  });

  // 19. Create Package Banners
  console.log('📦 Creating package banners...');
  await prisma.packageBanner.createMany({
    data: [
      {
        site: 'FLORIDA',
        bannerTitle: 'Choose Your Plan',
        subtitle: 'Select the perfect plan for your needs',
        packageBannerId: bannerImage.id,
      },
      {
        site: 'JUPITER',
        bannerTitle: 'Subscription Plans',
        subtitle: 'Flexible plans for every seller',
        packageBannerId: bannerImage.id,
      },
    ],
  });

  // 20. Create AI Search Banners
  console.log('🤖 Creating AI search banners...');
  await prisma.aiSearchBanner.createMany({
    data: [
      {
        site: 'FLORIDA',
        bannerTitle: 'AI-Powered Boat Search',
        subtitle: 'Find your dream boat with AI',
        aiSearchBannerId: bannerImage.id,
      },
      {
        site: 'JUPITER',
        bannerTitle: 'Smart Boat Discovery',
        subtitle: 'Let AI help you find the perfect boat',
        aiSearchBannerId: bannerImage.id,
      },
    ],
  });

  // 21. Create Featured Brands
  console.log('⭐ Creating featured brands...');
  await prisma.featuredBrands.createMany({
    data: [
      {
        site: 'FLORIDA',
        featuredbrandId: featuredBrandLogo.id,
      },
      {
        site: 'JUPITER',
        featuredbrandId: featuredBrandLogo.id,
      },
      {
        site: 'FLORIDA',
        featuredbrandId: brandLogo2.id,
      },
      {
        site: 'FLORIDA',
        featuredbrandId: brandLogo3.id,
      },
      {
        site: 'JUPITER',
        featuredbrandId: brandLogo2.id,
      },
      {
        site: 'JUPITER',
        featuredbrandId: brandLogo3.id,
      },
    ],
  });

  // 22. Create About Page
  console.log('📄 Creating about page...');
  await prisma.aboutPage.createMany({
    data: [
      {
        site: 'FLORIDA',
        aboutTitle: 'About Diaz Boats',
        aboutDescription:
          'Your trusted partner in boat sales. We connect buyers and sellers of premium boats and yachts.',
        mission:
          'Our mission is to provide the best boat buying and selling experience through our trusted marketplace platform.',
        vision:
          'To become the leading platform for boat sales in Florida and beyond, connecting passionate boaters worldwide.',
      },
      {
        site: 'JUPITER',
        aboutTitle: 'About Jupiter Boats',
        aboutDescription:
          'Your trusted partner in boat sales. We connect buyers and sellers of premium boats and yachts.',
        mission:
          'Our mission is to provide the best boat buying and selling experience through our trusted marketplace platform.',
        vision:
          'To become the leading platform for boat sales in Jupiter and beyond, connecting passionate boaters worldwide.',
      },
    ],
  });

  // 23. Create Contact Page
  console.log('📞 Creating contact page...');
  const contactTopImageFlorida = await prisma.fileInstance.create({
    data: {
      filename: 'contact-top-florida.jpg',
      originalFilename: 'contact-top-florida.jpg',
      path: '/uploads/contact/contact-top-florida.jpg',
      url: 'https://example.com/uploads/contact/contact-top-florida.jpg',
      fileType: 'image',
      mimeType: 'image/jpeg',
      size: 102400,
    },
  });

  const contactBottomImageFlorida = await prisma.fileInstance.create({
    data: {
      filename: 'contact-bottom-florida.jpg',
      originalFilename: 'contact-bottom-florida.jpg',
      path: '/uploads/contact/contact-bottom-florida.jpg',
      url: 'https://example.com/uploads/contact/contact-bottom-florida.jpg',
      fileType: 'image',
      mimeType: 'image/jpeg',
      size: 102400,
    },
  });

  const contactTopImageJupiter = await prisma.fileInstance.create({
    data: {
      filename: 'contact-top-jupiter.jpg',
      originalFilename: 'contact-top-jupiter.jpg',
      path: '/uploads/contact/contact-top-jupiter.jpg',
      url: 'https://example.com/uploads/contact/contact-top-jupiter.jpg',
      fileType: 'image',
      mimeType: 'image/jpeg',
      size: 102400,
    },
  });

  const contactBottomImageJupiter = await prisma.fileInstance.create({
    data: {
      filename: 'contact-bottom-jupiter.jpg',
      originalFilename: 'contact-bottom-jupiter.jpg',
      path: '/uploads/contact/contact-bottom-jupiter.jpg',
      url: 'https://example.com/uploads/contact/contact-bottom-jupiter.jpg',
      fileType: 'image',
      mimeType: 'image/jpeg',
      size: 102400,
    },
  });

  await prisma.contactPage.createMany({
    data: [
      {
        site: 'FLORIDA',
        contactTitle: 'Contact Us',
        contactDescription: 'Get in touch with us for any inquiries.',
        contactTopImageId: contactTopImageFlorida.id,
        contactBottomImageId: contactBottomImageFlorida.id,
      },
      {
        site: 'JUPITER',
        contactTitle: 'Contact Us',
        contactDescription: 'Get in touch with us for any inquiries.',
        contactTopImageId: contactTopImageJupiter.id,
        contactBottomImageId: contactBottomImageJupiter.id,
      },
    ],
  });

  // 24. Create Privacy Policy
  console.log('🔒 Creating privacy policy...');
  await prisma.privacyPolicy.createMany({
    data: [
      {
        site: 'FLORIDA',
        privacyTitle: 'Privacy Policy',
        privacyDescription:
          'At Diaz Boats, we take your privacy seriously. This policy explains how we collect, use, and protect your personal information when you use our platform.',
      },
      {
        site: 'JUPITER',
        privacyTitle: 'Privacy Policy',
        privacyDescription:
          'At Jupiter Boats, we take your privacy seriously. This policy explains how we collect, use, and protect your personal information when you use our platform.',
      },
    ],
  });

  // 25. Create Terms of Services
  console.log('📋 Creating terms of services...');
  await prisma.termsOfServices.createMany({
    data: [
      {
        site: 'FLORIDA',
        termsTitle: 'Terms of Service',
        termsDescription:
          'By using Diaz Boats, you agree to these terms and conditions. Please read them carefully before using our platform.',
      },
      {
        site: 'JUPITER',
        termsTitle: 'Terms of Service',
        termsDescription:
          'By using Jupiter Boats, you agree to these terms and conditions. Please read them carefully before using our platform.',
      },
    ],
  });

  // 26. Create Visitor Sessions (optional sample data)
  console.log('👁️ Creating visitor sessions...');
  await prisma.visitorSession.createMany({
    data: [
      {
        ip: '192.168.1.1',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        startedAt: new Date(),
        endedAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes later
        page: '/boats',
        durationSeconds: 300,
      },
      {
        ip: '192.168.1.2',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        startedAt: new Date(),
        page: '/home',
      },
      {
        ip: '192.168.1.3',
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)',
        startedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        endedAt: new Date(Date.now() - 2 * 60 * 60 * 1000 + 10 * 60 * 1000),
        page: '/boats/premium-deals/florida',
        durationSeconds: 600,
      },
      {
        ip: '192.168.1.4',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        startedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
        endedAt: new Date(Date.now() - 1 * 60 * 60 * 1000 + 15 * 60 * 1000),
        page: '/blog',
        durationSeconds: 900,
      },
      {
        ip: '192.168.1.5',
        userAgent: 'Mozilla/5.0 (X11; Linux x86_64)',
        startedAt: new Date(Date.now() - 30 * 60 * 1000),
        page: '/contact',
      },
      {
        ip: '192.168.1.6',
        userAgent: 'Mozilla/5.0 (iPad; CPU OS 16_0 like Mac OS X)',
        startedAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
        endedAt: new Date(Date.now() - 3 * 60 * 60 * 1000 + 8 * 60 * 1000),
        page: '/boats',
        durationSeconds: 480,
      },
    ],
  });

  // 27. Create Page Views (optional sample data)
  console.log('📊 Creating page views...');
  await prisma.pageView.createMany({
    data: [
      { page: '/home', count: 150 },
      { page: '/boats', count: 89 },
      { page: '/blog', count: 45 },
      { page: '/contact', count: 23 },
      { page: '/boats/premium-deals/florida', count: 67 },
      { page: '/boats/merged/all-sources', count: 34 },
      { page: '/blog/top-10-boat-maintenance-tips', count: 28 },
      { page: '/blog/best-fishing-spots-florida', count: 19 },
      { page: '/blog/how-to-choose-right-boat', count: 15 },
      { page: '/search', count: 112 },
      { page: '/about', count: 8 },
      { page: '/privacy', count: 5 },
      { page: '/terms', count: 4 },
    ],
  });

  // 28. Create Categories
  console.log('🏷️ Creating categories...');
  const category1 = await prisma.category.create({
    data: {
      title: 'Sport Boats',
      imageId: boatImage1.id,
    },
  });

  const category2 = await prisma.category.create({
    data: {
      title: 'Fishing Boats',
      imageId: boatImage2.id,
    },
  });

  const category3 = await prisma.category.create({
    data: {
      title: 'Luxury Yachts',
      imageId: boatImage3.id,
    },
  });

  // 29. Create Our Team Members (per site)
  console.log('👥 Creating team members...');
  await prisma.ourTeam.createMany({
    data: [
      {
        name: 'John Smith',
        designation: 'CEO & Founder',
        imageId: logoFile.id,
        order: 1,
        isActive: true,
        site: 'FLORIDA',
      },
      {
        name: 'Sarah Johnson',
        designation: 'Sales Manager',
        imageId: logoFile.id,
        order: 2,
        isActive: true,
        site: 'FLORIDA',
      },
      {
        name: 'Mike Davis',
        designation: 'Marine Specialist',
        imageId: logoFile.id,
        order: 3,
        isActive: true,
        site: 'FLORIDA',
      },
      {
        name: 'Emily Carter',
        designation: 'Regional Director',
        imageId: logoFile.id,
        order: 1,
        isActive: true,
        site: 'JUPITER',
      },
      {
        name: 'Daniel Roberts',
        designation: 'Senior Broker',
        imageId: logoFile.id,
        order: 2,
        isActive: true,
        site: 'JUPITER',
      },
    ],
  });

  // 30. Create Footer Settings
  console.log('🦶 Creating footer settings...');
  await prisma.footerSettings.createMany({
    data: [
      {
        site: 'FLORIDA',
        companyName: 'Diaz Boats',
        companyDescription:
          'Your trusted partner in finding the perfect boat. We connect buyers and sellers across Florida.',
        quickLinks: [
          { label: 'Home', url: '/' },
          { label: 'Search Boats', url: '/boats' },
          { label: 'About Us', url: '/about' },
          { label: 'Contact', url: '/contact' },
        ],
        policyLinks: [
          { label: 'Privacy Policy', url: '/privacy' },
          { label: 'Terms of Service', url: '/terms' },
        ],
        phone: '+1 (555) 123-4567',
        email: 'info@diazboats.com',
        socialMediaLinks: [
          {
            platform: 'Facebook',
            url: 'https://facebook.com',
            icon: 'facebook',
          },
          {
            platform: 'Instagram',
            url: 'https://instagram.com',
            icon: 'instagram',
          },
          { platform: 'Twitter', url: 'https://twitter.com', icon: 'twitter' },
        ],
        copyrightText: '© Copyright 2025 by Diaz Boats. All rights reserved.',
      },
      {
        site: 'JUPITER',
        companyName: 'Jupiter Marine Sales',
        companyDescription:
          'Your trusted partner in finding the perfect boat. We connect buyers and sellers across Jupiter.',
        quickLinks: [
          { label: 'Home', url: '/' },
          { label: 'Search Boats', url: '/boats' },
          { label: 'About Us', url: '/about' },
          { label: 'Contact', url: '/contact' },
        ],
        policyLinks: [
          { label: 'Privacy Policy', url: '/privacy' },
          { label: 'Terms of Service', url: '/terms' },
        ],
        phone: '+1 (555) 987-6543',
        email: 'info@jupitermarinesales.com',
        socialMediaLinks: [
          {
            platform: 'Facebook',
            url: 'https://facebook.com',
            icon: 'facebook',
          },
          {
            platform: 'Instagram',
            url: 'https://instagram.com',
            icon: 'instagram',
          },
          { platform: 'Twitter', url: 'https://twitter.com', icon: 'twitter' },
        ],
        copyrightText:
          '© Copyright 2025 by Jupiter Marine Sales. All rights reserved.',
      },
    ],
  });

  // 31. Create Email Subscriptions (sample data)
  console.log('📧 Creating email subscriptions...');
  await prisma.emailSubscription.createMany({
    data: [
      {
        email: 'subscriber1@example.com',
        site: 'FLORIDA',
        isActive: true,
      },
      {
        email: 'subscriber2@example.com',
        site: 'FLORIDA',
        isActive: true,
      },
      {
        email: 'subscriber3@example.com',
        site: 'JUPITER',
        isActive: true,
      },
    ],
  });

  // 32. Create FAQs
  console.log('❓ Creating FAQs...');
  await prisma.fAQ.createMany({
    data: [
      {
        site: 'FLORIDA',
        title: 'Frequently Asked Questions',
        subtitle:
          'Find answers to common questions about buying and selling boats',
        questions: [
          {
            question: 'How do I list my boat for sale?',
            answer:
              'Simply create a seller account, choose a subscription plan, and submit your boat listing with photos and details.',
          },
          {
            question: 'What payment methods do you accept?',
            answer:
              'We accept all major credit cards through our secure Stripe payment gateway.',
          },
          {
            question: 'How long does it take to get approved?',
            answer:
              'Most listings are reviewed and approved within 24-48 hours.',
          },
        ],
      },
      {
        site: 'JUPITER',
        title: 'Frequently Asked Questions',
        subtitle:
          'Find answers to common questions about buying and selling boats',
        questions: [
          {
            question: 'How do I list my boat for sale?',
            answer:
              'Simply create a seller account, choose a subscription plan, and submit your boat listing with photos and details.',
          },
          {
            question: 'What payment methods do you accept?',
            answer:
              'We accept all major credit cards through our secure Stripe payment gateway.',
          },
          {
            question: 'How long does it take to get approved?',
            answer:
              'Most listings are reviewed and approved within 24-48 hours.',
          },
        ],
      },
    ],
  });

  // 33. Create Why Us Section
  console.log('💡 Creating Why Us section...');
  await prisma.whyUs.createMany({
    data: [
      {
        site: 'FLORIDA',
        title: 'Why Choose Diaz Boats',
        description:
          'We provide the best platform for buying and selling boats in Florida with unmatched service and expertise.',
        excellence: '15+ Years',
        boatsSoldPerYear: '500+',
        listingViewed: '2M+',
        buttonText: 'Learn More',
        buttonLink: '/about',
        image1Id: boatImage1.id,
        image2Id: boatImage2.id,
        image3Id: boatImage3.id,
      },
      {
        site: 'JUPITER',
        title: 'Why Choose Jupiter Marine Sales',
        description:
          'We provide the best platform for buying and selling boats in Jupiter with unmatched service and expertise.',
        excellence: '15+ Years',
        boatsSoldPerYear: '500+',
        listingViewed: '2M+',
        buttonText: 'Learn More',
        buttonLink: '/about',
        image1Id: boatImage4.id,
        image2Id: boatImage5.id,
        image3Id: boatImage6.id,
      },
    ],
  });

  // 34. Create Contact Info
  console.log('📱 Creating contact info...');
  // Create separate background images for contact info
  const contactInfoBgFlorida = await prisma.fileInstance.create({
    data: {
      filename: 'contact-info-bg-florida.jpg',
      originalFilename: 'contact-info-bg-florida.jpg',
      path: '/uploads/contact-info/bg-florida.jpg',
      url: 'https://example.com/uploads/contact-info/bg-florida.jpg',
      fileType: 'image',
      mimeType: 'image/jpeg',
      size: 204800,
    },
  });

  const contactInfoBgJupiter = await prisma.fileInstance.create({
    data: {
      filename: 'contact-info-bg-jupiter.jpg',
      originalFilename: 'contact-info-bg-jupiter.jpg',
      path: '/uploads/contact-info/bg-jupiter.jpg',
      url: 'https://example.com/uploads/contact-info/bg-jupiter.jpg',
      fileType: 'image',
      mimeType: 'image/jpeg',
      size: 204800,
    },
  });

  await prisma.contactInfo.createMany({
    data: [
      {
        site: 'FLORIDA',
        address: '123 Marina Drive, Miami, FL 33101',
        email: 'info@diazboats.com',
        phone: '+1 (555) 123-4567',
        workingHours: {
          monday: '9:00 AM - 6:00 PM',
          tuesday: '9:00 AM - 6:00 PM',
          wednesday: '9:00 AM - 6:00 PM',
          thursday: '9:00 AM - 6:00 PM',
          friday: '9:00 AM - 6:00 PM',
          saturday: '10:00 AM - 4:00 PM',
          sunday: 'Closed',
        },
        socialMedia: {
          facebook: 'https://facebook.com/diazboats',
          instagram: 'https://instagram.com/diazboats',
          twitter: 'https://twitter.com/diazboats',
        },
        backgroundImageId: contactInfoBgFlorida.id,
      },
      {
        site: 'JUPITER',
        address: '456 Harbor Boulevard, Jupiter, FL 33458',
        email: 'info@jupitermarinesales.com',
        phone: '+1 (555) 987-6543',
        workingHours: {
          monday: '9:00 AM - 6:00 PM',
          tuesday: '9:00 AM - 6:00 PM',
          wednesday: '9:00 AM - 6:00 PM',
          thursday: '9:00 AM - 6:00 PM',
          friday: '9:00 AM - 6:00 PM',
          saturday: '10:00 AM - 4:00 PM',
          sunday: 'Closed',
        },
        socialMedia: {
          facebook: 'https://facebook.com/jupitermarinesales',
          instagram: 'https://instagram.com/jupitermarinesales',
          twitter: 'https://twitter.com/jupitermarinesales',
        },
        backgroundImageId: contactInfoBgJupiter.id,
      },
    ],
  });

  // 35. Create Contact Us Entries (sample data)
  console.log('💬 Creating contact us entries...');
  await prisma.contactUs.createMany({
    data: [
      {
        fullName: 'Alex Thompson',
        phone: '+1555111222',
        email: 'alex@example.com',
        boatInformation: 'Interested in 35ft yacht',
        comments: 'Looking for a family boat for weekend trips.',
      },
      {
        fullName: 'Rachel Green',
        phone: '+1555333444',
        email: 'rachel@example.com',
        boatInformation: 'Need help selling my boat',
        comments: 'I want to sell my 28ft fishing boat.',
      },
    ],
  });

  // 36. Create Featured Yachts
  console.log('⭐ Creating featured yachts...');
  const activeBoats = await prisma.boats.findMany({
    where: { status: 'ACTIVE' },
  });

  if (activeBoats.length > 0) {
    // Select random boat for FLORIDA site
    const floridaBoatIndex = Math.floor(Math.random() * activeBoats.length);
    const floridaBoat = activeBoats[floridaBoatIndex];

    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

    await prisma.featuredYacht.create({
      data: {
        boatId: floridaBoat.id,
        site: 'FLORIDA',
        featuredAt: now,
        expiresAt: expiresAt,
      },
    });

    console.log(
      `✅ Featured yacht created for FLORIDA: ${floridaBoat.name} (ID: ${floridaBoat.id})`,
    );

    // Select random boat for JUPITER site (try to select different boat)
    let jupiterBoatIndex = Math.floor(Math.random() * activeBoats.length);
    if (activeBoats.length > 1) {
      // Ensure we select a different boat if possible
      while (jupiterBoatIndex === floridaBoatIndex) {
        jupiterBoatIndex = Math.floor(Math.random() * activeBoats.length);
      }
    }
    const jupiterBoat = activeBoats[jupiterBoatIndex];

    await prisma.featuredYacht.create({
      data: {
        boatId: jupiterBoat.id,
        site: 'JUPITER',
        featuredAt: now,
        expiresAt: expiresAt,
      },
    });

    console.log(
      `✅ Featured yacht created for JUPITER: ${jupiterBoat.name} (ID: ${jupiterBoat.id})`,
    );
  } else {
    console.log('⚠️  No active boats found, skipping featured yacht creation');
  }

  console.log('✅ Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
