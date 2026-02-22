import { ApiProperty } from '@nestjs/swagger';
import { PageInfo } from '../types/page.type';

export class PageInfoDto {
  @ApiProperty()
  page: number;

  @ApiProperty()
  pageSize: number;

  @ApiProperty()
  hasNextPage: boolean;

  constructor(pageInfo: PageInfo) {
    this.page = pageInfo.page;
    this.pageSize = pageInfo.pageSize;
    this.hasNextPage = pageInfo.hasNextPage;
  }
}
