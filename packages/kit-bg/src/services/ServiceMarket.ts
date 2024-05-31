import {
  backgroundClass,
  backgroundMethod,
} from '@onekeyhq/shared/src/background/backgroundDecorators';
import { EServiceEndpointEnum } from '@onekeyhq/shared/types/endpoint';
import type {
  IMarketCategory,
  IMarketDetailPool,
  IMarketToken,
  IMarketTokenChart,
  IMarketTokenDetail,
} from '@onekeyhq/shared/types/market';

import ServiceBase from './ServiceBase';

const ONEKEY_SEARCH_TRANDING = 'onekey-search-trending';

@backgroundClass()
class ServiceMarket extends ServiceBase {
  constructor({ backgroundApi }: { backgroundApi: any }) {
    super({ backgroundApi });
  }

  @backgroundMethod()
  async fetchCategories(filters = [ONEKEY_SEARCH_TRANDING]) {
    const client = await this.getClient(EServiceEndpointEnum.Utility);
    const response = await client.get<{
      data: IMarketCategory[];
    }>('/utility/v1/market/category/list');
    const { data } = response.data;
    data[0].name = 'Watchlist';
    return filters.length
      ? data.filter((i) => !filters.includes(i.categoryId))
      : data;
  }

  @backgroundMethod()
  async fetchSearchTrending() {
    const categories = await this.fetchCategories([]);
    const searchTrendingCategory = categories.find(
      (i) => i.categoryId === ONEKEY_SEARCH_TRANDING,
    );
    return searchTrendingCategory
      ? this.fetchCategory(
          searchTrendingCategory.categoryId,
          searchTrendingCategory.coingeckoIds,
        )
      : [];
  }

  @backgroundMethod()
  async fetchCategory(
    category: string,
    coingeckoIds: string[],
    sparkline = false,
  ) {
    const requestParams: {
      category: string;
      sparkline: boolean;
      ids?: string;
    } = {
      category,
      sparkline,
    };
    if (coingeckoIds.length) {
      requestParams.ids = encodeURI(coingeckoIds.join(','));
    }
    const client = await this.getClient(EServiceEndpointEnum.Utility);
    const response = await client.get<{
      data: IMarketToken[];
    }>('/utility/v1/market/tokens', {
      params: requestParams,
      paramsSerializer: (params) => {
        const urlSearchParams = new URLSearchParams(params);
        return urlSearchParams.toString();
      },
    });
    const { data } = response.data;
    return data;
  }

  @backgroundMethod()
  async fetchTokenDetail(coingeckoId: string, explorerPlatforms = true) {
    const client = await this.getClient(EServiceEndpointEnum.Utility);
    const response = await client.get<{
      data: IMarketTokenDetail;
    }>('/utility/v1/market/detail', {
      params: {
        id: coingeckoId,
        explorer_platforms: explorerPlatforms,
      },
    });
    const { data } = response.data;
    return data;
  }

  @backgroundMethod()
  async fetchPools(query: string) {
    const client = await this.getClient(EServiceEndpointEnum.Utility);
    try {
      const response = await client.get<{
        data: IMarketDetailPool[];
      }>('/utility/v1/market/pools', {
        params: {
          query,
        },
      });
      const { data } = response.data;
      return data;
    } catch {
      return [];
    }
  }

  @backgroundMethod()
  async fetchTokenChart(coingeckoId: string, days: string, points: number) {
    const client = await this.getClient(EServiceEndpointEnum.Utility);
    const response = await client.get<{
      data: IMarketTokenChart;
    }>('/utility/v1/market/token/chart', {
      params: {
        coingeckoId,
        days,
        points,
      },
    });
    const { data } = response.data;
    return data;
  }

  @backgroundMethod()
  async searchToken(query: string) {
    const client = await this.getClient(EServiceEndpointEnum.Utility);
    const response = await client.get<{
      data: string[];
    }>('/utility/v1/market/search', {
      params: {
        query,
      },
    });
    const { data } = response.data;
    if (data.length) {
      return this.fetchCategory('all', data, false);
    }
    return [];
  }
}

export default ServiceMarket;