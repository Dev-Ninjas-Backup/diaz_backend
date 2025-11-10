import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Shared -- Boats Specification')
@Controller('boats-specification')
export class BoatsSpecificationController {
  constructor() {}
}
