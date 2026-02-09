import request from "@/utils/request-removebg";
import type {
  RemovebgConfig,
  GenerateCodesParams,
  GenerateCodesResult,
  RedemptionCodeQueryParams,
  RedemptionCodeListResult,
  AdjustUserPointsParams,
  PointChangeLogQueryParams,
  PointChangeLogListResult,
  RedemptionLogQueryParams,
  RedemptionLogListResult,
} from "@/types/api";

const ADMIN_BASE_URL = "/api/admin";

const RemovebgAdminAPI = {
  /** 获取系统配置 */
  getConfig() {
    return request<any, RemovebgConfig>({
      url: `${ADMIN_BASE_URL}/config`,
      method: "get",
    });
  },

  /** 更新系统配置 */
  updateConfig(data: RemovebgConfig) {
    return request<any, void>({
      url: `${ADMIN_BASE_URL}/config`,
      method: "put",
      data,
    });
  },

  /** 生成兑换码 */
  generateCodes(data: GenerateCodesParams) {
    return request<any, GenerateCodesResult>({
      url: `${ADMIN_BASE_URL}/redemption-codes/generate`,
      method: "post",
      data,
    });
  },

  /** 查询兑换码列表 */
  getRedemptionCodes(params: RedemptionCodeQueryParams) {
    return request<any, RedemptionCodeListResult>({
      url: `${ADMIN_BASE_URL}/redemption-codes`,
      method: "get",
      params,
    });
  },

  /** 调整用户点数 */
  adjustUserPoints(userId: number, data: AdjustUserPointsParams) {
    return request<any, void>({
      url: `${ADMIN_BASE_URL}/users/${userId}/points`,
      method: "post",
      data,
    });
  },

  /** 查询点数变更日志 */
  getPointChangeLogs(params: PointChangeLogQueryParams) {
    return request<any, PointChangeLogListResult>({
      url: `${ADMIN_BASE_URL}/logs/point-changes`,
      method: "get",
      params,
    });
  },

  /** 查询兑换记录日志 */
  getRedemptionLogs(params: RedemptionLogQueryParams) {
    return request<any, RedemptionLogListResult>({
      url: `${ADMIN_BASE_URL}/logs/redemptions`,
      method: "get",
      params,
    });
  },
};

export default RemovebgAdminAPI;
