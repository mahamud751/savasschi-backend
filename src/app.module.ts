import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { CategoryModule } from './category/category.module';
import { SubCategoryModule } from './subCategory/subCategory.module';
import { ProductModule } from './products/products.module';
import { BannerModule } from './banner/banner.module';
import { AuditModule } from './audit/audit.module';
import { BlogModule } from './blog/blog.module';
import { AdvanceModule } from './advance/advance.module';
import { DemoModule } from './demo/demo.module';
import { SchoolsModule } from './schools/schools.module';
import { StudentModule } from './students/student.module';
import { VendorModule } from './vendor/vendor.module';
import { FaqModule } from './faq/faq.module';
import { WishlistModule } from './wishlist/wishlist.module';
import { OrderModule } from './order/order.module';
import { DynamicModule } from './dynamic/dynamic.module';
import { ReviewModule } from './review/review.module';
import { NotificationModule } from './notification/notification.module';
import { PermissionModule } from './permission/permission.module';
import { VariantModule } from './variants/variant.module';
import { DiscountModule } from './discount/discount.module';
import { SocketService } from './socket.service';
import { MessagesModule } from './message/message.module';
import { PriceSettingModule } from './priceSetting/price.module';
import { OrderCategoryModule } from './orderCateogory/orderCategory.module';
import { BrandMoudle } from './brand/brand.module';
import { SubOrderModule } from './subOrder/sub-order.module';
import { BusinessBannerModule } from './businessBanner/business-banner.module';
import { PaymentPercentModule } from './paymentPercent/payment-percent.module';
import { ShippingModule } from './shipping/shipping.module';
import { DepartmentModule } from './department/department.module';
import { EmployeeCategoryModule } from './employeeCategory/employee-category.module';
import { CompanyCategoryModule } from './companyCategory/company-category.module';
import { AgoraModule } from './agora/agora.module';
import { ChatModule } from './chat/chat.module';
import { ProjectModule } from './project/project.module';
import { BusinessModule } from './business/business.module';

@Module({
  providers: [SocketService],
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    PrismaModule,
    UsersModule,
    CategoryModule,
    OrderCategoryModule,
    SubCategoryModule,
    ProductModule,
    BannerModule,
    BrandMoudle,
    AuditModule,
    BlogModule,
    AdvanceModule,
    DemoModule,
    SchoolsModule,
    StudentModule,
    VendorModule,
    FaqModule,
    WishlistModule,
    OrderModule,
    DynamicModule,
    ReviewModule,
    NotificationModule,
    PermissionModule,
    VariantModule,
    DiscountModule,
    PriceSettingModule,
    SubOrderModule,
    BusinessBannerModule,
    PaymentPercentModule,
    ShippingModule,
    DepartmentModule,
    EmployeeCategoryModule,
    CompanyCategoryModule,
    AgoraModule,
    ChatModule,
    MessagesModule,
    ProjectModule,
    BusinessModule,
  ],
})
export class AppModule {}
