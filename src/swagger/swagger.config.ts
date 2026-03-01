import { DocumentBuilder } from '@nestjs/swagger';

export const SWAGGER_PATH = 'api';

export function buildSwaggerConfig() {
  return new DocumentBuilder()
    .setTitle('Hax Brasil API')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      'bearer',
    )
    .addSecurityRequirements('bearer')
    .build();
}
