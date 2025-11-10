import { Injectable, Logger, OnModuleInit } from '@nestjs/common';

@Injectable()
export class BoatsSpecificationService implements OnModuleInit {
  private readonly logger = new Logger(BoatsSpecificationService.name);

  async onModuleInit() {
    this.logger.log('Seeding Boats Specification Data');

    this.seedMakeData();
    this.seedModelData();
    this.seedFoulTypeData();
    this.seedClassData();
    this.seedMaterialData();
    this.seedConditionData();
  }

  private seedMakeData() {
    this.logger.log('Seeding Boats Specification Data');
  }

  private seedModelData() {
    this.logger.log('Seeding Boats Specification Data');
  }

  private seedFoulTypeData() {
    this.logger.log('Seeding Boats Specification Data');
  }

  private seedClassData() {
    this.logger.log('Seeding Boats Specification Data');
  }

  private seedMaterialData() {
    this.logger.log('Seeding Boats Specification Data');
  }

  private seedConditionData() {
    this.logger.log('Seeding Boats Specification Data');
  }
}
