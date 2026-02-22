import { Type } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { Page } from '../types/page.type';
import { PageInfoDto } from './page-info.dto';

export function PaginationDto<TSource, TItem>(
  itemDto: Type<TItem>,
  mapItem: (item: TSource) => TItem,
) {
  class PaginationResponseDto {
    @ApiProperty({ type: itemDto, isArray: true })
    items: TItem[];

    @ApiProperty({ type: PageInfoDto })
    pageInfo: PageInfoDto;

    constructor(page: Page<TSource>) {
      this.items = page.items.map(mapItem);
      this.pageInfo = new PageInfoDto(page.pageInfo);
    }
  }

  return PaginationResponseDto;
}
