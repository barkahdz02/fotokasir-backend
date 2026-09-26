import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiceTypesService } from './service-types.service';
import { ServiceTypesController } from './service-types.controller';
import { ServiceType } from './entities/service-type.entity';
import { ServiceAttribute } from './entities/service-attribute.entity';
import { ServicePrice } from './entities/service-price.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ServiceType, ServiceAttribute, ServicePrice])],
  controllers: [ServiceTypesController],
  providers: [ServiceTypesService],
  exports: [ServiceTypesService],
})
export class ServiceTypesModule {}