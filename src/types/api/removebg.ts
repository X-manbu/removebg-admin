/**
 * Removebg 抠图管理模块类型定义
 */

/** 系统配置 */
export interface RemovebgConfig {
  /** 新用户初始点数 */
  initial_points: number;
  /** 单次抠图消耗点数 */
  matting_cost: number;
  /** 兑换码默认有效期天数 */
  redemption_code_default_days: number;
  /** 兑换码默认赠送点数 */
  redemption_code_default_points: number;
}

/** 兑换码生成参数 */
export interface GenerateCodesParams {
  /** 生成数量 */
  count: number;
  /** 赠送点数 */
  points: number;
  /** 批次号 */
  batchNo?: string;
  /** 有效期天数 */
  expiresDays?: number;
  /** 最大使用次数 */
  maxUses?: number;
}

/** 兑换码生成结果 */
export interface GenerateCodesResult {
  /** 生成的兑换码列表 */
  codes: string[];
  /** 生成数量 */
  count: number;
  /** 批次号 */
  batchNo: string;
}

/** 兑换码项 */
export interface RedemptionCodeItem {
  /** ID */
  id: number;
  /** 兑换码 */
  code: string;
  /** 批次号 */
  batch_no: string;
  /** 赠送点数 */
  points: number;
  /** 过期时间 */
  expires_at: string | null;
  /** 最大使用次数 */
  max_uses: number;
  /** 已使用次数 */
  used_count: number;
  /** 状态 */
  status: string;
  /** 元数据 */
  metadata: any;
  /** 创建时间 */
  created_at: string;
  /** 创建人 */
  created_by: number;
}

/** 兑换码查询参数 */
export interface RedemptionCodeQueryParams {
  /** 批次号 */
  batchNo?: string;
  /** 状态 */
  status?: string;
  /** 兑换码模糊搜索 */
  code?: string;
  /** 每页条数 */
  limit?: number;
  /** 偏移量 */
  offset?: number;
}

/** 兑换码列表响应 */
export interface RedemptionCodeListResult {
  /** 总数 */
  total: number;
  /** 数据列表 */
  items: RedemptionCodeItem[];
}

/** 用户点数调整参数 */
export interface AdjustUserPointsParams {
  /** 调整数量 */
  amount: number;
  /** 原因 */
  reason?: string;
}

/** 点数变更日志项 */
export interface PointChangeLogItem {
  /** ID */
  id: number;
  /** 用户ID */
  user_id: number;
  /** 用户UID */
  uid: string;
  /** 变动数量 */
  amount: number;
  /** 变动后余额 */
  balance_after: number;
  /** 原因 */
  reason: string;
  /** 关联ID */
  related_id: number | null;
  /** 创建时间 */
  created_at: string;
}

/** 点数变更日志查询参数 */
export interface PointChangeLogQueryParams {
  /** 用户ID */
  userId?: number;
  /** 用户UID */
  uid?: string;
  /** 变动原因 */
  reason?: string;
  /** 每页条数 */
  limit?: number;
  /** 偏移量 */
  offset?: number;
}

/** 点数变更日志列表响应 */
export interface PointChangeLogListResult {
  /** 总数 */
  total: number;
  /** 数据列表 */
  items: PointChangeLogItem[];
}

/** 兑换记录日志项 */
export interface RedemptionLogItem {
  /** ID */
  id: number;
  /** 兑换码ID */
  code_id: number;
  /** 用户ID */
  user_id: number;
  /** 获得点数 */
  points: number;
  /** IP地址 */
  ip_address: string;
  /** User-Agent */
  user_agent: string;
  /** 创建时间 */
  created_at: string;
  /** 兑换码 */
  code: string;
  /** 批次号 */
  batch_no: string;
  /** 用户昵称 */
  nickname: string;
  /** 用户头像 */
  avatar_url: string;
}

/** 兑换记录查询参数 */
export interface RedemptionLogQueryParams {
  /** 兑换码ID */
  codeId?: number;
  /** 用户ID */
  userId?: number;
  /** 每页条数 */
  limit?: number;
  /** 偏移量 */
  offset?: number;
}

/** 兑换记录列表响应 */
export interface RedemptionLogListResult {
  /** 总数 */
  total: number;
  /** 数据列表 */
  items: RedemptionLogItem[];
}
